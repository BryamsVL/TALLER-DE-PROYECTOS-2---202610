"use client";

import Link from "next/link";
import { Fragment, useState, useTransition, type ChangeEvent } from "react";
import { ChevronDown, ChevronRight, Plus, Power, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  asignarProfesorANrc,
  crearNrc,
  eliminarCurso,
  eliminarNrc,
  toggleActivoCurso,
} from "./actions";

interface Curso {
  id: number;
  carrera_id: number;
  nivel: number;
  codigo: string;
  nombre: string;
  horas_semanales: number;
  tipo_aula: string;
  activo: boolean;
}

interface NrcRow {
  nrc: string;
  curso_id: number;
  profesor_id: string | null;
  profesor_nombre: string | null;
}

interface ProfesorOption {
  id: string;
  nombre: string;
}

interface CursosTableProps {
  cursos: Curso[];
  carrerasMap: Record<number, string>;
  nrcsPorCurso: Record<number, NrcRow[]>;
  // Solo los profesores marcados como elegibles en /admin/asignaciones para cada curso.
  profesoresEligiblesPorCurso: Record<number, ProfesorOption[]>;
}

export function CursosTable({
  cursos,
  carrerasMap,
  nrcsPorCurso,
  profesoresEligiblesPorCurso,
}: CursosTableProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<{ cursoId: number; message: string } | null>(null);

  function toggleRow(id: number) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  }

  function handleCrearNrc(cursoId: number) {
    setError(null);
    const fd = new FormData();
    fd.set("cursoId", String(cursoId));
    startTransition(async () => {
      const result = await crearNrc(fd);
      if (!result.ok) setError({ cursoId, message: result.message });
      else {
        const next = new Set(expanded);
        next.add(cursoId);
        setExpanded(next);
      }
    });
  }

  function handleEliminarNrc(nrc: string, cursoId: number) {
    setError(null);
    const fd = new FormData();
    fd.set("nrc", nrc);
    startTransition(async () => {
      const result = await eliminarNrc(fd);
      if (!result.ok) setError({ cursoId, message: result.message });
    });
  }

  function handleAsignarProfesor(
    event: ChangeEvent<HTMLSelectElement>,
    nrc: string,
    cursoId: number,
  ) {
    setError(null);
    const fd = new FormData();
    fd.set("nrc", nrc);
    fd.set("profesorId", event.target.value);
    startTransition(async () => {
      const result = await asignarProfesorANrc(fd);
      if (!result.ok) setError({ cursoId, message: result.message });
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
          <TableHead className="w-[110px]">Horas</TableHead>
          <TableHead>Tipo aula</TableHead>
          <TableHead className="w-[80px]">NRCs</TableHead>
          <TableHead className="w-[120px]">Estado</TableHead>
          <TableHead className="w-[200px] text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cursos.map((curso) => {
          const nrcs = nrcsPorCurso[curso.id] ?? [];
          const eligibles = profesoresEligiblesPorCurso[curso.id] ?? [];
          const isOpen = expanded.has(curso.id);
          const showError = error?.cursoId === curso.id;
          const sinEligibles = eligibles.length === 0;

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
                <TableCell>{carrerasMap[curso.carrera_id] ?? "Sin carrera"}</TableCell>
                <TableCell>{curso.nivel}</TableCell>
                <TableCell>{curso.horas_semanales}</TableCell>
                <TableCell>{curso.tipo_aula}</TableCell>
                <TableCell>
                  <Badge variant="outline">{nrcs.length}</Badge>
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
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <form action={toggleActivoCurso}>
                      <input type="hidden" name="id" value={curso.id} />
                      <input
                        type="hidden"
                        name="activo"
                        value={String(curso.activo)}
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        <Power className="h-3.5 w-3.5" />
                        {curso.activo ? "Desactivar" : "Activar"}
                      </Button>
                    </form>
                    <form action={eliminarCurso}>
                      <input type="hidden" name="id" value={curso.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>

              {isOpen && (
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableCell colSpan={10}>
                    <div className="space-y-3 px-2 py-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                          NRCs del curso ({nrcs.length})
                        </h4>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleCrearNrc(curso.id)}
                          disabled={pending}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Anadir NRC
                        </Button>
                      </div>

                      {sinEligibles && (
                        <p className="text-xs text-muted-foreground">
                          Este curso no tiene docentes elegibles. Marca docentes habilitados en{" "}
                          <Link
                            href="/admin/asignaciones"
                            className="font-medium underline underline-offset-2"
                          >
                            /admin/asignaciones
                          </Link>{" "}
                          para poder asignarlos a sus NRCs.
                        </p>
                      )}

                      {showError && (
                        <p className="text-xs text-destructive">{error?.message}</p>
                      )}

                      {nrcs.length === 0 ? (
                        <p className="py-3 text-center text-xs text-muted-foreground">
                          Aun no hay NRCs. Anade el primero con el boton de arriba.
                        </p>
                      ) : (
                        <div className="overflow-hidden rounded-md border bg-background">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[110px]">NRC</TableHead>
                                <TableHead>Docente asignado</TableHead>
                                <TableHead className="w-[120px] text-right">
                                  Acciones
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {nrcs.map((row) => (
                                <TableRow key={row.nrc}>
                                  <TableCell className="font-mono text-sm">
                                    {row.nrc}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={row.profesor_id ?? ""}
                                        onChange={(e) =>
                                          handleAsignarProfesor(e, row.nrc, curso.id)
                                        }
                                        disabled={pending || sinEligibles}
                                        className="flex h-8 w-full max-w-xs rounded-md border border-input bg-transparent px-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                      >
                                        <option value="">
                                          {sinEligibles ? "Sin docentes elegibles" : "Sin asignar"}
                                        </option>
                                        {eligibles.map((prof) => (
                                          <option key={prof.id} value={prof.id}>
                                            {prof.nombre}
                                          </option>
                                        ))}
                                      </select>
                                      {row.profesor_id ? (
                                        <Badge
                                          variant="secondary"
                                          className="bg-success/20 text-success-foreground"
                                        >
                                          Asignado
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">Libre</Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex justify-end">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEliminarNrc(row.nrc, curso.id)}
                                        disabled={pending}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Eliminar
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
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
