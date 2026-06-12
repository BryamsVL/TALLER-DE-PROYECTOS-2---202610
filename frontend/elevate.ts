import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const columns = await prisma.$queryRawUnsafe(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema='public' 
        AND table_name IN ('time_slots', 'courses', 'teachers', 'classrooms', 'carreras')
      ORDER BY table_name, ordinal_position
    `);
    console.log("Columnas de tablas:", columns);
  } catch (error) {
    console.error("Error consultando columnas:", error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
