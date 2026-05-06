import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const CSP_SERVICE_URL = process.env.CSP_SERVICE_URL || "http://localhost:8002";

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
      }, {} as Record<string, any[]>)
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

    const result: any = await response.json();

    // 3. Process the result and store assignments
    const enrichedAssignments = (result.assignments || []).map((assignment: any) => {
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

    res.json({ 
      success: true, 
      status: result.status, 
      assignments: enrichedAssignments, 
      conflicts: result.conflicts 
    });
  } catch (error) {
    console.error("Solver Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export { router as solverRouter };
