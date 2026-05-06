import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();
const CSP_SERVICE_URL = process.env.CSP_SERVICE_URL || "http://localhost:8001";

router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("Limpiando datos de prueba...");
    await prisma.academicPeriod.deleteMany({ where: { name: "TEST-2026-1" } });
    await prisma.course.deleteMany({ where: { code: { in: ["TEST101", "TEST102"] } } });
    await prisma.teacher.deleteMany({ where: { code: { in: ["T-101", "T-102"] } } });
    await prisma.classroom.deleteMany({ where: { name: { in: ["A-101", "A-102"] } } });

    console.log("Insertando datos de prueba...");
    const period = await prisma.academicPeriod.create({
      data: { name: "TEST-2026-1", code: "T-2026-1", startsAt: new Date(), endsAt: new Date(), isActive: true }
    });

    // 2. Crear aulas
    const room1 = await prisma.classroom.create({ data: { name: "A-101", code: "A101", capacity: 40, roomType: "GENERAL" } });
    const room2 = await prisma.classroom.create({ data: { name: "A-102", code: "A102", capacity: 40, roomType: "LAB" } });

    // 3. Crear docentes
    const teacher1 = await prisma.teacher.create({ data: { fullName: "Juan Perez", code: "T-101", specialty: "Math" } });
    const teacher2 = await prisma.teacher.create({ data: { fullName: "Maria Gomez", code: "T-102", specialty: "Physics" } });

    // 4. Crear cursos y asignarlos a docentes
    const course1 = await prisma.course.create({ data: { code: "TEST101", name: "Matemáticas Básicas", credits: 3, cycle: 1, weeklyHours: 4, requiredRoomType: "GENERAL" } });
    const course2 = await prisma.course.create({ data: { code: "TEST102", name: "Laboratorio Física", credits: 2, cycle: 1, weeklyHours: 2, requiredRoomType: "LAB" } });

    await prisma.teacherCourse.create({ data: { teacherId: teacher1.id, courseId: course1.id } });
    await prisma.teacherCourse.create({ data: { teacherId: teacher2.id, courseId: course2.id } });

    console.log("Llamando a CSP...");

    // Payload simplificado usando los datos creados
    const payload = {
      period_id: period.id,
      timeout_seconds: 15, // Test rápido
      courses: [
        {
          id: course1.id,
          name: course1.name,
          credits: course1.credits,
          teacher_ids: [teacher1.id],
          classroom_ids: [room1.id, room2.id],
          available_slots: [
            { day: 1, start_minute: 480, end_minute: 720 }, // Lunes 8am - 12pm
            { day: 2, start_minute: 480, end_minute: 720 }, // Martes 8am - 12pm
          ]
        },
        {
          id: course2.id,
          name: course2.name,
          credits: course2.credits,
          teacher_ids: [teacher2.id],
          classroom_ids: [room2.id],
          available_slots: [
            { day: 3, start_minute: 480, end_minute: 720 }, // Miercoles 8am - 12pm
          ]
        }
      ]
    };

    const response = await fetch(`${CSP_SERVICE_URL}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: "Error del motor Python", details: errorText });
    }

    const result = await response.json();
    res.json(result);

  } catch (error: any) {
    console.error("Test Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export { router as testRouter };
