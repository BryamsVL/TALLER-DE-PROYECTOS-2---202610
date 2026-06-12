"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dia } from "@/lib/scheduler/types";
import { useEnrollment } from "@/app/estudiante/inscripciones/EnrollmentContext";

interface NrcCard {
  nrc: string;
  profesor_nombre: string;
  cupo_max: number;
  ocupados: number;
  lleno: boolean;
  sesiones: Array<{ dia: Dia; bloque_id: number; aula_nombre: string }>;
}

interface Bloque {
  id: number;
  orden: number;
  hora_inicio: string;
  hora_fin: string;
  turno: string;
}

interface StudentCourseWorkspaceProps {
  course: {
    id: number;
    codigo: string;
    nombre: string;
    nivel: number;
  };
  bloques: Bloque[];
  nrcs: NrcCard[];
  enrolledNrc: string | null;
}

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
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i));
  }
  const hue = Math.abs(Math.floor(hash * 137.5)) % 360;
  return {
    background: `hsl(${hue} 80% 90%)`,
    border: `hsl(${hue} 90% 45%)`,
    text: `hsl(${hue} 100% 20%)`,
  };
}

function formatHour(value: string) {
  return value.slice(0, 5);
}

export function StudentCourseWorkspace({
  course,
  bloques,
  nrcs,
  enrolledNrc,
}: StudentCourseWorkspaceProps) {
  const { cart, addNrcToCart } = useEnrollment();
  const cartItem = cart.get(course.id);

  const [hoveredNrc, setHoveredNrc] = useState<string | null>(null);
  const [selectedNrc, setSelectedNrc] = useState<string | null>(cartItem?.nrc ?? enrolledNrc);

  const orderedBlocks = useMemo(
    () => [...bloques].sort((a, b) => a.orden - b.orden),
    [bloques],
  );

  const sessionsBySlot = useMemo(() => {
    const map = new Map<string, Array<{ nrc: string; aula: string; profesor: string }>>();
    for (const nrc of nrcs) {
      for (const session of nrc.sesiones) {
        const key = `${session.dia}|${session.bloque_id}`;
        const current = map.get(key) ?? [];
        current.push({
          nrc: nrc.nrc,
          aula: session.aula_nombre,
          profesor: nrc.profesor_nombre,
        });
        map.set(key, current);
      }
    }
    return map;
  }, [nrcs]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/estudiante/inscripciones">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {course.nombre}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {course.codigo} • Ciclo {course.nivel}
            </p>
          </div>
        </div>
        <div>
          <Button
            disabled={!selectedNrc || selectedNrc === enrolledNrc || !!cartItem}
            onClick={() => {
              if (selectedNrc && !cartItem) {
                const nrcDetails = nrcs.find(n => n.nrc === selectedNrc);
                if (nrcDetails) {
                  addNrcToCart({
                    courseId: course.id,
                    courseName: course.nombre,
                    nrc: nrcDetails.nrc,
                    profesor: nrcDetails.profesor_nombre,
                    sesiones: nrcDetails.sesiones,
                  });
                }
              }
            }}
          >
            {selectedNrc === cartItem?.nrc 
              ? "Añadido al horario" 
              : cartItem 
                ? "Curso ya añadido" 
                : "Añadir"}
          </Button>
        </div>
      </header>

      <section className="grid gap-6">
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="font-display text-lg font-bold tracking-tight">Calendario semanal</h2>
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
                      <div className="text-xs text-muted-foreground">
                        {formatHour(block.hora_inicio)} - {formatHour(block.hora_fin)}
                      </div>
                    </div>

                    {DAYS.map((day) => {
                      const items = sessionsBySlot.get(`${day.key}|${block.id}`) ?? [];
                      return (
                        <div
                          key={`${day.key}-${block.id}`}
                          className={`min-h-28 space-y-2 border-l px-2 py-2 ${isLast ? "" : "border-b"
                            }`}
                        >
                          {items.map((item) => {
                            const isHovered = hoveredNrc === item.nrc;
                            const isEnrolled = enrolledNrc === item.nrc;
                            const isSelected = selectedNrc === item.nrc;
                            const color = stableColor(item.nrc);
                            const dim = (hoveredNrc !== null && !isHovered) || (selectedNrc !== null && !isSelected);

                            return (
                              <button
                                key={`${item.nrc}-${day.key}-${block.id}`}
                                type="button"
                                onClick={() => setSelectedNrc(isSelected ? null : item.nrc)}
                                className={`relative w-full text-left rounded-none border p-2 transition-all outline-none ${isSelected || isEnrolled ? "ring-2 ring-primary ring-offset-1 scale-[1.02] z-10" : "hover:scale-[1.02] z-0"
                                  }`}
                                style={{
                                  backgroundColor: color.background,
                                  borderColor: color.border,
                                  color: color.text,
                                  opacity: dim ? 0.3 : 1,
                                }}
                                onMouseEnter={() => setHoveredNrc(item.nrc)}
                                onMouseLeave={() => setHoveredNrc(null)}
                              >
                                <div className="text-xs font-semibold">NRC: {item.nrc}</div>
                                <div className="mt-1 text-[11px] line-clamp-2">{item.profesor}</div>
                              </button>
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
      </section>
    </div>
  );
}
