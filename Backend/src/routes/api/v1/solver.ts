import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const CSP_SERVICE_URL = process.env.CSP_SERVICE_URL || "http://localhost:8001";

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

    const teachers = await prisma.teacher.findMany({ where: { isActive: true } });
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
        // Bloques reales de la universidad (Turno Mañana, Tarde, Noche)
        available_slots: [1, 2, 3, 4, 5].flatMap(day => [
          { day, start_minute: 420, end_minute: 510 }, // 7:00-8:30
          { day, start_minute: 520, end_minute: 610 }, // 8:40-10:10
          { day, start_minute: 620, end_minute: 710 }, // 10:20-11:50
          { day, start_minute: 720, end_minute: 780 }, // 12:00-13:00
          { day, start_minute: 840, end_minute: 930 }, // 14:00-15:30
          { day, start_minute: 940, end_minute: 1030 }, // 15:40-17:10
          { day, start_minute: 1040, end_minute: 1130 }, // 17:20-18:50
          { day, start_minute: 1140, end_minute: 1230 }, // 19:00-20:30
          { day, start_minute: 1240, end_minute: 1330 }, // 20:40-22:10
        ]) 
      }))
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

    const result = await response.json();

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
