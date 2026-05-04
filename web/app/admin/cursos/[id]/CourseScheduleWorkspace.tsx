"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, Clock3, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { crearNrcProgramado, eliminarNrc } from "../actions";

type Dia = "LUN" | "MAR" | "MIE" | "JUE" | "VIE" | "SAB";

const DAYS: Array<{ key: Dia; label: string }> = [
  { key: "LUN", label: "Lunes" },
  { key: "MAR", label: "Martes" },
  { key: "MIE", label: "Miercoles" },
  { key: "JUE", label: "Jueves" },
  { key: "VIE", label: "Viernes" },
  { key: "SAB", label: "Sabado" },
];

interface Bloque {
  id: number;
  orden: number;
  hora_inicio: string;
  hora_fin: string;
  turno: string;
}

interface ProfessorOption {
  id: string;
  nombre: string;
}

interface NrcSession {
  dia: Dia;
  bloque_id: number;
  aula_nombre: string;
}

interface NrcCard {
  nrc: string;
  profesor_nombre: string;
  seccion: string;
  cupo_max: number;
  sesiones: NrcSession[];
}

interface CourseSummary {
  id: number;
  codigo: string;
  nombre: string;
  nivel: number;
  horas_semanales: number;
  tipo_aula: string;
  carrera_nombre: string;
}

interface CourseScheduleWorkspaceProps {
  course: CourseSummary;
  cycleName: string | null;
  bloques: Bloque[];
  professors: ProfessorOption[];
  defaultSection: string;
  nrcs: NrcCard[];
  canCreate: boolean;
}

function stableColor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360;
  }

  return {
    background: `hsl(${hash} 85% 95%)`,
    border: `hsl(${hash} 60% 75%)`,
    text: `hsl(${hash} 45% 28%)`,
  };
}

function formatHour(value: string) {
  return value.slice(0, 5);
}

