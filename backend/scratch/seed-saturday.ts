import { PrismaClient, DayOfWeek } from '@prisma/client';

const prisma = new PrismaClient();

const SAT_BLOCKS = [
  { id: 'slot-sat-1', start: '07:00:00', end: '08:30:00', order: 1 },
  { id: 'slot-sat-2', start: '08:40:00', end: '10:10:00', order: 2 },
  { id: 'slot-sat-3', start: '10:20:00', end: '11:50:00', order: 3 },
  { id: 'slot-sat-4', start: '12:00:00', end: '13:30:00', order: 4 },
  { id: 'slot-sat-5', start: '14:00:00', end: '15:30:00', order: 5 },
  { id: 'slot-sat-6', start: '15:40:00', end: '17:10:00', order: 6 },
  { id: 'slot-sat-7', start: '17:20:00', end: '18:50:00', order: 7 },
  { id: 'slot-sat-8', start: '19:00:00', end: '20:30:00', order: 8 },
  { id: 'slot-sat-9', start: '20:40:00', end: '22:10:00', order: 9 },
];

async function main() {
  console.log('--- Seeding Saturday TimeSlots ---');
  try {
    const existingSatSlots = await prisma.timeSlot.count({
      where: { dayOfWeek: DayOfWeek.SATURDAY }
    });

    console.log(`Current Saturday slots in DB: ${existingSatSlots}`);

    if (existingSatSlots === 0) {
      console.log('No Saturday slots found. Seeding them now...');
      
      for (const block of SAT_BLOCKS) {
        // We construct proper Date objects for TimeOfDay representation in Prisma (UTC 1970-01-01)
        const startTime = new Date(`1970-01-01T${block.start}Z`);
        const endTime = new Date(`1970-01-01T${block.end}Z`);

        await prisma.timeSlot.create({
          data: {
            id: block.id,
            dayOfWeek: DayOfWeek.SATURDAY,
            startTime,
            endTime,
            slotOrder: block.order,
            isActive: true,
          }
        });
        console.log(`Created slot: ${block.id}`);
      }
      
      console.log('Saturday slots seeded successfully!');
    } else {
      console.log('Saturday slots are already present in the database.');
    }
  } catch (error) {
    console.error('Error seeding Saturday slots:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
