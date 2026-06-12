import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Orden y etiquetas de dias segun el enum DayOfWeek del schema real.
const DIA_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DIA_LABEL: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miercoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sabado",
};

interface ExportRow {
  dia: string;
  bloque: string;
  orden: number;
  curso: string;
  seccion: string;
  aula: string;
  docente: string;
}

// Las horas se guardan como @db.Time; Prisma las devuelve como Date en UTC.
function formatHora(d: Date): string {
  const date = new Date(d);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function sortRows(rows: ExportRow[]) {
  return rows.sort(
    (a, b) =>
      DIA_ORDER.indexOf(a.dia) - DIA_ORDER.indexOf(b.dia) || a.orden - b.orden,
  );
}

// Construye las filas del horario institucional a partir de los slots del CSP
// persistidos (section_assignment_slots). Si `teacherId` viene dado, filtra al
// horario de ese docente; si no, devuelve el horario completo (admin/coord).
async function buildRows(
  teachingScheduleId: string,
  teacherId: string | null,
): Promise<ExportRow[]> {
  const slots = await prisma.sectionAssignmentSlot.findMany({
    where: {
      teachingScheduleId,
      ...(teacherId ? { teacherId } : {}),
    },
    include: {
      timeSlot: true,
      teacher: true,
      classroom: true,
      sectionAssignment: {
        include: {
          section: {
            include: { courseOffering: { include: { course: true } } },
          },
        },
      },
    },
  });

  const rows: ExportRow[] = slots.map((s) => {
    const course = s.sectionAssignment.section.courseOffering.course;
    return {
      dia: s.timeSlot.dayOfWeek,
      orden: s.timeSlot.slotOrder,
      bloque: `${formatHora(s.timeSlot.startTime)}-${formatHora(s.timeSlot.endTime)}`,
      curso: `${course.code} - ${course.name}`,
      seccion: s.sectionAssignment.section.sectionCode,
      aula: s.classroom.name,
      docente: s.teacher.fullName,
    };
  });
  return sortRows(rows);
}

async function toExcel(
  rows: ExportRow[],
  meta: { usuario: string; ciclo: string; fecha: string },
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Horario");
  ws.addRow([`Horario - ${meta.usuario}`]);
  ws.addRow([`Periodo: ${meta.ciclo}`]);
  ws.addRow([`Exportado: ${meta.fecha}`]);
  ws.addRow([]);
  const header = ws.addRow(["Dia", "Bloque", "Curso", "Seccion", "Aula", "Docente"]);
  header.font = { bold: true };
  for (const r of rows) {
    ws.addRow([
      DIA_LABEL[r.dia] ?? r.dia,
      r.bloque,
      r.curso,
      r.seccion,
      r.aula,
      r.docente,
    ]);
  }
  ws.columns.forEach((col) => {
    col.width = 22;
  });
  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out);
}

async function toPdf(
  rows: ExportRow[],
  meta: { usuario: string; ciclo: string; fecha: string },
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([595, 842]);
  let y = 800;
  const draw = (text: string, x: number, f = font, size = 9) =>
    page.drawText(text, { x, y, size, font: f, color: rgb(0, 0, 0) });

  draw(`Horario - ${meta.usuario}`, 40, bold, 14);
  y -= 18;
  draw(`Periodo: ${meta.ciclo}    Exportado: ${meta.fecha}`, 40, font, 9);
  y -= 24;
  const cols = [40, 95, 150, 330, 380, 450];
  const headers = ["Dia", "Bloque", "Curso", "Seccion", "Aula", "Docente"];
  headers.forEach((h, i) => draw(h, cols[i], bold, 9));
  y -= 14;

  for (const r of rows) {
    if (y < 50) {
      page = doc.addPage([595, 842]);
      y = 800;
    }
    const cells = [
      DIA_LABEL[r.dia] ?? r.dia,
      r.bloque,
      r.curso.slice(0, 30),
      r.seccion,
      r.aula.slice(0, 12),
      r.docente.slice(0, 22),
    ];
    cells.forEach((c, i) => draw(c, cols[i]));
    y -= 13;
  }
  const bytes = await doc.save();
  return Buffer.from(bytes);
}

export async function GET(req: NextRequest) {
  const formato =
    req.nextUrl.searchParams.get("formato") === "pdf" ? "pdf" : "excel";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("No autorizado", { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { fullName: true, role: true },
  });
  if (!dbUser) return new Response("Perfil no encontrado", { status: 403 });

  // Periodo academico activo + su horario institucional mas reciente.
  const period = await prisma.academicPeriod.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  let rows: ExportRow[] = [];
  if (period) {
    const schedule = await prisma.teachingSchedule.findFirst({
      where: { academicPeriodId: period.id },
      orderBy: [{ version: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    });

    if (schedule) {
      // Docente: solo su horario. Admin/Coordinador: horario completo.
      let teacherId: string | null = null;
      if (dbUser.role === "TEACHER") {
        const teacher = await prisma.teacher.findUnique({
          where: { userId: user.id },
          select: { id: true },
        });
        teacherId = teacher?.id ?? "__none__"; // sin teacher => sin filas
      }
      rows = await buildRows(schedule.id, teacherId);
    }
  }

  const meta = {
    usuario: dbUser.fullName,
    ciclo: period?.name ?? "Sin periodo activo",
    fecha: new Date().toLocaleString("es-PE"),
  };
  const base = `horario_${dbUser.role.toLowerCase()}_${meta.ciclo}`.replace(
    /[^a-z0-9_-]/gi,
    "_",
  );

  if (formato === "pdf") {
    const buf = await toPdf(rows, meta);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${base}.pdf"`,
      },
    });
  }
  const buf = await toExcel(rows, meta);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${base}.xlsx"`,
    },
  });
}
