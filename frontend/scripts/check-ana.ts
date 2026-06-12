import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const teachers = await prisma.teacher.findMany({ 
      where: { fullName: { contains: "Ana Torres" } },
      include: {
        availability: {
          where: { isAvailable: true },
          include: { timeSlot: true }
        }
      }
    });

    console.dir(teachers, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
