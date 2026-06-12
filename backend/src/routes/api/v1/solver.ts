import { Router, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { prisma } from "../../../lib/prisma.js";
import { cuentaHuecos, pctReduccion } from "../../../lib/gapMetrics.js";

interface CspTimeSlot {
  day: number;
  start_minute: number;
  end_minute: number;
}

interface CspAssignment {
  course_id: string;
  teacher_id: string;
  classroom_id: string;
  slot: CspTimeSlot;
}

interface CspSolveResponse {
  status: "OPTIMAL" | "FEASIBLE" | "INFEASIBLE" | "TIMEOUT";
  assignments: CspAssignment[];
  elapsed_seconds: number;
  conflicts?: string[];
  huecos_baseline?: number | null;
  huecos_optimizado?: number | null;
}

const router = Router();

const CSP_SERVICE_URL = process.env.CSP_SERVICE_URL || "http://localhost:8002";

// Mapeo del slot sintetico del CSP a la fila TimeSlot persistida.
const START_MINUTE_TO_SLOT_ORDER: Record<number, number> = {
  420: 1, 520: 2, 620: 3, 720: 4, 840: 5, 940: 6, 1040: 7, 1140: 8, 1240: 9,
};
const DAY_NUM_TO_ENUM: Record<number, string> = {
  1: "MONDAY", 2: "TUESDAY", 3: "WEDNESDAY", 4: "THURSDAY", 5: "FRIDAY", 6: "SATURDAY",
};

// Ejecuta promesas en lotes para no abrir cientos de conexiones a la vez
// contra Supabase (que ademas dispararia el timeout de transaccion).
async function inChunks<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    out.push(...(await Promise.all(batch.map(fn))));
  }
  return out;
}

