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
import { CarreraForm } from "./CarreraForm";

export function CarreraRegisterDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        className="h-10 bg-violet-600 hover:bg-violet-700 font-semibold flex items-center gap-1.5 shrink-0"
      >
        <Plus className="h-4 w-4" />
        Crear nueva carrera
      </Button>
      <DialogContent className="max-w-lg border border-gray-100 dark:border-gray-900 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-lg text-gray-900 dark:text-white">
            Crear nueva carrera
          </DialogTitle>
          <DialogDescription className="text-xs">
            Añade una nueva carrera profesional al catálogo oficial de la facultad.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <CarreraForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
