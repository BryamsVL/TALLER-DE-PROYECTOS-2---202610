"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { inscribirseEnNrc, retirarseDeNrc } from "./actions";

export function InscribirseButton({ nrc }: { nrc: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        onClick={() => {
          setError(null);
          const fd = new FormData();
          fd.set("nrc", nrc);
          startTransition(async () => {
            const r = await inscribirseEnNrc(fd);
            if (!r.ok) setError(r.message);
          });
        }}
        disabled={pending}
      >
        {pending ? "Inscribiendo..." : "Inscribirme"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

export function RetirarseButton({ nrc }: { nrc: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-destructive hover:text-destructive"
        onClick={() => {
          setError(null);
          if (!confirm(`Retirar inscripcion del NRC ${nrc}?`)) return;
          const fd = new FormData();
          fd.set("nrc", nrc);
          startTransition(async () => {
            const r = await retirarseDeNrc(fd);
            if (!r.ok) setError(r.message);
          });
        }}
        disabled={pending}
      >
        {pending ? "Retirando..." : "Retirarme"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
