"use client";

import { useState, useTransition } from "react";
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  Clock, 
  FileEdit, 
  Trash2, 
  Power, 
  Search, 
  BookOpen, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { eliminarProfesor, toggleActivoProfesor, editarProfesor } from "./actions";
import { ProfesorForm } from "./ProfesorForm";
import { UserPlus } from "lucide-react";

interface TeacherGridClientProps {
  initialProfesores: any[];
  todosLosCursos: any[];
  todasLasCarreras: any[];
  todosLosSlots: any[];
}

const DAYS_MAP: { [key: string]: string } = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
};

const DAYS_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const SHIFTS = [
  { name: "Mañana (B1 - B4)", blocks: [1, 2, 3, 4] },
  { name: "Tarde (B5 - B7)", blocks: [5, 6, 7] },
  { name: "Noche (B8 - B9)", blocks: [8, 9] },
];

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600 text-white",
  "from-purple-500 to-pink-600 text-white",
  "from-emerald-400 to-teal-600 text-white",
  "from-orange-400 to-red-600 text-white",
  "from-cyan-400 to-blue-600 text-white",
  "from-fuchsia-500 to-purple-600 text-white",
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + (parts[1][0] || "")).toUpperCase();
  }
  return (fullName[0] ?? "").toUpperCase();
}

