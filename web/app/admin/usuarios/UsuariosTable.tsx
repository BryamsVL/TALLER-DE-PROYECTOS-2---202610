"use client";

import { useState, useTransition } from "react";
import { Pencil, Power, Trash2 } from "lucide-react";
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
import { eliminarUsuario, toggleActivoUsuario } from "./actions";
import { EditarUsuarioDialog, type UsuarioEdit } from "./EditarUsuarioDialog";

type Rol = "ADMIN" | "COORDINADOR" | "DOCENTE" | "ESTUDIANTE";

export interface UsuarioRow {
  perfilId: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  tipo: "TIEMPO_COMPLETO" | "MEDIO_TIEMPO" | null;
  carreraId: number | null;
  carreraNombre: string | null;
}

interface UsuariosTableProps {
  usuarios: UsuarioRow[];
  carreras: { id: number; nombre: string }[];
  // Para evitar que el admin se elimine a si mismo.
  selfId: string;
}

const ROL_LABEL: Record<Rol, string> = {
  ADMIN: "Admin",
  COORDINADOR: "Coordinador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
};

const ROL_VARIANT: Record<Rol, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  COORDINADOR: "default",
  DOCENTE: "secondary",
  ESTUDIANTE: "outline",
};

export function UsuariosTable({ usuarios, carreras, selfId }: UsuariosTableProps) {
  const [editing, setEditing] = useState<UsuarioEdit | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<{ id: string; message: string } | null>(null);

  function handleEdit(u: UsuarioRow) {
    setEditing({
      perfilId: u.perfilId,
      nombre: u.nombre,
      rol: u.rol,
      activo: u.activo,
      tipo: u.tipo,
      carreraId: u.carreraId,
    });
    setOpen(true);
  }

  function handleToggleActivo(u: UsuarioRow) {
    setError(null);
    const fd = new FormData();
    fd.set("perfilId", u.perfilId);
    fd.set("activo", String(u.activo));

    startTransition(async () => {
      const result = await toggleActivoUsuario(fd);
      if (!result.ok) setError({ id: u.perfilId, message: result.message });
    });
  }

  function handleEliminar(u: UsuarioRow) {
    setError(null);
    if (!confirm(`Eliminar a ${u.nombre} (${u.email})? Esta accion es irreversible.`)) {
      return;
    }
    const fd = new FormData();
    fd.set("perfilId", u.perfilId);

    startTransition(async () => {
      const result = await eliminarUsuario(fd);
      if (!result.ok) setError({ id: u.perfilId, message: result.message });
    });
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Detalle</TableHead>
            <TableHead className="w-[120px]">Estado</TableHead>
            <TableHead className="w-[280px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((u) => {
            const showError = error?.id === u.perfilId;
            const isSelf = u.perfilId === selfId;
            const detalle =
              u.rol === "DOCENTE"
                ? u.tipo === "TIEMPO_COMPLETO"
                  ? "Tiempo completo"
                  : u.tipo === "MEDIO_TIEMPO"
                    ? "Medio tiempo"
                    : "Sin tipo"
                : u.rol === "ESTUDIANTE"
                  ? u.carreraNombre ?? "Sin carrera"
                  : "—";

            return (
              <TableRow key={u.perfilId}>
                <TableCell>
                  <div className="font-medium">{u.nombre}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                  {showError && (
                    <p className="mt-1 text-xs text-destructive">{error?.message}</p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={ROL_VARIANT[u.rol]}>{ROL_LABEL[u.rol]}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{detalle}</TableCell>
                <TableCell>
                  {u.activo ? (
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
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(u)}
                      disabled={pending}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActivo(u)}
                      disabled={pending}
                    >
                      <Power className="h-3.5 w-3.5" />
                      {u.activo ? "Desactivar" : "Activar"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEliminar(u)}
                      disabled={pending || isSelf}
                      className="text-destructive hover:text-destructive disabled:opacity-50"
                      title={isSelf ? "No puedes eliminarte a ti mismo" : undefined}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <EditarUsuarioDialog
        usuario={editing}
        carreras={carreras}
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
      />
    </>
  );
}