export function CourseScheduleWorkspace({
  course,
  cycleName,
  bloques,
  professors,
  defaultSection,
  nrcs,
  canCreate,
}: CourseScheduleWorkspaceProps) {
  const [open, setOpen] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [professorId, setProfessorId] = useState(professors[0]?.id ?? "");
  const [section, setSection] = useState(defaultSection);
  const [cupoMax, setCupoMax] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const orderedBlocks = useMemo(
    () => [...bloques].sort((a, b) => a.orden - b.orden),
    [bloques],
  );
  const requiredSlots = Number(course.horas_semanales) / 1.5;

  const sessionsBySlot = useMemo(() => {
    const map = new Map<string, Array<{ nrc: string; profesor: string; seccion: string; aula: string }>>();

    for (const nrc of nrcs) {
      for (const session of nrc.sesiones) {
        const key = `${session.dia}|${session.bloque_id}`;
        const current = map.get(key) ?? [];
        current.push({
          nrc: nrc.nrc,
          profesor: nrc.profesor_nombre,
          seccion: nrc.seccion,
          aula: session.aula_nombre,
        });
        map.set(key, current);
      }
    }

    return map;
  }, [nrcs]);

  function toggleSlot(dia: Dia, bloqueId: number) {
    const key = `${dia}|${bloqueId}`;
    const next = new Set(selectedSlots);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedSlots(next);
  }

  function resetModalState() {
    setSelectedSlots(new Set());
    setProfessorId(professors[0]?.id ?? "");
    setSection(defaultSection);
    setCupoMax("30");
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetModalState();
    }
  }

  function handleSave() {
    setError(null);

    if (!professorId) {
      setError("Selecciona un profesor para el NRC.");
      return;
    }

    if (selectedSlots.size !== requiredSlots) {
      setError(`Debes seleccionar exactamente ${requiredSlots} bloque(s) de 1.5 horas.`);
      return;
    }

    const slots = [...selectedSlots].map((slot) => {
      const [dia, bloqueId] = slot.split("|");
      return {
        dia,
        bloqueId: Number(bloqueId),
      };
    });

    const formData = new FormData();
    formData.set("cursoId", String(course.id));
    formData.set("profesorId", professorId);
    formData.set("seccion", section);
    formData.set("cupoMax", cupoMax);
    formData.set("slotKeys", JSON.stringify(slots));

    startTransition(async () => {
      const result = await crearNrcProgramado(formData);
      if (!result.ok) {
        setError(result.message);
        return;
      }

      handleOpenChange(false);
    });
  }

  function handleDeleteNrc(nrc: string) {
    setError(null);
    const formData = new FormData();
    formData.set("nrc", nrc);
    formData.set("cursoId", String(course.id));

    startTransition(async () => {
      const result = await eliminarNrc(formData);
      if (!result.ok) {
        setError(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Link
            href="/admin/cursos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a cursos
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{course.codigo}</Badge>
              <Badge variant="outline">{course.carrera_nombre}</Badge>
              <Badge variant="outline">Nivel {course.nivel}</Badge>
              <Badge variant="outline">{course.tipo_aula}</Badge>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
              {course.nombre}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {cycleName
                ? `Calendario semanal de los NRCs del ciclo ${cycleName}.`
                : "No hay ciclo activo para programar NRCs en este momento."}
            </p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button disabled={!canCreate}>
              <CalendarPlus className="h-4 w-4" />
              Anadir NRC
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo NRC para {course.codigo}</DialogTitle>
              <DialogDescription>
                Selecciona profesor, seccion y bloques horarios. Este curso exige{" "}
                {requiredSlots} bloque(s) de 1.5 horas para completar {course.horas_semanales} horas
                semanales.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Progreso de seleccion
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold tracking-tight">
                    {selectedSlots.size}/{requiredSlots}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cada bloque equivale a 1.5 horas. El calendario usa el horario institucional de
                    7:00 a 22:10.
                  </p>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">Profesor</span>
                  <select
                    value={professorId}
                    onChange={(event) => setProfessorId(event.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Selecciona un profesor
                    </option>
                    {professors.map((professor) => (
                      <option key={professor.id} value={professor.id}>
                        {professor.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">Seccion</span>
                  <input
                    value={section}
                    onChange={(event) => setSection(event.target.value.toUpperCase())}
                    maxLength={5}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">Cupo maximo</span>
                  <input
                    value={cupoMax}
                    onChange={(event) => setCupoMax(event.target.value)}
                    type="number"
                    min={1}
                    max={30}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </label>

                <div className="rounded-xl border bg-background p-4">
                  <p className="text-sm font-medium">Seleccion actual</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {[...selectedSlots]
                      .sort()
                      .map((slot) => {
                        const [dia, bloqueIdRaw] = slot.split("|");
                        const bloque = orderedBlocks.find((item) => item.id === Number(bloqueIdRaw));
                        return (
                          <li key={slot}>
                            {dia} | {bloque ? `${formatHour(bloque.hora_inicio)} - ${formatHour(bloque.hora_fin)}` : "Bloque"}
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <div className="overflow-x-auto rounded-xl border bg-background">
                  <div className="grid min-w-[920px] grid-cols-[110px_repeat(6,minmax(0,1fr))]">
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

                    {orderedBlocks.map((block, index) => {
                      const isLast = index === orderedBlocks.length - 1;
                      return (
                        <div key={block.id} className="contents">
                          <div
                            className={`border-r px-3 py-3 ${isLast ? "" : "border-b"}`}
                          >
                            <div className="text-sm font-medium">B{block.orden}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatHour(block.hora_inicio)} - {formatHour(block.hora_fin)}
                            </div>
                          </div>

                          {DAYS.map((day) => {
                            const key = `${day.key}|${block.id}`;
                            const selected = selectedSlots.has(key);

                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => toggleSlot(day.key, block.id)}
                                className={`min-h-20 border-l px-2 py-2 text-left transition-colors ${
                                  isLast ? "" : "border-b"
                                } ${
                                  selected
                                    ? "bg-accent/15 ring-1 ring-inset ring-accent"
                                    : "hover:bg-muted/50"
                                }`}
                              >
                                <div className="text-[11px] font-medium text-muted-foreground">
                                  {selected ? "Seleccionado" : "Disponible"}
                                </div>
                                <div className="mt-2 text-xs">
                                  {formatHour(block.hora_inicio)} - {formatHour(block.hora_fin)}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Al guardar, el sistema asigna automaticamente un aula activa del tipo{" "}
                  <span className="font-medium">{course.tipo_aula}</span> para cada bloque
                  seleccionado.
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={pending || !canCreate}>
                {pending ? "Guardando..." : "Guardar NRC"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Horas</p>
          <p className="mt-2 font-display text-3xl font-bold">{course.horas_semanales}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Bloques requeridos</p>
          <p className="mt-2 font-display text-3xl font-bold">{requiredSlots}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">NRCs del curso</p>
          <p className="mt-2 font-display text-3xl font-bold">{nrcs.length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Profes habilitados</p>
          <p className="mt-2 font-display text-3xl font-bold">{professors.length}</p>
        </div>
      </div>

      {!cycleName && (
        <div className="rounded-2xl border border-dashed bg-background p-4 text-sm text-muted-foreground">
          No hay ciclo activo. Activa uno desde la base o desde el modulo correspondiente para poder
          programar NRCs.
        </div>
      )}

      {cycleName && !canCreate && (
        <div className="rounded-2xl border border-dashed bg-background p-4 text-sm text-muted-foreground">
          Este curso aun no tiene docentes habilitados en `Curso a Profesor`. Primero vincula al
          menos un profesor y luego vuelve para crear NRCs.
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="font-display text-lg font-bold tracking-tight">Calendario semanal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Vista semanal de todos los NRCs del curso, organizada por bloque y dia.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="grid min-w-[920px] grid-cols-[110px_repeat(6,minmax(0,1fr))]">
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

              {orderedBlocks.map((block, index) => {
                const isLast = index === orderedBlocks.length - 1;

                return (
                  <div key={block.id} className="contents">
                    <div className={`border-r px-3 py-3 ${isLast ? "" : "border-b"}`}>
                      <div className="text-sm font-medium">B{block.orden}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatHour(block.hora_inicio)} - {formatHour(block.hora_fin)}
                      </div>
                    </div>

                    {DAYS.map((day) => {
                      const items = sessionsBySlot.get(`${day.key}|${block.id}`) ?? [];
                      return (
                        <div
                          key={`${day.key}-${block.id}`}
                          className={`min-h-28 space-y-2 border-l px-2 py-2 ${
                            isLast ? "" : "border-b"
                          }`}
                        >
                          {items.map((item) => {
                            const color = stableColor(item.nrc);
                            return (
                              <div
                                key={`${item.nrc}-${day.key}-${block.id}`}
                                className="rounded-xl border p-2"
                                style={{
                                  backgroundColor: color.background,
                                  borderColor: color.border,
                                  color: color.text,
                                }}
                              >
                                <div className="text-xs font-semibold">{item.nrc}</div>
                                <div className="mt-1 text-[11px]">{item.profesor}</div>
                                <div className="text-[11px] opacity-80">
                                  Sec. {item.seccion} | {item.aula}
                                </div>
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
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold tracking-tight">NRCs creados</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Resumen por NRC con docente, seccion y cupo maximo.
            </p>
          </div>

          {nrcs.length === 0 && (
            <div className="rounded-2xl border border-dashed bg-background p-5 text-sm text-muted-foreground">
              Aun no hay NRCs programados para este curso.
            </div>
          )}

          {nrcs.map((nrc) => (
            <div key={nrc.nrc} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{nrc.nrc}</Badge>
                    <Badge variant="outline">Sec. {nrc.seccion}</Badge>
                  </div>
                  <p className="mt-3 text-sm font-medium">{nrc.profesor_nombre}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => handleDeleteNrc(nrc.nrc)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                  <Users className="h-3.5 w-3.5" />
                  Cupo {nrc.cupo_max}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {nrc.sesiones.length} bloque(s)
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {nrc.sesiones
                  .slice()
                  .sort((a, b) => {
                    const dayDiff = DAYS.findIndex((day) => day.key === a.dia) - DAYS.findIndex((day) => day.key === b.dia);
                    if (dayDiff !== 0) return dayDiff;
                    return a.bloque_id - b.bloque_id;
                  })
                  .map((session) => {
                    const bloque = orderedBlocks.find((item) => item.id === session.bloque_id);
                    return (
                      <div
                        key={`${nrc.nrc}-${session.dia}-${session.bloque_id}`}
                        className="rounded-xl border bg-background px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{session.dia}</span>{" "}
                        <span className="text-muted-foreground">
                          {bloque
                            ? `${formatHour(bloque.hora_inicio)} - ${formatHour(bloque.hora_fin)}`
                            : `Bloque ${session.bloque_id}`}
                        </span>
                        <span className="text-muted-foreground"> | {session.aula_nombre}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
