"use client";

import Link from "next/link";
import { Eye, Power, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { eliminarCurso, toggleActivoCurso } from "./actions";

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

interface CursosTableProps {
  cursos: Curso[];
  carrerasMap: Record<number, string>;
  nrcsPorCurso: Record<number, { nrc: string }[]>;
}

export function CursosTable({ cursos, carrerasMap, nrcsPorCurso }: CursosTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
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

          return (
            <TableRow key={curso.id}>
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
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/cursos/${curso.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                        Detalle
                      </Link>
                    </Button>
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
          );
        })}
      </TableBody>
    </Table>
  );
}
