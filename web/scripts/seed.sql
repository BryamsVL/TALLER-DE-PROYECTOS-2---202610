-- Seed SQL - Datos de prueba estructurados para SGOHA (Idempotente)
-- Limpia datos antiguos con nuestros prefijos de prueba para evitar violaciones de clave única (id o code)

-- 0. LIMPIEZA INICIAL DE SEGURIDAD (Orden inverso de claves foráneas)
DELETE FROM "teacher_courses" WHERE "teacherId" LIKE 'tea-%';
DELETE FROM "teachers" WHERE id LIKE 'tea-%' OR code IN ('DOC-001', 'DOC-002', 'DOC-003', 'DOC-004', 'DOC-005');
DELETE FROM "courses" WHERE id LIKE 'cur-%' OR code IN ('SIS-101', 'MAT-101', 'SIS-201', 'MAT-201', 'SIS-301', 'SIS-302', 'SIS-401', 'SIS-402', 'SIS-501', 'SIS-502', 'SIS-601');
DELETE FROM "classrooms" WHERE id LIKE 'aula-%' OR code IN ('A101', 'A102', 'LAB-201', 'LAB-202', 'AM301');
DELETE FROM "carreras" WHERE id LIKE 'car-%' OR code IN ('SIS', 'IND');
DELETE FROM "facultades" WHERE id LIKE 'fac-%' OR code IN ('FING');
DELETE FROM "time_slots" WHERE id LIKE 'slot-%';

