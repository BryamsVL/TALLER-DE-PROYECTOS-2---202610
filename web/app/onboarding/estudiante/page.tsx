import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { OnboardingForm } from "./OnboardingForm";

// Esta pagina NO esta dentro de /estudiante/layout.tsx (vive un nivel arriba en
// /estudiante/onboarding/page.tsx pero comparte la cadena de auth). Se redirige
// fuera si el usuario ya completo el onboarding.

export default async function OnboardingPage() {
  const { user, profile } = await getSessionProfile();
  if (profile.rol !== "ESTUDIANTE") redirect("/dashboard");

  const supabase = await createClient();
  const { data: estudiante } = await supabase
    .from("estudiante")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (estudiante) redirect("/estudiante");

  const { data: carreras } = await supabase
    .from("carrera")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre", { ascending: true });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-display text-xl">Bienvenido</CardTitle>
          <CardDescription>
            Antes de continuar, indica a que carrera perteneces. Esto define que cursos
            te corresponden y bloquea la inscripcion a NRCs de otras carreras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm carreras={carreras ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
