"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { aprobarSolicitud, rechazarSolicitud } from "./actions";

export function SolicitudButtons({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAprobar() {
    setError(null);
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(async () => {
      const r = await aprobarSolicitud(fd);
      if (!r.ok) setError(r.message);
    });
  }

  function handleRechazar() {
    setError(null);
    if (!confirm("Rechazar solicitud?")) return;
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(async () => {
      const r = await rechazarSolicitud(fd);
      if (!r.ok) setError(r.message);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAprobar}
          disabled={pending}
        >
          {pending ? "..." : "Aprobar"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={handleRechazar}
          disabled={pending}
        >
          Rechazar
        </Button>
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