-- 1. POBLAR FACULTADES
INSERT INTO "facultades" (id, code, name, "isActive", "createdAt", "updatedAt") VALUES
('fac-ingenieria', 'FING', 'Facultad de Ingeniería y Arquitectura', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 2. POBLAR CARRERAS
INSERT INTO "carreras" (id, "facultadId", code, name, "isActive", "createdAt", "updatedAt") VALUES
('car-sistemas', 'fac-ingenieria', 'SIS', 'Ingeniería de Sistemas', true, NOW(), NOW()),
('car-industrial', 'fac-ingenieria', 'IND', 'Ingeniería Industrial', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 3. POBLAR AULAS (classrooms)
INSERT INTO "classrooms" (id, code, name, capacity, "roomType", "isActive", "createdAt", "updatedAt") VALUES
('aula-101', 'A101', 'Aula de Teoría 101 (Pabellón A)', 40, 'GENERAL', true, NOW(), NOW()),
('aula-102', 'A102', 'Aula de Teoría 102 (Pabellón A)', 45, 'GENERAL', true, NOW(), NOW()),
('aula-201', 'LAB-201', 'Laboratorio de Cómputo 201', 35, 'LAB', true, NOW(), NOW()),
('aula-202', 'LAB-202', 'Laboratorio de Innovación Tecnológica', 30, 'LAB', true, NOW(), NOW()),
('aula-301', 'AM301', 'Aula Magna 301', 80, 'GENERAL', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET capacity = EXCLUDED.capacity, "roomType" = EXCLUDED."roomType";

-- 4. POBLAR CURSOS (courses)
INSERT INTO "courses" (id, code, name, cycle, credits, "requiredCredits", "weeklyHours", "requiredRoomType", "isActive", "createdAt", "updatedAt") VALUES
-- Ciclo 1
('cur-introduccion', 'SIS-101', 'Introducción a la Programación', 1, 4, 0, 4, 'LAB', true, NOW(), NOW()),
('cur-calculo1', 'MAT-101', 'Cálculo I', 1, 5, 0, 4, 'GENERAL', true, NOW(), NOW()),
-- Ciclo 2
('cur-estructuras', 'SIS-201', 'Estructuras de Datos', 2, 4, 15, 4, 'LAB', true, NOW(), NOW()),
('cur-calculo2', 'MAT-201', 'Cálculo II', 2, 5, 18, 4, 'GENERAL', true, NOW(), NOW()),
-- Ciclo 3
('cur-db1', 'SIS-301', 'Bases de Datos I', 3, 4, 30, 4, 'LAB', true, NOW(), NOW()),
('cur-analisis', 'SIS-302', 'Análisis y Diseño de Sistemas', 3, 4, 30, 4, 'GENERAL', true, NOW(), NOW()),
-- Ciclo 4
('cur-ingenieriasof', 'SIS-401', 'Ingeniería de Software I', 4, 4, 45, 4, 'GENERAL', true, NOW(), NOW()),
('cur-db2', 'SIS-402', 'Bases de Datos II', 4, 4, 45, 4, 'LAB', true, NOW(), NOW()),
-- Ciclo 5
('cur-redes', 'SIS-501', 'Redes y Conectividad', 5, 4, 60, 4, 'LAB', true, NOW(), NOW()),
('cur-operativos', 'SIS-502', 'Sistemas Operativos', 5, 4, 60, 4, 'LAB', true, NOW(), NOW()),
-- Ciclo 6
('cur-taller1', 'SIS-601', 'Taller de Proyectos I', 6, 5, 80, 4, 'GENERAL', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, credits = EXCLUDED.credits, cycle = EXCLUDED.cycle;

-- 5. POBLAR PROFESORES (teachers)
INSERT INTO "teachers" (id, "userId", code, "fullName", specialty, "isActive", "createdAt", "updatedAt") VALUES
('tea-torres', NULL, 'DOC-001', 'Ing. Carlos Torres', 'Algoritmos y Estructuras de Datos', true, NOW(), NOW()),
('tea-mendoza', NULL, 'DOC-002', 'Dra. Ana Mendoza', 'Ingeniería de Software y Bases de Datos', true, NOW(), NOW()),
('tea-quispe', NULL, 'DOC-003', 'Dr. Jorge Quispe', 'Matemática Aplicada y Cálculo Avanzado', true, NOW(), NOW()),
('tea-gomez', NULL, 'DOC-004', 'Ing. Luis Gomez', 'Redes, Conectividad y Sistemas Operativos', true, NOW(), NOW()),
('tea-sanchez', NULL, 'DOC-005', 'Mag. Elena Sanchez', 'Gestión de Proyectos de Software y Requerimientos', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET "fullName" = EXCLUDED."fullName", specialty = EXCLUDED.specialty;

-- 6. ASOCIAR PROFESORES A CURSOS (teacher_courses)
INSERT INTO "teacher_courses" (id, "teacherId", "courseId", "createdAt", "updatedAt") VALUES
-- Ing. Carlos Torres
('tc-torres-intro', 'tea-torres', 'cur-introduccion', NOW(), NOW()),
('tc-torres-estructuras', 'tea-torres', 'cur-estructuras', NOW(), NOW()),
-- Dra. Ana Mendoza
('tc-mendoza-db1', 'tea-mendoza', 'cur-db1', NOW(), NOW()),
('tc-mendoza-db2', 'tea-mendoza', 'cur-db2', NOW(), NOW()),
('tc-mendoza-ingsoft', 'tea-mendoza', 'cur-ingenieriasof', NOW(), NOW()),
-- Dr. Jorge Quispe
('tc-quispe-calc1', 'tea-quispe', 'cur-calculo1', NOW(), NOW()),
('tc-quispe-calc2', 'tea-quispe', 'cur-calculo2', NOW(), NOW()),
-- Ing. Luis Gomez
('tc-gomez-redes', 'tea-gomez', 'cur-redes', NOW(), NOW()),
('tc-gomez-operativos', 'tea-gomez', 'cur-operativos', NOW(), NOW()),
-- Mag. Elena Sanchez
('tc-sanchez-analisis', 'tea-sanchez', 'cur-analisis', NOW(), NOW()),
('tc-sanchez-ingsoft', 'tea-sanchez', 'cur-ingenieriasof', NOW(), NOW()),
('tc-sanchez-taller1', 'tea-sanchez', 'cur-taller1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. POBLAR BLOQUES HORARIOS (time_slots) - 9 bloques por cada uno de los 5 días
-- Se castean explícitamente los textos a la enumeración 'DayOfWeek'
INSERT INTO "time_slots" (id, "dayOfWeek", "startTime", "endTime", "slotOrder", "isActive", "createdAt", "updatedAt") VALUES
-- LUNES
('slot-mon-1', 'MONDAY'::"DayOfWeek", '07:00:00', '08:30:00', 1, true, NOW(), NOW()),
('slot-mon-2', 'MONDAY'::"DayOfWeek", '08:40:00', '10:10:00', 2, true, NOW(), NOW()),
('slot-mon-3', 'MONDAY'::"DayOfWeek", '10:20:00', '11:50:00', 3, true, NOW(), NOW()),
('slot-mon-4', 'MONDAY'::"DayOfWeek", '12:00:00', '13:30:00', 4, true, NOW(), NOW()),
('slot-mon-5', 'MONDAY'::"DayOfWeek", '14:00:00', '15:30:00', 5, true, NOW(), NOW()),
('slot-mon-6', 'MONDAY'::"DayOfWeek", '15:40:00', '17:10:00', 6, true, NOW(), NOW()),
('slot-mon-7', 'MONDAY'::"DayOfWeek", '17:20:00', '18:50:00', 7, true, NOW(), NOW()),
('slot-mon-8', 'MONDAY'::"DayOfWeek", '19:00:00', '20:30:00', 8, true, NOW(), NOW()),
('slot-mon-9', 'MONDAY'::"DayOfWeek", '20:40:00', '22:10:00', 9, true, NOW(), NOW()),

-- MARTES
('slot-tue-1', 'TUESDAY'::"DayOfWeek", '07:00:00', '08:30:00', 1, true, NOW(), NOW()),
('slot-tue-2', 'TUESDAY'::"DayOfWeek", '08:40:00', '10:10:00', 2, true, NOW(), NOW()),
('slot-tue-3', 'TUESDAY'::"DayOfWeek", '10:20:00', '11:50:00', 3, true, NOW(), NOW()),
('slot-tue-4', 'TUESDAY'::"DayOfWeek", '12:00:00', '13:30:00', 4, true, NOW(), NOW()),
('slot-tue-5', 'TUESDAY'::"DayOfWeek", '14:00:00', '15:30:00', 5, true, NOW(), NOW()),
('slot-tue-6', 'TUESDAY'::"DayOfWeek", '15:40:00', '17:10:00', 6, true, NOW(), NOW()),
('slot-tue-7', 'TUESDAY'::"DayOfWeek", '17:20:00', '18:50:00', 7, true, NOW(), NOW()),
('slot-tue-8', 'TUESDAY'::"DayOfWeek", '19:00:00', '20:30:00', 8, true, NOW(), NOW()),
('slot-tue-9', 'TUESDAY'::"DayOfWeek", '20:40:00', '22:10:00', 9, true, NOW(), NOW()),

-- MIÉRCOLES
('slot-wed-1', 'WEDNESDAY'::"DayOfWeek", '07:00:00', '08:30:00', 1, true, NOW(), NOW()),
('slot-wed-2', 'WEDNESDAY'::"DayOfWeek", '08:40:00', '10:10:00', 2, true, NOW(), NOW()),
('slot-wed-3', 'WEDNESDAY'::"DayOfWeek", '10:20:00', '11:50:00', 3, true, NOW(), NOW()),
('slot-wed-4', 'WEDNESDAY'::"DayOfWeek", '12:00:00', '13:30:00', 4, true, NOW(), NOW()),
('slot-wed-5', 'WEDNESDAY'::"DayOfWeek", '14:00:00', '15:30:00', 5, true, NOW(), NOW()),
('slot-wed-6', 'WEDNESDAY'::"DayOfWeek", '15:40:00', '17:10:00', 6, true, NOW(), NOW()),
('slot-wed-7', 'WEDNESDAY'::"DayOfWeek", '17:20:00', '18:50:00', 7, true, NOW(), NOW()),
('slot-wed-8', 'WEDNESDAY'::"DayOfWeek", '19:00:00', '20:30:00', 8, true, NOW(), NOW()),
('slot-wed-9', 'WEDNESDAY'::"DayOfWeek", '20:40:00', '22:10:00', 9, true, NOW(), NOW()),

-- JUEVES
('slot-thu-1', 'THURSDAY'::"DayOfWeek", '07:00:00', '08:30:00', 1, true, NOW(), NOW()),
('slot-thu-2', 'THURSDAY'::"DayOfWeek", '08:40:00', '10:10:00', 2, true, NOW(), NOW()),
('slot-thu-3', 'THURSDAY'::"DayOfWeek", '10:20:00', '11:50:00', 3, true, NOW(), NOW()),
('slot-thu-4', 'THURSDAY'::"DayOfWeek", '12:00:00', '13:30:00', 4, true, NOW(), NOW()),
('slot-thu-5', 'THURSDAY'::"DayOfWeek", '14:00:00', '15:30:00', 5, true, NOW(), NOW()),
('slot-thu-6', 'THURSDAY'::"DayOfWeek", '15:40:00', '17:10:00', 6, true, NOW(), NOW()),
('slot-thu-7', 'THURSDAY'::"DayOfWeek", '17:20:00', '18:50:00', 7, true, NOW(), NOW()),
('slot-thu-8', 'THURSDAY'::"DayOfWeek", '19:00:00', '20:30:00', 8, true, NOW(), NOW()),
('slot-thu-9', 'THURSDAY'::"DayOfWeek", '20:40:00', '22:10:00', 9, true, NOW(), NOW()),

-- VIERNES
('slot-fri-1', 'FRIDAY'::"DayOfWeek", '07:00:00', '08:30:00', 1, true, NOW(), NOW()),
('slot-fri-2', 'FRIDAY'::"DayOfWeek", '08:40:00', '10:10:00', 2, true, NOW(), NOW()),
('slot-fri-3', 'FRIDAY'::"DayOfWeek", '10:20:00', '11:50:00', 3, true, NOW(), NOW()),
('slot-fri-4', 'FRIDAY'::"DayOfWeek", '12:00:00', '13:30:00', 4, true, NOW(), NOW()),
('slot-fri-5', 'FRIDAY'::"DayOfWeek", '14:00:00', '15:30:00', 5, true, NOW(), NOW()),
('slot-fri-6', 'FRIDAY'::"DayOfWeek", '15:40:00', '17:10:00', 6, true, NOW(), NOW()),
('slot-fri-7', 'FRIDAY'::"DayOfWeek", '17:20:00', '18:50:00', 7, true, NOW(), NOW()),
('slot-fri-8', 'FRIDAY'::"DayOfWeek", '19:00:00', '20:30:00', 8, true, NOW(), NOW()),
('slot-fri-9', 'FRIDAY'::"DayOfWeek", '20:40:00', '22:10:00', 9, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET "startTime" = EXCLUDED."startTime", "endTime" = EXCLUDED."endTime";
