import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Check ---');
  try {
    const timeSlotsCount = await prisma.timeSlot.count();
    console.log(`TimeSlot: ${timeSlotsCount} rows`);

    const classroomsCount = await prisma.classroom.count();
    console.log(`Classroom: ${classroomsCount} rows`);

    const teachersCount = await prisma.teacher.count();
    console.log(`Teacher: ${teachersCount} rows`);

    const academicPeriodsCount = await prisma.academicPeriod.count();
    console.log(`AcademicPeriod: ${academicPeriodsCount} rows`);

    const coursesCount = await prisma.course.count();
    console.log(`Course: ${coursesCount} rows`);

    if (timeSlotsCount > 0) {
      const sample = await prisma.timeSlot.findFirst();
      console.log('Sample TimeSlot:', sample);
    }
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
