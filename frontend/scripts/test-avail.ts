import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const teachers = await prisma.teacher.findMany({ 
      where: { isActive: true },
      include: {
        availability: {
          where: { isAvailable: true },
          include: { timeSlot: true }
        }
      }
    });

    const teacher_availabilities = teachers.reduce((acc, t) => {
        if (t.availability && t.availability.length > 0) {
          acc[t.id] = t.availability.map(a => {
            const dStart = new Date(a.timeSlot.startTime);
            const dEnd = new Date(a.timeSlot.endTime);
            const dayMap: Record<string, number> = {
              LUNES: 1, MARTES: 2, MIERCOLES: 3, JUEVES: 4, VIERNES: 5, SABADO: 6, DOMINGO: 7
            };
            return {
              day_string: a.timeSlot.dayOfWeek,
              day: dayMap[a.timeSlot.dayOfWeek as string] || 1,
              start_minute: dStart.getUTCHours() * 60 + dStart.getUTCMinutes(),
              end_minute: dEnd.getUTCHours() * 60 + dEnd.getUTCMinutes(),
              start_local: dStart.getHours() * 60 + dStart.getMinutes(),
              raw: a.timeSlot.startTime
            };
          });
        }
        return acc;
    }, {} as Record<string, any[]>);

    console.log(JSON.stringify(teacher_availabilities, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
