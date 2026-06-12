import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando inyección de cursos extras...\n");

  // 1. Eliminar cursos duplicados conocidos (mismo nombre, código diferente)
  const duplicatesToRemove = ["MAT-101", "SIS-301"];
  const deleted = await prisma.course.deleteMany({
    where: { code: { in: duplicatesToRemove } },
  });
  console.log(`🗑️  Eliminados ${deleted.count} cursos duplicados: ${duplicatesToRemove.join(", ")}`);

  // 2. Obtener todos los códigos existentes de una sola consulta
  const existingCodes = new Set(
    (await prisma.course.findMany({ select: { code: true } })).map((c) => c.code)
  );
  console.log(`📦 Cursos existentes en BD: ${existingCodes.size}`);

  // 3. Obtener profesores disponibles
  const teachers = await prisma.teacher.findMany({ select: { id: true } });
  if (teachers.length === 0) throw new Error("❌ No hay profesores. Crea al menos uno primero.");

  // 4. Definir los 80 cursos a agregar (códigos únicos garantizados)
  const catalog = [
    // Ciclo 1
    { code: "MAT-102", name: "Cálculo II", cycle: 1, credits: 4, hours: 4, room: "GENERAL" },
    { code: "MAT-201", name: "Álgebra Lineal", cycle: 2, credits: 4, hours: 4, room: "GENERAL" },
    { code: "MAT-202", name: "Estadística I", cycle: 2, credits: 3, hours: 3, room: "GENERAL" },
    { code: "MAT-301", name: "Estadística II", cycle: 3, credits: 3, hours: 3, room: "GENERAL" },
    { code: "MAT-302", name: "Ecuaciones Diferenciales", cycle: 3, credits: 4, hours: 4, room: "GENERAL" },
    { code: "MAT-401", name: "Matemáticas Discretas", cycle: 4, credits: 3, hours: 3, room: "GENERAL" },
    { code: "MAT-402", name: "Cálculo Numérico", cycle: 4, credits: 3, hours: 3, room: "LAB" },
    // Computación / Sistemas
    { code: "CS-102", name: "Programación Orientada a Objetos", cycle: 2, credits: 4, hours: 4, room: "LAB" },
    { code: "CS-103", name: "Algoritmos y Complejidad", cycle: 2, credits: 4, hours: 4, room: "GENERAL" },
    { code: "CS-202", name: "Sistemas Operativos", cycle: 3, credits: 4, hours: 4, room: "LAB" },
    { code: "CS-203", name: "Redes de Computadoras", cycle: 3, credits: 3, hours: 3, room: "LAB" },
    { code: "CS-302", name: "Bases de Datos II", cycle: 4, credits: 3, hours: 3, room: "LAB" },
    { code: "CS-303", name: "Arquitectura de Computadoras", cycle: 4, credits: 3, hours: 3, room: "GENERAL" },
    { code: "CS-401", name: "Desarrollo Web", cycle: 4, credits: 4, hours: 4, room: "LAB" },
    { code: "CS-402", name: "Seguridad Informática", cycle: 5, credits: 3, hours: 3, room: "LAB" },
    { code: "CS-501", name: "Aprendizaje Automático", cycle: 5, credits: 4, hours: 4, room: "LAB" },
    { code: "CS-502", name: "Visión por Computadora", cycle: 6, credits: 3, hours: 3, room: "LAB" },
    { code: "CS-503", name: "Minería de Datos", cycle: 6, credits: 3, hours: 3, room: "LAB" },
    { code: "CS-601", name: "Computación en la Nube", cycle: 6, credits: 3, hours: 3, room: "LAB" },
    { code: "CS-602", name: "Desarrollo Móvil", cycle: 7, credits: 4, hours: 4, room: "LAB" },
    { code: "CS-603", name: "Ciberseguridad Avanzada", cycle: 7, credits: 3, hours: 3, room: "LAB" },
    { code: "CS-701", name: "Procesamiento de Lenguaje Natural", cycle: 8, credits: 3, hours: 3, room: "LAB" },
    { code: "CS-702", name: "Blockchain y Tecnologías Distribuidas", cycle: 8, credits: 3, hours: 3, room: "GENERAL" },
    // Ingeniería General
    { code: "ING-101", name: "Introducción a la Ingeniería", cycle: 1, credits: 2, hours: 2, room: "GENERAL" },
    { code: "ING-201", name: "Circuitos Eléctricos", cycle: 2, credits: 4, hours: 4, room: "LAB" },
    { code: "ING-202", name: "Termodinámica", cycle: 2, credits: 3, hours: 3, room: "GENERAL" },
    { code: "ING-301", name: "Mecánica de Fluidos", cycle: 3, credits: 3, hours: 3, room: "LAB" },
    { code: "ING-302", name: "Resistencia de Materiales", cycle: 3, credits: 4, hours: 4, room: "GENERAL" },
    { code: "ING-401", name: "Mecatrónica", cycle: 4, credits: 4, hours: 4, room: "LAB" },
    { code: "ING-402", name: "Control Automático", cycle: 4, credits: 3, hours: 3, room: "LAB" },
    { code: "ING-501", name: "Robótica Industrial", cycle: 5, credits: 4, hours: 4, room: "LAB" },
    { code: "ING-502", name: "Diseño CAD/CAM", cycle: 5, credits: 3, hours: 3, room: "LAB" },
    // Ciencias
    { code: "CIE-101", name: "Física I - Mecánica", cycle: 1, credits: 4, hours: 4, room: "GENERAL" },
    { code: "CIE-102", name: "Física II - Electromagnetismo", cycle: 2, credits: 4, hours: 4, room: "GENERAL" },
    { code: "CIE-201", name: "Química General", cycle: 1, credits: 3, hours: 3, room: "LAB" },
    { code: "CIE-202", name: "Biología Celular", cycle: 2, credits: 3, hours: 3, room: "LAB" },
    { code: "CIE-301", name: "Física Cuántica", cycle: 5, credits: 3, hours: 3, room: "GENERAL" },
    { code: "CIE-401", name: "Ciencias del Ambiente", cycle: 3, credits: 2, hours: 2, room: "GENERAL" },
    // Economía / Gestión
    { code: "ECO-101", name: "Economía General", cycle: 1, credits: 3, hours: 3, room: "GENERAL" },
    { code: "ECO-201", name: "Microeconomía", cycle: 2, credits: 3, hours: 3, room: "GENERAL" },
    { code: "ECO-202", name: "Macroeconomía", cycle: 3, credits: 3, hours: 3, room: "GENERAL" },
    { code: "ECO-301", name: "Finanzas Corporativas", cycle: 4, credits: 3, hours: 3, room: "GENERAL" },
    { code: "ECO-401", name: "Economía Digital", cycle: 5, credits: 3, hours: 3, room: "GENERAL" },
    { code: "GES-101", name: "Administración de Empresas", cycle: 2, credits: 3, hours: 3, room: "GENERAL" },
    { code: "GES-201", name: "Gestión de Proyectos", cycle: 3, credits: 3, hours: 3, room: "GENERAL" },
    { code: "GES-301", name: "Emprendimiento e Innovación", cycle: 4, credits: 2, hours: 2, room: "GENERAL" },
    { code: "GES-401", name: "Liderazgo Organizacional", cycle: 5, credits: 2, hours: 2, room: "GENERAL" },
    // Humanidades / Transversales
    { code: "HUM-101", name: "Comunicación Oral y Escrita", cycle: 1, credits: 2, hours: 2, room: "GENERAL" },
    { code: "HUM-102", name: "Ética Profesional", cycle: 2, credits: 2, hours: 2, room: "GENERAL" },
    { code: "HUM-201", name: "Inglés Técnico I", cycle: 1, credits: 3, hours: 3, room: "GENERAL" },
    { code: "HUM-202", name: "Inglés Técnico II", cycle: 2, credits: 3, hours: 3, room: "GENERAL" },
    { code: "HUM-301", name: "Filosofía de la Ciencia", cycle: 4, credits: 2, hours: 2, room: "GENERAL" },
    { code: "HUM-401", name: "Historia de la Tecnología", cycle: 5, credits: 2, hours: 2, room: "GENERAL" },
    // Tecnología
    { code: "TEC-101", name: "Fundamentos de Electrónica", cycle: 2, credits: 3, hours: 3, room: "LAB" },
    { code: "TEC-201", name: "Programación en Python", cycle: 2, credits: 3, hours: 3, room: "LAB" },
    { code: "TEC-202", name: "Programación en C++", cycle: 3, credits: 3, hours: 3, room: "LAB" },
    { code: "TEC-301", name: "Sistemas Embebidos", cycle: 4, credits: 4, hours: 4, room: "LAB" },
    { code: "TEC-302", name: "Internet de las Cosas", cycle: 5, credits: 3, hours: 3, room: "LAB" },
    { code: "TEC-401", name: "Realidad Virtual y Aumentada", cycle: 6, credits: 3, hours: 3, room: "LAB" },
    { code: "TEC-501", name: "DevOps y CI/CD", cycle: 7, credits: 3, hours: 3, room: "LAB" },
    // Diseño
    { code: "DIS-101", name: "Diseño UI/UX", cycle: 3, credits: 3, hours: 3, room: "LAB" },
    { code: "DIS-201", name: "Diseño de Sistemas", cycle: 4, credits: 3, hours: 3, room: "GENERAL" },
    { code: "DIS-301", name: "Arquitectura de Software", cycle: 5, credits: 4, hours: 4, room: "GENERAL" },
    { code: "DIS-401", name: "Patrones de Diseño", cycle: 6, credits: 3, hours: 3, room: "GENERAL" },
    // Investigación / Final
    { code: "INV-101", name: "Metodología de la Investigación", cycle: 6, credits: 3, hours: 3, room: "GENERAL" },
    { code: "INV-201", name: "Seminario de Tesis I", cycle: 9, credits: 2, hours: 2, room: "GENERAL" },
    { code: "INV-202", name: "Seminario de Tesis II", cycle: 10, credits: 2, hours: 2, room: "GENERAL" },
    { code: "INV-301", name: "Proyecto de Investigación", cycle: 9, credits: 4, hours: 4, room: "GENERAL" },
    { code: "INV-401", name: "Proyecto Final de Carrera", cycle: 10, credits: 4, hours: 4, room: "GENERAL" },
    { code: "INV-501", name: "Prácticas Preprofesionales", cycle: 8, credits: 3, hours: 3, room: "GENERAL" },
    { code: "INV-601", name: "Práctica Empresarial", cycle: 9, credits: 3, hours: 3, room: "GENERAL" },
    { code: "INV-701", name: "Proyecto Integrador I", cycle: 7, credits: 3, hours: 3, room: "GENERAL" },
    { code: "INV-702", name: "Proyecto Integrador II", cycle: 8, credits: 3, hours: 3, room: "GENERAL" },
    { code: "SIS-201", name: "Análisis de Sistemas", cycle: 3, credits: 3, hours: 3, room: "GENERAL" },
    { code: "SIS-202", name: "Diseño de Base de Datos", cycle: 4, credits: 3, hours: 3, room: "LAB" },
    { code: "SIS-401", name: "Calidad de Software", cycle: 6, credits: 3, hours: 3, room: "GENERAL" },
    { code: "SIS-402", name: "Testing y QA", cycle: 7, credits: 3, hours: 3, room: "LAB" },
    { code: "SIS-501", name: "Auditoría de Sistemas", cycle: 8, credits: 3, hours: 3, room: "GENERAL" },
  ];

  // 5. Filtrar solo los que NO existen todavía
  const toCreate = catalog.filter((c) => !existingCodes.has(c.code));
  console.log(`\n📋 Cursos a crear (no duplicados): ${toCreate.length}`);
  console.log(`⏭️  Cursos omitidos (ya existen):   ${catalog.length - toCreate.length}\n`);

  // 6. Crear cada curso asignando profesores aleatoriamente
  let created = 0;
  for (const c of toCreate) {
    // Asignar 1 a 3 profesores aleatoriamente
    const numTeachers = Math.min(teachers.length, 1 + Math.floor(Math.random() * 3));
    const shuffled = [...teachers].sort(() => 0.5 - Math.random()).slice(0, numTeachers);

    await prisma.course.create({
      data: {
        code: c.code,
        name: c.name,
        cycle: c.cycle,
        credits: c.credits,
        weeklyHours: c.hours,
        requiredRoomType: c.room,
        teacherCourses: {
          create: shuffled.map((t) => ({ teacherId: t.id })),
        },
      },
    });
    process.stdout.write(`✅ ${c.code} - ${c.name}\n`);
    created++;
  }

  // 7. Conteo final
  const total = await prisma.course.count();
  console.log(`\n🎉 Creados: ${created} cursos nuevos.`);
  console.log(`📊 Total de cursos en la BD ahora: ${total}`);
}

main()
  .catch((e) => {
    console.error("💥 Error fatal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
