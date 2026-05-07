import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { UsuariosTable, type UsuarioRow } from "./UsuariosTable";

export default async function UsuariosPage() {
  const { user: caller } = await getSessionProfile();
  const supabase = await createClient();

  const [
    { data: perfiles, error: perfilesError },
    { data: profesores, error: profesoresError },
    { data: estudiantes, error: estudiantesError },
    { data: carreras, error: carrerasError },
  ] = await Promise.all([
    supabase
      .from("perfil")
      .select("id, nombre, rol, activo")
      .order("nombre", { ascending: true }),
    supabase.from("profesor").select("id, tipo"),
    supabase.from("estudiante").select("id, carrera_id"),
    supabase.from("carrera").select("id, nombre").order("nombre", { ascending: true }),
  ]);

  // Emails: requieren admin client. Si no esta configurada la service role key,
  // mostramos el listado sin emails (en lugar de fallar).
  let emailPorId = new Map<string, string>();
  let emailFetchError: string | null = null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) emailFetchError = error.message;
    else emailPorId = new Map((data.users ?? []).map((u) => [u.id, u.email ?? ""]));
  } catch (err) {
    emailFetchError = err instanceof Error ? err.message : "Configura SUPABASE_SERVICE_ROLE_KEY.";
  }

  const tipoPorId = new Map((profesores ?? []).map((p) => [p.id, p.tipo]));
  const carreraPorEstudiante = new Map(
    (estudiantes ?? []).map((e) => [e.id, e.carrera_id]),
  );
  const carreraNombre = new Map((carreras ?? []).map((c) => [c.id, c.nombre]));

  const usuarios: UsuarioRow[] = (perfiles ?? []).map((p) => {
    const carreraId = carreraPorEstudiante.get(p.id) ?? null;
    return {
      perfilId: p.id,
      nombre: p.nombre,
      email: emailPorId.get(p.id) ?? "(sin email)",
      rol: p.rol as UsuarioRow["rol"],
      activo: p.activo,
      tipo: (tipoPorId.get(p.id) as UsuarioRow["tipo"]) ?? null,
      carreraId,
      carreraNombre: carreraId ? carreraNombre.get(carreraId) ?? null : null,
    };
  });

  const fetchError =
    perfilesError?.message ??
    profesoresError?.message ??
    estudiantesError?.message ??
    carrerasError?.message;

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
            {emailFetchError && (
              <span className="text-destructive">
                Emails no disponibles: {emailFetchError}.{" "}
              </span>
            )}
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
              carreras={carreras ?? []}
              selfId={caller.id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
