import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";

const DAYS = [
  { key: "LUN", label: "Lunes" },
  { key: "MAR", label: "Martes" },
  { key: "MIE", label: "Miercoles" },
  { key: "JUE", label: "Jueves" },
  { key: "VIE", label: "Viernes" },
  { key: "SAB", label: "Sabado" },
] as const;

function stableColor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % 360;
  return {
    background: `hsl(${colorIndex}, 80%, 95%)`,
    border: `hsl(${colorIndex}, 80%, 80%)`,
    text: `hsl(${colorIndex}, 85%, 25%)`,
  };
}

function formatHour(value: string) {
  return value.slice(0, 5);
}

export default async function EstudianteHorarioPage() {
  const { user } = await getSessionProfile();
  const supabase = await createClient();

  const { data: ciclo } = await supabase
    .from("ciclo")
    .select("id, nombre")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: inscripciones } = await supabase
    .from("inscripcion")
    .select("nrc")
    .eq("estudiante_id", user.id)
    .eq("estado", "ACTIVA");

  const misNrcs = (inscripciones ?? []).map((i) => i.nrc);

  const [
    { data: nrcsRows },
    { data: sesiones },
    { data: bloques },
    { data: aulas },
    { data: cursos },
  ] = await Promise.all([
    misNrcs.length > 0
      ? supabase
          .from("nrc")
          .select("nrc, curso_id, profesor_id")
          .in("nrc", misNrcs)
          .eq("ciclo_id", ciclo?.id ?? -1)
      : Promise.resolve({ data: null }),
    misNrcs.length > 0
      ? supabase
          .from("sesion_nrc")
          .select("nrc, dia, bloque_id, aula_id")
          .in("nrc", misNrcs)
      : Promise.resolve({ data: null }),
    supabase
      .from("bloque_horario")
      .select("id, orden, hora_inicio, hora_fin")
      .order("orden", { ascending: true }),
    supabase.from("aula").select("id, nombre"),
    supabase.from("curso").select("id, nombre, codigo"),
  ]);

  // Fetch professor names via admin client to bypass RLS
  const profesorIds = [
    ...new Set(
      (nrcsRows ?? []).map((n) => n.profesor_id).filter(Boolean) as string[],
    ),
  ];
  const adminSupabase = createAdminClient();
  const { data: perfiles } =
    profesorIds.length > 0
      ? await adminSupabase
          .from("perfil")
          .select("id, nombre")
          .in("id", profesorIds)
      : { data: [] };

  const cursoPorId = new Map(
    (cursos ?? []).map((c) => [c.id, { nombre: c.nombre, codigo: c.codigo }]),
  );
  const aulaPorId = new Map((aulas ?? []).map((a) => [a.id, a.nombre]));
  const perfilNombre = new Map((perfiles ?? []).map((p) => [p.id, p.nombre]));
  const nrcPorId = new Map((nrcsRows ?? []).map((n) => [n.nrc, n]));

  // Build a map: slot key → list of sessions with display info
  interface SlotInfo {
    nrc: string;
    cursoNombre: string;
    aula: string;
    docente: string | null;
  }

  const sessionsBySlot = new Map<string, SlotInfo[]>();
  for (const s of sesiones ?? []) {
    const nrcInfo = nrcPorId.get(s.nrc);
    const cursoInfo = nrcInfo ? cursoPorId.get(nrcInfo.curso_id) : undefined;
    const entry: SlotInfo = {
      nrc: s.nrc,
      cursoNombre: cursoInfo
        ? `${cursoInfo.codigo} — ${cursoInfo.nombre}`
        : s.nrc,
      aula: aulaPorId.get(s.aula_id) ?? "?",
      docente: nrcInfo?.profesor_id
        ? (perfilNombre.get(nrcInfo.profesor_id) ?? null)
        : null,
    };
    const key = `${s.dia}|${s.bloque_id}`;
    const current = sessionsBySlot.get(key) ?? [];
    current.push(entry);
    sessionsBySlot.set(key, current);
  }

  const orderedBlocks = [...(bloques ?? [])].sort((a, b) => a.orden - b.orden);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Mi horario
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ciclo
            ? `Sesiones de tus inscripciones activas en ${ciclo.nombre}.`
            : "No hay ciclo activo."}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Semana</CardTitle>
          <CardDescription>
            {misNrcs.length} inscripcion{misNrcs.length === 1 ? "" : "es"} activa
            {misNrcs.length === 1 ? "" : "s"},{" "}
            {(sesiones ?? []).length} sesion
            {(sesiones ?? []).length === 1 ? "" : "es"} programadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {misNrcs.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No tienes inscripciones.{" "}
              <Link
                href="/estudiante/inscripciones"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Ve a Matricula
              </Link>{" "}
              para inscribirte.
            </p>
          )}
          {misNrcs.length > 0 && (sesiones ?? []).length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Tus NRCs aun no tienen horario generado.
            </p>
          )}
          {(sesiones ?? []).length > 0 && (
            <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
              <div className="grid min-w-[920px] grid-cols-[110px_repeat(6,minmax(0,1fr))]">
                {/* Header row */}
                <div className="border-b border-r bg-muted/40 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hora
                </div>
                {DAYS.map((day) => (
                  <div
                    key={day.key}
                    className="border-b px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {day.label}
                  </div>
                ))}

                {/* Body rows */}
                {orderedBlocks.map((block, index) => {
                  const isLast = index === orderedBlocks.length - 1;
                  return (
                    <div key={block.id} className="contents">
                      <div className={`border-r px-3 py-3 ${isLast ? "" : "border-b"}`}>
                        <div className="text-xs text-muted-foreground">
                          {formatHour(block.hora_inicio)} –{" "}
                          {formatHour(block.hora_fin)}
                        </div>
                      </div>

                      {DAYS.map((day) => {
                        const items =
                          sessionsBySlot.get(`${day.key}|${block.id}`) ?? [];
                        return (
                          <div
                            key={`${day.key}-${block.id}`}
                            className={`min-h-28 space-y-2 border-l px-2 py-2 ${isLast ? "" : "border-b"}`}
                          >
                            {items.map((item) => {
                              const color = stableColor(item.nrc);
                              return (
                                <div
                                  key={`${item.nrc}-${day.key}-${block.id}`}
                                  className="w-full rounded-none border p-2 shadow-sm"
                                  style={{
                                    backgroundColor: color.background,
                                    borderColor: color.border,
                                    color: color.text,
                                  }}
                                >
                                  <div
                                    className="text-[11px] font-bold uppercase truncate"
                                    title={item.cursoNombre}
                                  >
                                    {item.cursoNombre}
                                  </div>
                                  <div className="text-xs font-semibold mt-0.5">
                                    NRC: {item.nrc}
                                  </div>
                                  <div className="mt-1 text-[10px] line-clamp-1 opacity-80">
                                    {item.aula}
                                  </div>
                                  {item.docente && (
                                    <div className="mt-0.5 text-[10px] line-clamp-1 opacity-70">
                                      {item.docente}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
