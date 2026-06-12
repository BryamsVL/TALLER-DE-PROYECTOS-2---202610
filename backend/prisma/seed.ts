import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el seeding de datos para el prototipo...');

  // 1. Limpiar base de datos (Opcional, ten cuidado en producción)
  await prisma.classroomAvailability.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.course.deleteMany();
  await prisma.academicPeriod.deleteMany();

  // 2. Crear Período Académico
  const period = await prisma.academicPeriod.create({
    data: {
      code: '2026-1',
      name: 'Semestre Académico 2026-I',
      startsAt: new Date('2026-03-01'),
      endsAt: new Date('2026-07-15'),
      status: 'PLANNING',
      maxStudentCredits: 22,
      isActive: true,
    },
  });
  console.log(`Período creado: ${period.name}`);

  // 3. Crear Aulas
  const classrooms = await Promise.all([
    prisma.classroom.create({ data: { code: 'A101', name: 'Aula 101', capacity: 40, roomType: 'GENERAL' } }),
    prisma.classroom.create({ data: { code: 'A102', name: 'Aula 102', capacity: 40, roomType: 'GENERAL' } }),
    prisma.classroom.create({ data: { code: 'L201', name: 'Lab Cómputo 1', capacity: 30, roomType: 'LAB' } }),
    prisma.classroom.create({ data: { code: 'L202', name: 'Lab Cómputo 2', capacity: 30, roomType: 'LAB' } }),
    prisma.classroom.create({ data: { code: 'AUD1', name: 'Auditorio Principal', capacity: 100, roomType: 'AUDITORIUM' } }),
  ]);
  console.log(`Creadas ${classrooms.length} aulas.`);

  // 4. Crear Docentes
  const teachers = await Promise.all([
    prisma.teacher.create({ data: { code: 'DOC001', fullName: 'Carlos Mendoza', specialty: 'Ingeniería de Software' } }),
    prisma.teacher.create({ data: { code: 'DOC002', fullName: 'Ana Torres', specialty: 'Matemáticas Aplicadas' } }),
    prisma.teacher.create({ data: { code: 'DOC003', fullName: 'Luis Vargas', specialty: 'Bases de Datos' } }),
    prisma.teacher.create({ data: { code: 'DOC004', fullName: 'Marta Rojas', specialty: 'Inteligencia Artificial' } }),
    prisma.teacher.create({ data: { code: 'DOC005', fullName: 'Jorge Ruiz', specialty: 'Redes y Comunicaciones' } }),
  ]);
  console.log(`Creados ${teachers.length} docentes.`);

  // 5. Crear Cursos con asignación de Docentes (TeacherCourses)
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        code: 'CS101', name: 'Introducción a la Programación', cycle: 1, credits: 4, weeklyHours: 6, requiredRoomType: 'LAB',
        teacherCourses: { create: [{ teacherId: teachers[0].id }, { teacherId: teachers[4].id }] }
      }
    }),
    prisma.course.create({
      data: {
        code: 'MAT101', name: 'Cálculo I', cycle: 1, credits: 4, weeklyHours: 4, requiredRoomType: 'GENERAL',
        teacherCourses: { create: [{ teacherId: teachers[1].id }] }
      }
    }),
    prisma.course.create({
      data: {
        code: 'CS201', name: 'Estructuras de Datos', cycle: 2, credits: 4, weeklyHours: 4, requiredRoomType: 'LAB',
        teacherCourses: { create: [{ teacherId: teachers[0].id }, { teacherId: teachers[2].id }] }
      }
    }),
    prisma.course.create({
      data: {
        code: 'CS301', name: 'Bases de Datos I', cycle: 3, credits: 3, weeklyHours: 4, requiredRoomType: 'LAB',
        teacherCourses: { create: [{ teacherId: teachers[2].id }] }
      }
    }),
    prisma.course.create({
      data: {
        code: 'CS401', name: 'Ingeniería de Software', cycle: 4, credits: 4, weeklyHours: 4, requiredRoomType: 'GENERAL',
        teacherCourses: { create: [{ teacherId: teachers[0].id }] }
      }
    }),
    prisma.course.create({
      data: {
        code: 'CS501', name: 'Inteligencia Artificial', cycle: 5, credits: 4, weeklyHours: 4, requiredRoomType: 'LAB',
        teacherCourses: { create: [{ teacherId: teachers[3].id }] }
      }
    }),
  ]);
  console.log(`Creados ${courses.length} cursos con sus docentes candidatos.`);

  console.log('¡Seeding completado con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
