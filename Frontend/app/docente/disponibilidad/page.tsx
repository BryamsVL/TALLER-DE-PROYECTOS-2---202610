import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { HorarioPreferente } from "./HorarioPreferente";

export default async function DisponibilidadPage() {
  const { user } = await getSessionProfile();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("disponibilidad_profesor")
    .select("dia, turno")
    .eq("profesor_id", user.id);

  const initial = new Set((data ?? []).map((row) => `${row.dia}-${row.turno}`));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Horario preferente
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marca los turnos en los que prefieres dictar clase. El generador de horarios
          solo te asignara sesiones dentro de tus turnos marcados.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Turnos disponibles</CardTitle>
          <CardDescription>
            Cada celda marcada se guarda al instante. Domingo no esta disponible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 text-sm text-destructive">
              Error cargando tu disponibilidad: {error.message}
            </p>
          )}
          <HorarioPreferente initial={initial} />
        </CardContent>
      </Card>
    </div>
  );
}
