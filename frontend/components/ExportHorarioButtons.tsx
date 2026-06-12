import { FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportHorarioButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" size="sm">
        <a href="/api/horario/export?formato=pdf" download>
          <FileText className="mr-1.5 h-4 w-4" />
          Exportar PDF
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href="/api/horario/export?formato=excel" download>
          <FileSpreadsheet className="mr-1.5 h-4 w-4" />
          Exportar Excel
        </a>
      </Button>
    </div>
  );
}