// Persiste el resultado del CSP en el modelo normalizado
// (TeachingSchedule -> SectionAssignment -> SectionAssignmentSlot) para que
// docentes/estudiantes vean el horario. Reemplaza el horario previo del periodo.
//
// Los upserts de oferta/seccion (idempotentes) se hacen FUERA de la
// transaccion interactiva; la parte atomica usa createMany en lote. Esto
// evita el P2028 "Transaction already closed" por exceso de round-trips.
async function persistSchedule(
  academicPeriodId: string,
  assignments: CspAssignment[],
  classrooms: { id: string; capacity: number }[],
): Promise<void> {
  const timeSlots = await prisma.timeSlot.findMany({
    select: { id: true, dayOfWeek: true, slotOrder: true },
  });
  const tsByDayOrder = new Map(
    timeSlots.map((t) => [`${t.dayOfWeek}|${t.slotOrder}`, t.id]),
  );

  const byCourse = new Map<string, CspAssignment[]>();
  for (const a of assignments) {
    const list = byCourse.get(a.course_id);
    if (list) list.push(a);
    else byCourse.set(a.course_id, [a]);
  }

  // 1. Oferta + seccion por curso (idempotente, fuera de transaccion).
  const groups = [...byCourse.entries()];
  const sectionByCourse = new Map<string, string>();
  await inChunks(groups, 8, async ([courseId, group]) => {
    const offering = await prisma.courseOffering.upsert({
      where: { academicPeriodId_courseId: { academicPeriodId, courseId } },
      create: { academicPeriodId, courseId, status: "ACTIVE" },
      update: {},
    });
    const caps = group.map(
      (g) => classrooms.find((c) => c.id === g.classroom_id)?.capacity ?? 30,
    );
    const section = await prisma.courseSection.upsert({
      where: {
        courseOfferingId_sectionCode: {
          courseOfferingId: offering.id,
          sectionCode: "U1",
        },
      },
      create: {
        courseOfferingId: offering.id,
        sectionCode: "U1",
        vacancyLimit: Math.max(30, ...caps),
        status: "ACTIVE",
      },
      update: {},
    });
    sectionByCourse.set(courseId, section.id);
  });

  // 2. Reemplazar el horario del periodo (cascade limpia assignments/slots).
  await prisma.teachingSchedule.deleteMany({ where: { academicPeriodId } });
  const schedule = await prisma.teachingSchedule.create({
    data: { academicPeriodId, status: "CONFIRMED" },
  });

  // 3. Armar filas en memoria. Dedup para no violar los UNIQUE
  // (schedule,teacher,timeSlot) / (schedule,classroom,timeSlot).
  const usedTeacherTs = new Set<string>();
  const usedClassroomTs = new Set<string>();
  const assignmentRows: {
    id: string;
    teachingScheduleId: string;
    sectionId: string;
    teacherId: string;
    classroomId: string;
    assignmentStatus: string;
  }[] = [];
  const slotRows: {
    sectionAssignmentId: string;
    teachingScheduleId: string;
    sectionId: string;
    teacherId: string;
    classroomId: string;
    timeSlotId: string;
  }[] = [];

  for (const [courseId, group] of groups) {
    const sectionId = sectionByCourse.get(courseId);
    const first = group[0];
    if (!sectionId || !first) continue;

    const sectionAssignmentId = randomUUID();
    let hasSlot = false;

    for (const g of group) {
      const order = START_MINUTE_TO_SLOT_ORDER[g.slot.start_minute];
      const dayEnum = DAY_NUM_TO_ENUM[g.slot.day];
      if (!order || !dayEnum) continue;
      const timeSlotId = tsByDayOrder.get(`${dayEnum}|${order}`);
      if (!timeSlotId) continue;

      const tKey = `${g.teacher_id}|${timeSlotId}`;
      const cKey = `${g.classroom_id}|${timeSlotId}`;
      if (usedTeacherTs.has(tKey) || usedClassroomTs.has(cKey)) continue;
      usedTeacherTs.add(tKey);
      usedClassroomTs.add(cKey);

      slotRows.push({
        sectionAssignmentId,
        teachingScheduleId: schedule.id,
        sectionId,
        teacherId: g.teacher_id,
        classroomId: g.classroom_id,
        timeSlotId,
      });
      hasSlot = true;
    }

    if (!hasSlot) continue;
    assignmentRows.push({
      id: sectionAssignmentId,
      teachingScheduleId: schedule.id,
      sectionId,
      teacherId: first.teacher_id,
      classroomId: first.classroom_id,
      assignmentStatus: "CONFIRMED",
    });
  }

  // 4. Inserciones masivas atomicas (2 round-trips).
  if (assignmentRows.length > 0) {
    await prisma.$transaction([
      prisma.sectionAssignment.createMany({
        data: assignmentRows,
        skipDuplicates: true,
      }),
      prisma.sectionAssignmentSlot.createMany({
        data: slotRows,
        skipDuplicates: true,
      }),
    ]);
  }
}

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { academicPeriodId } = req.body;

    let period;
    if (academicPeriodId) {
      period = await prisma.academicPeriod.findUnique({ where: { id: academicPeriodId } });
    } else {
      period = await prisma.academicPeriod.findFirst({ where: { isActive: true } });
    }

    if (!period) {
      return res.status(404).json({ error: "Academic period not found" });
    }

    const actualPeriodId = period.id;

    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        teacherCourses: { include: { teacher: true } },
      }
    });

    const teachers = await prisma.teacher.findMany({ 
      where: { isActive: true },
      include: {
        availability: {
          where: { isAvailable: true },
          include: { timeSlot: true }
        }
      }
    });
    const classrooms = await prisma.classroom.findMany({ where: { isActive: true } });
    
    // Transform into the format expected by Python CSP service
    // This requires detailed mapping. For now, we prepare the base payload structure.
    // The exact format should match SolveRequest schema in Python.
    
    const payload = {
      period_id: actualPeriodId,
      timeout_seconds: 30,
      courses: courses.map(c => ({
        id: c.id,
        name: c.name,
        credits: c.credits,
        teacher_ids: c.teacherCourses.map(tc => tc.teacherId),
        classroom_ids: classrooms.filter(cr => cr.roomType === c.requiredRoomType || cr.roomType === "GENERAL").map(cr => cr.id),
        // Bloques de 1 hora y media (90 minutos) con soporte de Lunes a Sábado (Días 1 a 6)
        available_slots: [1, 2, 3, 4, 5, 6].flatMap(day => [
          { day, start_minute: 420, end_minute: 510 }, // 07:00-08:30 (Bloque 1)
          { day, start_minute: 520, end_minute: 610 }, // 08:40-10:10 (Bloque 2)
          { day, start_minute: 620, end_minute: 710 }, // 10:20-11:50 (Bloque 3)
          { day, start_minute: 720, end_minute: 810 }, // 12:00-13:30 (Bloque 4)
          { day, start_minute: 840, end_minute: 930 }, // 14:00-15:30 (Bloque 5)
          { day, start_minute: 940, end_minute: 1030 }, // 15:40-17:10 (Bloque 6)
          { day, start_minute: 1040, end_minute: 1130 }, // 17:20-18:50 (Bloque 7)
          { day, start_minute: 1140, end_minute: 1230 }, // 19:00-20:30 (Bloque 8)
          { day, start_minute: 1240, end_minute: 1330 }, // 20:40-22:10 (Bloque 9)
        ]) 
      })),
      // Docentes NOMBRADO: el solver pesa mas sus huecos para compactar su horario.
      nombrado_teacher_ids: teachers
        .filter((t) => t.appointmentType === "NOMBRADO")
        .map((t) => t.id),
      teacher_availabilities: teachers.reduce((acc, t) => {
        if (t.availability && t.availability.length > 0) {
          acc[t.id] = t.availability.map(a => {
            const dStart = new Date(a.timeSlot.startTime);
            const dEnd = new Date(a.timeSlot.endTime);
            const dayMap: Record<string, number> = {
              MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 7
            };
            return {
              day: dayMap[a.timeSlot.dayOfWeek as string] || 1,
              start_minute: dStart.getUTCHours() * 60 + dStart.getUTCMinutes(),
              end_minute: dEnd.getUTCHours() * 60 + dEnd.getUTCMinutes()
            };
          });
        }
        return acc;
      }, {} as Record<string, CspTimeSlot[]>)
    };

    // 2. Call Python CSP Service
    const response = await fetch(`${CSP_SERVICE_URL}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: "CSP Service Error", details: errorText });
    }

    const result = await response.json() as CspSolveResponse;

    // 2b. Persistir el horario para que docentes/estudiantes lo vean.
    // No bloquea la respuesta si la persistencia falla.
    if (result.assignments && result.assignments.length > 0) {
      try {
        await persistSchedule(actualPeriodId, result.assignments, classrooms);
      } catch (persistErr) {
        console.error("Error persistiendo el horario generado:", persistErr);
      }
    }

    // 3. Process the result and store assignments
    const enrichedAssignments = (result.assignments ?? []).map((assignment) => {
      const course = courses.find(c => c.id === assignment.course_id);
      const teacher = teachers.find(t => t.id === assignment.teacher_id);
      const classroom = classrooms.find(cr => cr.id === assignment.classroom_id);
      return {
        ...assignment,
        course_name: course ? course.name : "Desconocido",
        teacher_name: teacher ? teacher.fullName : "Desconocido",
        classroom_name: classroom ? classroom.name : "Desconocida"
      };
    });

    // Metricas de huecos: baseline (1ra solucion factible) vs optimizada.
    // El conteo optimizado se reverifica en Node a partir de las asignaciones
    // (no se confia ciegamente en el numero del solver).
    const huecosOptimizado = cuentaHuecos(
      (result.assignments ?? []).map((a) => ({
        teacher_id: a.teacher_id,
        slot: { day: a.slot.day, start_minute: a.slot.start_minute },
      })),
    );
    const huecosBaseline = result.huecos_baseline ?? null;

    res.json({
      success: true,
      status: result.status,
      assignments: enrichedAssignments,
      conflicts: result.conflicts,
      huecos: {
        baseline: huecosBaseline,
        optimizado: huecosOptimizado,
        pct_reduccion: pctReduccion(huecosBaseline, huecosOptimizado),
      },
    });
  } catch (error) {
    console.error("Solver Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export { router as solverRouter };