export function TeacherGridClient({
  initialProfesores,
  todosLosCursos,
  todasLasCarreras,
  todosLosSlots,
}: TeacherGridClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  // States inside edit modal
  const [editNombre, setEditNombre] = useState("");
  const [editSpecialty, setEditSpecialty] = useState("");
  const [editAppointment, setEditAppointment] = useState<"NOMBRADO" | "CONTRATADO">("CONTRATADO");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  
  const [isPending, startTransition] = useTransition();

  // Filter teachers based on search term (name, code, or specialty)
  const filteredProfesores = initialProfesores.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term) ||
      (p.specialty && p.specialty.toLowerCase().includes(term))
    );
  });

  const openEditModal = (teacher: any) => {
    setSelectedTeacher(teacher);
    setEditNombre(teacher.fullName);
    setEditSpecialty(teacher.specialty || "");
    setEditAppointment(teacher.appointmentType === "NOMBRADO" ? "NOMBRADO" : "CONTRATADO");
    setSelectedCourseIds(teacher.teacherCourses.map((tc: any) => tc.courseId));
    setSelectedSlotIds(teacher.availability.map((av: any) => av.timeSlotId));
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTeacher) return;
    if (!editNombre.trim() || !editSpecialty.trim()) {
      toast.error("Por favor completa el nombre completo y la carrera/especialidad.");
      return;
    }

    startTransition(async () => {
      const res = await editarProfesor(
        selectedTeacher.id,
        editNombre,
        editSpecialty,
        selectedCourseIds,
        selectedSlotIds,
        editAppointment
      );

      if (res.success) {
        toast.success("Perfil del profesor actualizado exitosamente.");
        setIsEditOpen(false);
      } else {
        toast.error(res.error || "No se pudo actualizar el profesor.");
      }
    });
  };

  const toggleSlot = (slotId: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  const selectAllShiftSlots = (blocks: number[]) => {
    // Select all time slots in todosLosSlots that correspond to the given block orders
    const matchingSlotIds = todosLosSlots
      .filter((s) => blocks.includes(s.slotOrder))
      .map((s) => s.id);
    
    setSelectedSlotIds((prev) => {
      const filtered = prev.filter((id) => !matchingSlotIds.includes(id));
      return [...filtered, ...matchingSlotIds];
    });
    toast.info("Horas de turno agregadas.");
  };

  const clearShiftSlots = (blocks: number[]) => {
    const matchingSlotIds = todosLosSlots
      .filter((s) => blocks.includes(s.slotOrder))
      .map((s) => s.id);

    setSelectedSlotIds((prev) => prev.filter((id) => !matchingSlotIds.includes(id)));
    toast.info("Horas de turno removidas.");
  };

  const selectAllSlots = () => {
    setSelectedSlotIds(todosLosSlots.map((s) => s.id));
    toast.info("Disponibilidad completa seleccionada.");
  };

  const clearAllSlots = () => {
    setSelectedSlotIds([]);
    toast.info("Toda la disponibilidad ha sido limpiada.");
  };

  // Group slots by Day and SlotOrder
  const getSlotByDayAndOrder = (day: string, order: number) => {
    return todosLosSlots.find((s) => s.dayOfWeek === day && s.slotOrder === order);
  };

  return (
    <div className="space-y-6">
      {/* Search and Quick Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-900 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar docente por nombre, código o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 border-gray-100 dark:border-gray-900 focus-visible:ring-blue-500"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1 h-8 w-8 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground font-medium bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-100/50 dark:border-gray-800">
            Mostrando <span className="text-gray-900 dark:text-white font-semibold">{filteredProfesores.length}</span> de {initialProfesores.length} profesores
          </div>
          <Button
            onClick={() => setIsRegisterOpen(true)}
            className="h-10 bg-blue-600 hover:bg-blue-700 font-semibold flex items-center gap-1.5 shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            Registrar profesor
          </Button>
        </div>
      </div>

      {/* Teachers Grid layout - 3 elements per row */}
      {filteredProfesores.length === 0 ? (
        <Card className="border-dashed border-gray-200 dark:border-gray-800 p-12 text-center shadow-sm">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-500">
            No se encontraron profesores para tu criterio de búsqueda.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfesores.map((profesor) => {
            const avatarGrad = getAvatarColor(profesor.id);
            const initials = getInitials(profesor.fullName);
            const coursesCount = profesor.teacherCourses?.length ?? 0;
            const prefDaysCount = new Set(profesor.availability?.map((av: any) => av.timeSlot.dayOfWeek) ?? []).size;

            return (
              <Card 
                key={profesor.id} 
                className="group border-gray-100 dark:border-gray-900 hover:border-blue-100 dark:hover:border-blue-950 hover:shadow-md transition-all duration-300 overflow-hidden bg-white dark:bg-gray-950 flex flex-col justify-between"
              >
                {/* Header pattern decorator */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardContent className="p-6 space-y-5 flex-grow">
                  {/* Avatar + Main Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center font-bold text-lg font-display tracking-wider shadow-sm flex-shrink-0 shrink-0`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 px-1.5 py-0.5 rounded-md">
                          {profesor.code}
                        </span>
                        {!profesor.isActive && (
                          <span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded-full">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-gray-900 dark:text-white mt-1 text-base leading-tight group-hover:text-blue-600 transition-colors truncate">
                        {profesor.fullName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                        <span className="font-medium truncate">{profesor.specialty || "General / Sin Carrera"}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100/70 dark:border-gray-900" />

                  {/* Courses in charge */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        Cursos a cargo
                      </span>
                      <span className="text-gray-500">{coursesCount}</span>
                    </div>

                    {coursesCount === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Sin cursos asignados.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {profesor.teacherCourses.slice(0, 3).map((tc: any) => (
                          <Badge 
                            key={tc.id} 
                            variant="secondary" 
                            className="bg-blue-50/75 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 border-none text-[11px] font-medium"
                          >
                            {tc.course.code}
                          </Badge>
                        ))}
                        {coursesCount > 3 && (
                          <Badge 
                            variant="outline" 
                            className="text-[11px] font-medium text-gray-500 border-gray-200 dark:border-gray-800"
                          >
                            +{coursesCount - 3} más
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Preferred schedule summary */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <Calendar className="h-3.5 w-3.5" />
                      Horario preferido
                    </div>

                    {prefDaysCount === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Cualquier bloque disponible.</p>
                    ) : (
                      <div className="flex items-center gap-1 flex-wrap">
                        {Array.from(new Set(profesor.availability.map((av: any) => av.timeSlot.dayOfWeek))).map((day: any) => (
                          <span 
                            key={day} 
                            className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300 border border-amber-100/50 dark:border-amber-900/30"
                          >
                            {DAYS_MAP[day]?.substring(0, 3)}
                          </span>
                        ))}
                        <span className="text-[11px] text-muted-foreground ml-1">
                          ({profesor.availability.length} horas)
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Footer Actions Area */}
                <div className="bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-900 px-5 py-3.5 flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openEditModal(profesor)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                    Editar perfil
                  </Button>

                  <div className="flex items-center gap-1">
                    <form action={toggleActivoProfesor}>
                      <input type="hidden" name="id" value={profesor.id} />
                      <input type="hidden" name="activo" value={String(profesor.isActive)} />
                      <Button 
                        type="submit" 
                        variant="ghost" 
                        size="icon" 
                        title={profesor.isActive ? "Suspender profesor" : "Activar profesor"}
                        className={`h-8 w-8 rounded-lg ${profesor.isActive ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30' : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'}`}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </form>

                    <form action={eliminarProfesor}>
                      <input type="hidden" name="id" value={profesor.id} />
                      <Button 
                        type="submit" 
                        variant="ghost" 
                        size="icon" 
                        title="Eliminar registro"
                        className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Unified Edit Modal Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border border-gray-100 dark:border-gray-900 shadow-2xl">
          <DialogHeader className="p-6 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-b border-gray-100 dark:border-gray-900">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <DialogTitle className="font-display font-bold text-lg text-gray-900 dark:text-white">
                  Editar Docente Avanzado
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Modifica la carrera, asignaciones y disponibilidad horaria del docente.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Content Wrapper */}
          <Tabs defaultValue="basic" className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 border-b border-gray-100 dark:border-gray-900">
              <TabsList className="grid w-full grid-cols-3 h-10 bg-gray-50/50 dark:bg-gray-900/30 my-2">
                <TabsTrigger value="basic" className="text-xs font-semibold">1. Datos y Carrera</TabsTrigger>
                <TabsTrigger value="courses" className="text-xs font-semibold">2. Cursos a Cargo ({selectedCourseIds.length})</TabsTrigger>
                <TabsTrigger value="schedule" className="text-xs font-semibold">3. Horario Preferido ({selectedSlotIds.length})</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 min-h-[300px] max-h-[50vh]">
              {/* TAB 1: BASIC INFO */}
              <TabsContent value="basic" className="space-y-5 m-0 focus-visible:ring-0 focus-visible:outline-none">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre Completo del Profesor</Label>
                  <Input 
                    id="edit-name" 
                    value={editNombre} 
                    onChange={(e) => setEditNombre(e.target.value)}
                    placeholder="Ej. Maria Lopez"
                    className="h-10 border-gray-200 dark:border-gray-800 focus-visible:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="edit-carrera-select" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Carrera que Enseña (Selección)</Label>
                    <select
                      id="edit-carrera-select"
                      value={todasLasCarreras.some(c => c.name === editSpecialty) ? editSpecialty : "OTRA"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "OTRA") {
                          setEditSpecialty(val);
                        }
                      }}
                      className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="" disabled>Selecciona una carrera...</option>
                      {todasLasCarreras.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                      <option value="OTRA">Otra / Especialidad personalizada</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-specialty-custom" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Especialidad / Carrera Personalizada</Label>
                    <Input
                      id="edit-specialty-custom"
                      value={editSpecialty}
                      onChange={(e) => setEditSpecialty(e.target.value)}
                      placeholder="Ej. Algoritmos avanzados"
                      className="h-10 border-gray-200 dark:border-gray-800 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-appointment" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo de Vínculo</Label>
                    <select
                      id="edit-appointment"
                      value={editAppointment}
                      onChange={(e) => setEditAppointment(e.target.value === "NOMBRADO" ? "NOMBRADO" : "CONTRATADO")}
                      className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="CONTRATADO">Contratado</option>
                      <option value="NOMBRADO">Nombrado (planta)</option>
                    </select>
                    <p className="text-[11px] text-gray-400">Los nombrados tienen prioridad al compactar huecos en su horario.</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100/50 dark:border-blue-900/30 flex items-start gap-2.5">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    Asignar la carrera correspondiente ayuda a organizar de forma consistente el plantel de profesores por facultad y departamento académico en las asignaciones de horarios del administrador.
                  </p>
                </div>
              </TabsContent>

              {/* TAB 2: COURSES */}
              <TabsContent value="courses" className="space-y-4 m-0 focus-visible:ring-0 focus-visible:outline-none">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Selecciona los cursos habilitados para dictar</Label>
                  <span className="text-xs text-muted-foreground font-medium">{selectedCourseIds.length} cursos seleccionados</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto p-1 border border-gray-100 dark:border-gray-900 rounded-xl bg-gray-50/20">
                  {todosLosCursos.map((curso) => {
                    const isChecked = selectedCourseIds.includes(curso.id);
                    return (
                      <div 
                        key={curso.id}
                        onClick={() => {
                          setSelectedCourseIds((prev) =>
                            prev.includes(curso.id) ? prev.filter((id) => id !== curso.id) : [...prev, curso.id]
                          );
                        }}
                        className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${isChecked ? 'border-blue-200 bg-blue-50/30 dark:border-blue-950/40 dark:bg-blue-950/10' : 'border-gray-100 bg-white dark:border-gray-900 dark:bg-gray-950 hover:bg-gray-50/50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={isChecked}
                            onCheckedChange={() => {}} // Controlled by outer div onClick
                          />
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{curso.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-1 font-mono">{curso.code} • Ciclo {curso.cycle} • {curso.credits} créditos</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono border-gray-200 text-gray-500 shrink-0">
                          {curso.requiredRoomType}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* TAB 3: SCHEDULE / AVAILABILITY */}
              <TabsContent value="schedule" className="space-y-4 m-0 focus-visible:ring-0 focus-visible:outline-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-900 pb-3">
                  <div>
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      Disponibilidad Horaria Preferida (9 Bloques de 1.5 horas)
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Define las horas en las que el profesor prefiere dictar clases en la semana.</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold" onClick={selectAllSlots}>Marcar Todo</Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold text-red-600 hover:bg-red-50" onClick={clearAllSlots}>Limpiar</Button>
                  </div>
                </div>

                {/* Turn quick selectors */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Atajos por turno:</span>
                  {SHIFTS.map((shift) => (
                    <div key={shift.name} className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-1">
                      <span className="text-[10px] font-medium px-1.5 text-gray-600 dark:text-gray-400">{shift.name}</span>
                      <Button variant="ghost" size="sm" className="h-5 px-1 text-[9px] font-bold text-blue-600 hover:bg-blue-100/50" onClick={() => selectAllShiftSlots(shift.blocks)}>Agregar</Button>
                      <span className="text-gray-300">|</span>
                      <Button variant="ghost" size="sm" className="h-5 px-1 text-[9px] font-bold text-red-500 hover:bg-red-100/50" onClick={() => clearShiftSlots(shift.blocks)}>Quitar</Button>
                    </div>
                  ))}
                </div>

                {/* Availability Grid Matrix */}
                <div className="overflow-x-auto border border-gray-100 dark:border-gray-900 rounded-xl bg-white dark:bg-gray-950">
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-900 text-center">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/40">
                      <tr>
                        <th className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider text-left border-r border-gray-100 dark:border-gray-900">Bloques</th>
                        {DAYS_ORDER.map((day) => (
                          <th key={day} className="px-2 py-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                            {DAYS_MAP[day]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((blockNum) => {
                        // Get labels for block ranges
                        let blockLabel = "";
                        switch(blockNum) {
                          case 1: blockLabel = "07:00-08:30"; break;
                          case 2: blockLabel = "08:40-10:10"; break;
                          case 3: blockLabel = "10:20-11:50"; break;
                          case 4: blockLabel = "12:00-13:30"; break;
                          case 5: blockLabel = "14:00-15:30"; break;
                          case 6: blockLabel = "15:40-17:10"; break;
                          case 7: blockLabel = "17:20-18:50"; break;
                          case 8: blockLabel = "19:00-20:30"; break;
                          case 9: blockLabel = "20:40-22:10"; break;
                        }

                        return (
                          <tr key={blockNum} className="hover:bg-gray-50/20">
                            <td className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 text-left bg-gray-50/20 dark:bg-gray-900/10 border-r border-gray-100 dark:border-gray-900">
                              <span className="block font-bold text-gray-700 dark:text-gray-300">B{blockNum}</span>
                              <span className="text-[9px] text-gray-400 font-normal font-mono">{blockLabel}</span>
                            </td>
                            {DAYS_ORDER.map((day) => {
                              const slot = getSlotByDayAndOrder(day, blockNum);
                              if (!slot) {
                                return (
                                  <td key={day} className="px-1 py-1 bg-gray-100/50 dark:bg-gray-900/20 text-gray-400 text-[10px] italic">
                                    N/A
                                  </td>
                                );
                              }

                              const isSelected = selectedSlotIds.includes(slot.id);
                              return (
                                <td 
                                  key={day} 
                                  className="px-1 py-1"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleSlot(slot.id)}
                                    className={`w-full py-2.5 rounded-lg border text-xs font-bold transition-all ${isSelected ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300 font-black scale-[0.98]' : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-400 dark:bg-gray-950 dark:border-gray-900'}`}
                                  >
                                    {isSelected ? "ACTIVO" : "LIBRE"}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </div>

            {/* Modal Footer actions */}
            <DialogFooter className="p-6 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-900 flex items-center justify-between gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
                disabled={isPending}
                className="h-10 border-gray-200 hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isPending}
                className="h-10 bg-blue-600 hover:bg-blue-700 font-semibold px-6 flex items-center gap-1.5"
              >
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Register Teacher Modal Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-900 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-display font-bold text-lg text-gray-900 dark:text-white">
                  Registrar profesor
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Añade un nuevo docente indicando su código, especialidad o contrato.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="pt-2">
            <ProfesorForm onSuccess={() => setIsRegisterOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
