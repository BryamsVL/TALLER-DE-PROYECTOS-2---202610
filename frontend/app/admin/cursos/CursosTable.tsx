"use client";

import Link from "next/link";
import { Eye, Power, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { eliminarCurso, toggleActivoCurso } from "./actions";

interface Curso {
  id: string;
  cycle: number;
  code: string;
  name: string;
  weeklyHours: number;
  requiredRoomType: string;
  isActive: boolean;
}

interface CursosTableProps {
  cursos: Curso[];
  nrcsPorCurso: Record<string, { nrc: string }[]>;
}

export function CursosTable({ cursos, nrcsPorCurso }: CursosTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Código</TableHead>
          <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Curso</TableHead>
          <TableHead className="w-[80px] font-semibold text-gray-500 uppercase text-[11px] tracking-wider text-center">Ciclo</TableHead>
          <TableHead className="w-[110px] font-semibold text-gray-500 uppercase text-[11px] tracking-wider text-center">Horas</TableHead>
          <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Tipo Aula</TableHead>
          <TableHead className="w-[80px] font-semibold text-gray-500 uppercase text-[11px] tracking-wider text-center">Instancias</TableHead>
          <TableHead className="w-[120px] font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Estado</TableHead>
          <TableHead className="w-[200px] text-right font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cursos.map((curso) => {
          const nrcs = nrcsPorCurso[curso.id] ?? [];

          return (
            <TableRow key={curso.id} className="group hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-medium text-gray-900">{curso.code}</TableCell>
                <TableCell className="font-medium text-gray-700">{curso.name}</TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 text-gray-600 font-medium text-xs">
                    {curso.cycle}
                  </span>
                </TableCell>
                <TableCell className="text-center text-gray-500">{curso.weeklyHours}h</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-white font-medium text-gray-600">
                    {curso.requiredRoomType}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-none font-bold">
                    {nrcs.length}
                  </Badge>
                </TableCell>
                <TableCell>
                  {curso.isActive ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700 hover:bg-green-100 border-none flex items-center gap-1 w-fit"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-400 border-gray-200 flex items-center gap-1 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      Inactivo
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-purple-600 hover:bg-purple-50">
                      <Link href={`/admin/cursos/${curso.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <form action={toggleActivoCurso}>
                      <input type="hidden" name="id" value={curso.id} />
                      <input
                        type="hidden"
                        name="activo"
                        value={String(curso.isActive)}
                      />
                      <Button type="submit" variant="ghost" size="icon" className={`h-8 w-8 ${curso.isActive ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                        <Power className="h-4 w-4" />
                      </Button>
                    </form>
                    <form action={eliminarCurso}>
                      <input type="hidden" name="id" value={curso.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
