"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { useEnrollment } from "@/app/estudiante/inscripciones/EnrollmentContext";
import type { CartItem } from "@/app/estudiante/inscripciones/EnrollmentContext";

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

interface Bloque {
  id: number;
  orden: number;
  hora_inicio: string;
  hora_fin: string;
}

export function CartSchedulePreview({ bloques }: { bloques: Bloque[] }) {
  const { cart, removeCourseFromCart } = useEnrollment();

  const sessionsBySlot = useMemo(() => {
    const map = new Map<string, CartItem[]>();
    for (const item of cart.values()) {
      for (const session of item.sesiones) {
        const key = `${session.dia}|${session.bloque_id}`;
        const current = map.get(key) ?? [];
        current.push(item);
        map.set(key, current);
      }
    }
    return map;
  }, [cart]);

  if (cart.size === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground border border-dashed rounded-xl">
        No has seleccionado ningun horario aún.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
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

        {bloques.map((block, index) => {
          const isLast = index === bloques.length - 1;

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
                    className={`min-h-28 space-y-2 border-l px-2 py-2 ${isLast ? "" : "border-b"}`}
                  >
                    {items.map((item) => {
                      const color = stableColor(item.nrc);
                      
                      return (
                        <div
                          key={`${item.courseId}-${item.nrc}`}
                          className="relative w-full rounded-none border p-2 pr-8 shadow-sm group"
                          style={{
                            backgroundColor: color.background,
                            borderColor: items.length > 1 ? "hsl(0, 80%, 50%)" : color.border,
                            color: color.text,
                            borderWidth: items.length > 1 ? "2px" : "1px"
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => removeCourseFromCart(item.courseId)}
                            className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-none bg-transparent opacity-0 md:group-hover:opacity-100 transition-opacity text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                            title="Eliminar del carrito"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          
                          {items.length > 1 && (
                            <div className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0.5 rounded-sm font-bold z-10 shadow-sm">
                              Cruce
                            </div>
                          )}

                          <div className="text-[11px] font-bold uppercase truncate" title={item.courseName}>{item.courseName}</div>
                          <div className="text-xs font-semibold mt-0.5">NRC: {item.nrc}</div>
                          <div className="mt-1 text-[10px] line-clamp-1 opacity-80">{item.profesor}</div>
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
  );
}
