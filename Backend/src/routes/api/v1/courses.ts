import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all courses
router.get("/", async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teacherCourses: { include: { teacher: true } },
      }
    });
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a course
router.post("/", async (req: Request, res: Response) => {
  try {
    const { code, name, credits, cycle, weeklyHours, requiredRoomType } = req.body;
    const newCourse = await prisma.course.create({
      data: {
        code,
        name,
        credits,
        cycle,
        weeklyHours,
        requiredRoomType,
      }
    });
    res.status(201).json(newCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export { router as coursesRouter };
