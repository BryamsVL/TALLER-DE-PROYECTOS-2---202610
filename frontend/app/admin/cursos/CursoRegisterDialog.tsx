"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CursoForm } from "./CursoForm";

export function CursoRegisterDialog({ carreras = [] }: { carreras?: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        className="h-10 bg-purple-600 hover:bg-purple-700 font-semibold flex items-center gap-1.5 shrink-0"
      >
        <Plus className="h-4 w-4" />
        Crear nuevo curso
      </Button>
      <DialogContent className="max-w-3xl border border-gray-100 dark:border-gray-900 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-lg text-gray-900 dark:text-white">
            Crear nuevo curso
          </DialogTitle>
          <DialogDescription className="text-xs">
            Registra el curso con su ciclo, carga horaria y tipo de aula.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <CursoForm carreras={carreras} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
