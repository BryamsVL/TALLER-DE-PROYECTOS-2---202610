import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { UsuariosTable, type UsuarioRow } from "./UsuariosTable";

// Prisma usa el enum UserRole en inglés; la UI muestra roles en español.
const DB_A_UI: Record<string, UsuarioRow["rol"]> = {
  ADMIN: "ADMIN",
  COORDINATOR: "COORDINADOR",
  TEACHER: "DOCENTE",
  STUDENT: "ESTUDIANTE",
};

export default async function UsuariosPage() {
  const { user: caller } = await getSessionProfile();

  let fetchError: string | null = null;
  let usuarios: UsuarioRow[] = [];
  let carreras: { id: string; nombre: string }[] = [];

  try {
    const [users, carrerasDb] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          teacher: { select: { specialty: true } },
          student: {
            select: { carreraId: true, carrera: { select: { name: true } } },
          },
        },
        orderBy: { fullName: "asc" },
      }),
      prisma.carrera.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    carreras = carrerasDb.map((c) => ({ id: c.id, nombre: c.name }));

    usuarios = users.map((u) => {
      const rol = DB_A_UI[u.role] ?? "ESTUDIANTE";
      const tipo =
        rol === "DOCENTE"
          ? u.teacher?.specialty === "Medio Tiempo"
            ? "MEDIO_TIEMPO"
            : "TIEMPO_COMPLETO"
          : null;
      return {
        perfilId: u.id,
        nombre: u.fullName,
        email: u.email,
        rol,
        activo: u.isActive,
        tipo,
        carreraId: u.student?.carreraId ?? null,
        carreraNombre: u.student?.carrera?.name ?? null,
      };
    });
  } catch (error: any) {
    fetchError = error?.message ?? "Error cargando usuarios.";
  }

  const total = usuarios.length;
  const activos = usuarios.filter((u) => u.activo).length;
  const porRol = usuarios.reduce<Record<string, number>>((acc, u) => {
    acc[u.rol] = (acc[u.rol] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edita roles, controla estados y elimina cuentas. Los datos de profesor /
          estudiante de un rol previo se conservan al cambiar.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="font-display text-2xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Activos</CardDescription>
            <CardTitle className="font-display text-2xl">{activos}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Docentes</CardDescription>
            <CardTitle className="font-display text-2xl">{porRol.DOCENTE ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Estudiantes</CardDescription>
            <CardTitle className="font-display text-2xl">
              {porRol.ESTUDIANTE ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Listado</CardTitle>
          <CardDescription>
            {total} usuario{total === 1 ? "" : "s"} registrado{total === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchError && (
            <p className="mb-4 text-sm text-destructive">Error: {fetchError}</p>
          )}

          {!fetchError && total === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay usuarios registrados.
            </p>
          )}

          {total > 0 && (
            <UsuariosTable
              usuarios={usuarios}
              carreras={carreras}
              selfId={caller.id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
