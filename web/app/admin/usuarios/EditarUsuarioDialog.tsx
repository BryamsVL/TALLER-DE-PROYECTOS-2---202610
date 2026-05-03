"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actualizarUsuario } from "./actions";

type Rol = "ADMIN" | "COORDINADOR" | "DOCENTE" | "ESTUDIANTE";
type TipoProfesor = "TIEMPO_COMPLETO" | "MEDIO_TIEMPO";

export interface UsuarioEdit {
  perfilId: string;
  nombre: string;
  rol: Rol;
  activo: boolean;
  tipo: TipoProfesor | null;
  carreraId: number | null;
}

interface EditarUsuarioDialogProps {
  usuario: UsuarioEdit | null;
  carreras: { id: number; nombre: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLES: { value: Rol; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "COORDINADOR", label: "Coordinador" },
  { value: "DOCENTE", label: "Docente" },
  { value: "ESTUDIANTE", label: "Estudiante" },
];

const TIPOS: { value: TipoProfesor; label: string }[] = [
  { value: "TIEMPO_COMPLETO", label: "Tiempo completo" },
  { value: "MEDIO_TIEMPO", label: "Medio tiempo" },
];

export function EditarUsuarioDialog({
  usuario,
  carreras,
  open,
  onOpenChange,
}: EditarUsuarioDialogProps) {
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<Rol>("ESTUDIANTE");
  const [activo, setActivo] = useState(true);
  const [tipo, setTipo] = useState<TipoProfesor>("TIEMPO_COMPLETO");
  const [carreraId, setCarreraId] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre);
      setRol(usuario.rol);
      setActivo(usuario.activo);
      setTipo(usuario.tipo ?? "TIEMPO_COMPLETO");
      setCarreraId(usuario.carreraId ?? "");
      setError(null);
    }
  }, [usuario]);

  if (!usuario) return null;

  function handleSave() {
    if (!usuario) return;
    setError(null);

    const fd = new FormData();
    fd.set("perfilId", usuario.perfilId);
    fd.set("nombre", nombre);
    fd.set("rol", rol);
    fd.set("activo", activo ? "true" : "false");
    if (rol === "DOCENTE") fd.set("tipo", tipo);
    if (rol === "ESTUDIANTE" && carreraId !== "") fd.set("carreraId", String(carreraId));

    startTransition(async () => {
      const result = await actualizarUsuario(fd);
      if (!result.ok) setError(result.message);
      else onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Actualiza el rol y los datos asociados. La fila previa en
            profesor/estudiante se conserva si cambias de rol.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="usr-nombre">Nombre</Label>
            <Input
              id="usr-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="usr-rol">Rol</Label>
              <select
                id="usr-rol"
                value={rol}
                onChange={(e) => setRol(e.target.value as Rol)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="usr-activo">Estado</Label>
              <select
                id="usr-activo"
                value={activo ? "true" : "false"}
                onChange={(e) => setActivo(e.target.value === "true")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {rol === "DOCENTE" && (
            <div className="space-y-1.5">
              <Label htmlFor="usr-tipo">Tipo de docente</Label>
              <select
                id="usr-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoProfesor)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {rol === "ESTUDIANTE" && (
            <div className="space-y-1.5">
              <Label htmlFor="usr-carrera">Carrera</Label>
              <select
                id="usr-carrera"
                value={carreraId === "" ? "" : String(carreraId)}
                onChange={(e) =>
                  setCarreraId(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Selecciona una carrera</option>
                {carreras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {carreras.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No hay carreras registradas. Crea una en /admin/carreras.
                </p>
              )}
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={pending}>
            {pending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
