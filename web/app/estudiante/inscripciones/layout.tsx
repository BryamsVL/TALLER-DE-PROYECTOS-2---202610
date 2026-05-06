import { ReactNode } from "react";
import { EnrollmentProvider } from "@/app/estudiante/inscripciones/EnrollmentContext";
import { FloatingCartButton } from "@/app/estudiante/inscripciones/FloatingCartButton";
import { createClient } from "@/lib/supabase/server";

export default async function InscripcionesLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: bloques } = await supabase
    .from("bloque_horario")
    .select("id, orden, hora_inicio, hora_fin, turno")
    .order("orden", { ascending: true });

  return (
    <EnrollmentProvider>
      {children}
      <FloatingCartButton bloques={bloques ?? []} />
    </EnrollmentProvider>
  );
}
