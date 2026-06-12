/**
 * Seed script: Crea los 9 bloques horarios del SÁBADO en la base de datos.
 * Ejecutar desde: web/ con `npx tsx scripts/seed-saturday-slots.ts`
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAT_BLOCKS = [
  { id: "slot-sat-1", start: "07:00:00", end: "08:30:00", order: 1 },
  { id: "slot-sat-2", start: "08:40:00", end: "10:10:00", order: 2 },
  { id: "slot-sat-3", start: "10:20:00", end: "11:50:00", order: 3 },
  { id: "slot-sat-4", start: "12:00:00", end: "13:30:00", order: 4 },
  { id: "slot-sat-5", start: "14:00:00", end: "15:30:00", order: 5 },
  { id: "slot-sat-6", start: "15:40:00", end: "17:10:00", order: 6 },
  { id: "slot-sat-7", start: "17:20:00", end: "18:50:00", order: 7 },
  { id: "slot-sat-8", start: "19:00:00", end: "20:30:00", order: 8 },
  { id: "slot-sat-9", start: "20:40:00", end: "22:10:00", order: 9 },
];

async function main() {
  console.log("📅 Seeding SATURDAY time slots...\n");

  const existing = await prisma.timeSlot.count({
    where: { dayOfWeek: "SATURDAY" },
  });

  console.log(`Slots de sábado existentes: ${existing}`);

  if (existing > 0) {
    console.log("✅ Ya existen slots de sábado. Eliminando para re-crear limpios...");
    await prisma.timeSlot.deleteMany({ where: { dayOfWeek: "SATURDAY" } });
  }

  for (const block of SAT_BLOCKS) {
    const startTime = new Date(`1970-01-01T${block.start}Z`);
    const endTime = new Date(`1970-01-01T${block.end}Z`);

    await prisma.timeSlot.upsert({
      where: { id: block.id },
      update: { dayOfWeek: "SATURDAY", startTime, endTime, slotOrder: block.order, isActive: true },
      create: { id: block.id, dayOfWeek: "SATURDAY", startTime, endTime, slotOrder: block.order, isActive: true },
    });

    console.log(`✅ Creado slot-sat-${block.order} (${block.start} - ${block.end})`);
  }

  const total = await prisma.timeSlot.count({ where: { dayOfWeek: "SATURDAY" } });
  console.log(`\n🎉 Sábado listo: ${total} bloques disponibles en la BD.`);
}

main()
  .catch((e) => {
    console.error("💥 Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
