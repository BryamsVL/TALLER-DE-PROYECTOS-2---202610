"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEnrollment } from "@/app/estudiante/inscripciones/EnrollmentContext";
import { CartSchedulePreview } from "@/app/estudiante/inscripciones/CartSchedulePreview";
import { matricularCarrito } from "@/app/estudiante/inscripciones/actions";

interface Bloque {
  id: number;
  orden: number;
  hora_inicio: string;
  hora_fin: string;
}

export function FloatingCartButton({ bloques }: { bloques: Bloque[] }) {
  const { cart, clearCart } = useEnrollment();
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (cart.size === 0) return null;

  const handleMatricular = () => {
    setErrorMsg(null);
    const nrcs = Array.from(cart.values()).map((c) => c.nrc);
    startTransition(async () => {
      const result = await matricularCarrito(nrcs);
      if (result.ok) {
        clearCart();
        setOpen(false);
        router.push("/estudiante/inscripciones");
        router.refresh();
      } else {
        setErrorMsg(result.message);
      }
    });
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 animate-in fade-in zoom-in duration-300">
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="h-16 w-16 rounded-full shadow-2xl relative group transition-transform hover:scale-105"
        >
          <Calendar className="h-7 w-7" />
          <Badge className="absolute -top-2 -right-2 px-2.5 py-1 bg-destructive text-destructive-foreground text-sm rounded-full">
            {cart.size}
          </Badge>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold">Vista previa de horario</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 pb-4">
            <CartSchedulePreview bloques={bloques} />
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMsg}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3 border-t pt-4 bg-background">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Seguir buscando
            </Button>
            <Button
              size="lg"
              onClick={handleMatricular}
              disabled={cart.size === 0 || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Matriculando...
                </>
              ) : (
                "Matricular"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
