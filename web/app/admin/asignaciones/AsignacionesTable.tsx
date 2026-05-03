"use client";

import { Fragment, useState, useTransition } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { setAsignacion } from "./actions";

interface CursoRow {
  id: number;
  codigo: string;
  nombre: string;
  carrera_nombre: string;
  nivel: number;
  activo: boolean;
}

interface ProfesorOption {
  id: string;
  nombre: string;
  tipo: string;
}

interface AsignacionesTableProps {
  cursos: CursoRow[];
  profesores: ProfesorOption[];
  // Set de "cursoId-profesorId" para lookup O(1).
  asignados: Set<string>;
}

function key(cursoId: number, profesorId: string) {
  return `${cursoId}-${profesorId}`;
}

export function AsignacionesTable({
  cursos,
  profesores,
  asignados,
}: AsignacionesTableProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [pending, startTransition] = useTransition();
  // Estado optimista local: el server revalida pero la UI reacciona al instante.
  const [localAsignados, setLocalAsignados] = useState(asignados);
  const [error, setError] = useState<{ cursoId: number; message: string } | null>(null);

  function toggleRow(id: number) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  }

  function handleToggle(cursoId: number, profesorId: string, activar: boolean) {
    setError(null);
    const k = key(cursoId, profesorId);

    // Optimista
    const optimistic = new Set(localAsignados);
    if (activar) optimistic.add(k);
    else optimistic.delete(k);
    setLocalAsignados(optimistic);

    const fd = new FormData();
    fd.set("cursoId", String(cursoId));
    fd.set("profesorId", profesorId);
    fd.set("activar", activar ? "true" : "false");

    startTransition(async () => {
      const result = await setAsignacion(fd);
      if (!result.ok) {
        // Rollback
        const rollback = new Set(localAsignados);
        if (activar) rollback.delete(k);
        else rollback.add(k);
        setLocalAsignados(rollback);
        setError({ cursoId, message: result.message });
      }
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]" />
          <TableHead>Codigo</TableHead>
          <TableHead>Curso</TableHead>
          <TableHead>Carrera</TableHead>
          <TableHead className="w-[80px]">Nivel</TableHead>
          <TableHead className="w-[140px]">Docentes asignados</TableHead>
          <TableHead className="w-[100px]">Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cursos.map((curso) => {
          const isOpen = expanded.has(curso.id);
          const asignadosDelCurso = profesores.filter((p) =>
            localAsignados.has(key(curso.id, p.id)),
          );
          const showError = error?.cursoId === curso.id;

          return (
            <Fragment key={curso.id}>
              <TableRow>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => toggleRow(curso.id)}
                    aria-label={isOpen ? "Contraer" : "Expandir"}
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{curso.codigo}</TableCell>
                <TableCell>{curso.nombre}</TableCell>
                <TableCell>{curso.carrera_nombre}</TableCell>
                <TableCell>{curso.nivel}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {asignadosDelCurso.length} / {profesores.length}
                  </Badge>
                </TableCell>
                <TableCell>
                  {curso.activo ? (
                    <Badge
                      variant="secondary"
                      className="bg-success/20 text-success-foreground"
                    >
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="outline">Inactivo</Badge>
                  )}
                </TableCell>
              </TableRow>

              {isOpen && (
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableCell colSpan={7}>
                    <div className="space-y-3 px-2 py-2">
                      <h4 className="text-sm font-medium">
                        Docentes elegibles para dictar este curso
                      </h4>

                      {showError && (
                        <p className="text-xs text-destructive">{error?.message}</p>
                      )}

                      {profesores.length === 0 ? (
                        <p className="py-3 text-center text-xs text-muted-foreground">
                          No hay profesores activos. Registra docentes en /admin/profesores.
                        </p>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {profesores.map((p) => {
                            const k = key(curso.id, p.id);
                            const checked = localAsignados.has(k);
                            return (
                              <label
                                key={p.id}
                                className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
                              >
                                <Checkbox
                                  checked={checked}
                                  disabled={pending}
                                  onCheckedChange={(value) =>
                                    handleToggle(curso.id, p.id, Boolean(value))
                                  }
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="truncate font-medium">{p.nombre}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {p.tipo}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
