import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const seedFilePath = path.join(__dirname, "seed.sql");
  console.log(`\n📂 Leyendo archivo seed: ${seedFilePath}`);

  if (!fs.existsSync(seedFilePath)) {
    throw new Error(`❌ El archivo seed.sql no existe en: ${seedFilePath}`);
  }

  const sqlContent = fs.readFileSync(seedFilePath, "utf8");

  // Limpiar comentarios de bloque (/* ... */) y comentarios de línea (-- ...)
  const cleanSql = sqlContent
    .replace(/\/\*[\s\S]*?\*\//g, "") // Eliminar comentarios /* ... */
    .split("\n")
    .map((line) => line.split("--")[0]) // Eliminar comentarios de línea -- ...
    .join("\n");

  // Separar consultas por punto y coma (;)
  const queries = cleanSql
    .split(";")
    .map((q) => q.trim())
    .filter((q) => q.length > 0);

  console.log(`⚡ Se encontraron ${queries.length} consultas individuales en el script. Inyectando...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const preview = query.split("\n")[0].trim().substring(0, 80);
    
    try {
      await prisma.$executeRawUnsafe(query);
      console.log(`✅ [${i + 1}/${queries.length}] Éxito: "${preview}..."`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ [${i + 1}/${queries.length}] Falló: "${preview}..."`);
      console.error(`   Error details: ${error.message || error}`);
      failCount++;
    }
  }

  console.log(`\n🎉 Inyección de datos finalizada.`);
  console.log(`📊 Resumen: ${successCount} consultas exitosas, ${failCount} fallidas.\n`);
}

main()
  .catch((err) => {
    console.error("💥 Ocurrió un error crítico durante el sembrado de base de datos:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
