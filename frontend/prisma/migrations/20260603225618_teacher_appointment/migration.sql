-- CreateEnum
CREATE TYPE "TeacherAppointment" AS ENUM ('NOMBRADO', 'CONTRATADO');

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "appointmentType" "TeacherAppointment" NOT NULL DEFAULT 'CONTRATADO';
