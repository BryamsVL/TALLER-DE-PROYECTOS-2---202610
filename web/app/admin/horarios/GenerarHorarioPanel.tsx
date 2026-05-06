"use client";

import { useState, useTransition, useEffect } from "react";
import { 
  Sparkles, 
  Calendar, 
  User, 
  MapPin, 
  Info, 
  Filter, 
  ChevronDown, 
  BookOpen, 
  Activity, 
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssignmentSlot {
  day: number;
  start_minute: number;
  end_minute: number;
}

interface Assignment {
  course_id: string;
  course_name: string;
  teacher_id: string;
  teacher_name: string;
  classroom_id: string;
  classroom_name: string;
  slot: AssignmentSlot;
}

interface SolverResponse {
  status: string;
  assignments: Assignment[];
}

export function GenerarHorarioPanel() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SolverResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Sub-schedule Partitioning State (-1 = Unified View, 0 = Horario 1, 1 = Horario 2, etc.)
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sgoha_horario_generado");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setResult(parsed);
          if (parsed.assignments && parsed.assignments.length > 0) {
            setSelectedScheduleIndex(0);
          }
        } catch (e) {
          console.error("Error al cargar horario guardado:", e);
        }
      }
    }
  }, []);

  // Filter States
  const [filterType, setFilterType] = useState<"all" | "classroom" | "teacher">("all");
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  const DAYS = [
    { key: 1, label: "Lunes" },
    { key: 2, label: "Martes" },
    { key: 3, label: "Miércoles" },
    { key: 4, label: "Jueves" },
    { key: 5, label: "Viernes" },
    { key: 6, label: "Sábado" },
  ];

  const BLOCKS = [
    { id: 1, start: 420, end: 510, label: "07:00 - 08:30" },
    { id: 2, start: 520, end: 610, label: "08:40 - 10:10" },
    { id: 3, start: 620, end: 710, label: "10:20 - 11:50" },
    { id: 4, start: 720, end: 810, label: "12:00 - 13:30" },
    { id: 5, start: 840, end: 930, label: "14:00 - 15:30" },
    { id: 6, start: 940, end: 1030, label: "15:40 - 17:10" },
    { id: 7, start: 1040, end: 1130, label: "17:20 - 18:50" },
    { id: 8, start: 1140, end: 1230, label: "19:00 - 20:30" },
    { id: 9, start: 1240, end: 1330, label: "20:40 - 22:10" },
  ];

  // Helper to colorize cards stably based on course name or ID
  function stableColor(value: string) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return {
      background: `hsl(${hue}, 85%, 96%)`,
      border: `hsl(${hue}, 70%, 85%)`,
      text: `hsl(${hue}, 90%, 20%)`,
      badgeBackground: `hsl(${hue}, 80%, 90%)`,
    };
  }

  function handleGenerar() {
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const response = await fetch("http://localhost:3001/api/v1/solver/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "No se pudo conectar con el motor CSP.");
        }

        setResult(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("sgoha_horario_generado", JSON.stringify(data));
        }

        // Auto-select first options if available
        if (data.assignments && data.assignments.length > 0) {
          setSelectedScheduleIndex(0);
          const firstAula = data.assignments[0].classroom_id;
          const firstProfe = data.assignments[0].teacher_id;
          setSelectedClassroomId(firstAula);
          setSelectedTeacherId(firstProfe);
        }
      } catch (err: any) {
        setError(err.message || "Error al procesar la solicitud.");
      }
    });
  }

  // Partition assignments into mutually exclusive, collision-free sub-schedules
  const subSchedules = result?.assignments
    ? (() => {
        const partitioned: Assignment[][] = [];
        for (const a of result.assignments) {
          let placed = false;
          for (const list of partitioned) {
            const collision = list.some(
              (item) =>
                item.slot.day === a.slot.day &&
                item.slot.start_minute === a.slot.start_minute
            );
            if (!collision) {
              list.push(a);
              placed = true;
              break;
            }
          }
          if (!placed) {
            partitioned.push([a]);
          }
        }
        return partitioned;
      })()
    : [];

  // Extract unique classrooms and teachers for dropdown filters
  const uniqueClassrooms = result?.assignments
    ? Array.from(
        new Map(result.assignments.map((a) => [a.classroom_id, a.classroom_name])).entries()
      ).map(([id, name]) => ({ id, name }))
    : [];

  const uniqueTeachers = result?.assignments
    ? Array.from(
        new Map(result.assignments.map((a) => [a.teacher_id, a.teacher_name])).entries()
      ).map(([id, name]) => ({ id, name }))
    : [];

  // Filter assignments based on dropdown choices and selected sub-schedule
  const filteredAssignments = (() => {
    if (!result?.assignments) return [];

    let baseAssignments = result.assignments;
    if (filterType === "all") {
      if (selectedScheduleIndex === -1) {
        baseAssignments = result.assignments;
      } else if (subSchedules[selectedScheduleIndex]) {
        baseAssignments = subSchedules[selectedScheduleIndex];
      }
    }

    return baseAssignments.filter((a) => {
      if (filterType === "classroom") {
        return a.classroom_id === selectedClassroomId;
      }
      if (filterType === "teacher") {
        return a.teacher_id === selectedTeacherId;
      }
      return true;
    });
  })();

  return (
    <div className="space-y-6">
      {/* Action CTA Block */}
      {!result && !pending && (
        <div className="p-8 text-center border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-50/40 via-white to-violet-50/20 dark:from-slate-900/50 dark:via-slate-950 dark:to-indigo-950/20 rounded-2xl">
          <div className="mx-auto w-16 h-16 bg-indigo-500/10 flex items-center justify-center rounded-2xl mb-4">
            <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-2">
            Iniciar Generador Inteligente
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-6 leading-relaxed">
            Presiona el botón para compilar de forma instantánea el horario libre de colisiones relacionales, respetando las capacidades de las aulas y la disponibilidad docente.
          </p>
          <Button
            type="button"
            size="lg"
            onClick={handleGenerar}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 transition-all duration-300 px-8 py-6 rounded-xl text-base"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Generar Horario Óptimo
          </Button>
        </div>
      )}

      {/* Loading Overlay State */}
      {pending && (
        <div className="p-12 text-center border-2 border-dashed border-indigo-200 dark:border-indigo-900 bg-indigo-500/[0.02] rounded-2xl flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800 dark:text-gray-100">Cargando Inteligencia Artificial</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
              El solucionador CSP está modelando las variables de disponibilidad y capacidad de las aulas en tiempo real...
            </p>
          </div>
        </div>
      )}

      {/* Error Alert Display */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-rose-800 dark:text-rose-400 text-sm">Error de Ejecución</h4>
            <p className="text-xs text-rose-700 dark:text-rose-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success View Result */}
      {result && (result.status === "OPTIMAL" || result.status === "INFEASIBLE") && (
        <div className="space-y-6">
          {/* Quick Metrics & Actions Bar */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between p-4 ${result.status === "OPTIMAL" ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/20"} border rounded-2xl gap-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${result.status === "OPTIMAL" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                {result.status === "OPTIMAL" ? <Activity className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              </div>
              <div>
                <h4 className={`font-bold text-sm ${result.status === "OPTIMAL" ? "text-emerald-800 dark:text-emerald-400" : "text-amber-800 dark:text-amber-500"}`}>
                  {result.status === "OPTIMAL" ? "✅ Horario Compilado Exitosamente" : "⚠️ Horario Generado con Conflictos (Incompleto)"}
                </h4>
                <p className={`text-xs mt-0.5 ${result.status === "OPTIMAL" ? "text-emerald-700/80 dark:text-emerald-400/70" : "text-amber-700/80 dark:text-amber-400/70"}`}>
                  Asignaciones procesadas: <span className="font-bold">{result.assignments.length} sesiones</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResult(null)}
                className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reiniciar
              </Button>
            </div>
          </div>

          {result.status === "INFEASIBLE" && result.conflicts && result.conflicts.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-2">
              <h5 className="font-bold text-amber-800 dark:text-amber-500 text-sm">Conflictos Detectados:</h5>
              <ul className="list-disc list-inside text-xs text-amber-700 dark:text-amber-400/90 space-y-1">
                {result.conflicts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Dynamic Interactive Filters */}
          <div className="p-4 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Filter className="h-4 w-4" />
              </div>
              <div>
                <h5 className="font-bold text-gray-800 dark:text-gray-200 text-xs uppercase tracking-wider">Filtros de Cuadrícula</h5>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">Visualiza por vista unificada o separa por recurso.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Type Segmented Control */}
              <div className="inline-flex bg-gray-100 dark:bg-gray-900 p-0.5 rounded-lg border border-gray-200/50 dark:border-gray-800/50">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    filterType === "all"
                      ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Vista General
                </button>
                <button
                  onClick={() => setFilterType("classroom")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    filterType === "classroom"
                      ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Por Aula
                </button>
                <button
                  onClick={() => setFilterType("teacher")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    filterType === "teacher"
                      ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Por Docente
                </button>
              </div>

              {/* Classroom Specific Dropdown */}
              {filterType === "classroom" && (
                <div className="relative">
                  <select
                    value={selectedClassroomId}
                    onChange={(e) => setSelectedClassroomId(e.target.value)}
                    className="appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {uniqueClassrooms.map((aula) => (
                      <option key={aula.id} value={aula.id}>
                        🏫 {aula.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              )}

              {filterType === "teacher" && (
                <div className="relative">
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {uniqueTeachers.map((profe) => (
                      <option key={profe.id} value={profe.id}>
                        👨‍🏫 {profe.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Sub-Schedule Selector Bar (only visible when in 'Vista General') */}
          {filterType === "all" && subSchedules.length > 0 && (
            <div className="p-4 bg-indigo-500/[0.02] dark:bg-indigo-950/[0.05] border border-indigo-100 dark:border-indigo-950/30 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Subdivisión de Horarios (Sin Cruces)
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  Se subdividieron {result?.assignments.length} materias en {subSchedules.length} horarios independientes sin colisiones de bloques.
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {subSchedules.map((schedule, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedScheduleIndex(index)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 border ${
                      selectedScheduleIndex === index
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100 dark:shadow-none"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-indigo-200 dark:hover:border-indigo-950 hover:bg-indigo-50/[0.3] dark:hover:bg-indigo-950/[0.1]"
                    }`}
                  >
                    Horario {index + 1}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] ${
                      selectedScheduleIndex === index
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                    }`}>
                      {schedule.length} clases
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedScheduleIndex(-1)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 border ${
                    selectedScheduleIndex === -1
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100 dark:shadow-none"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-indigo-200 dark:hover:border-indigo-950 hover:bg-indigo-50/[0.3] dark:hover:bg-indigo-950/[0.1]"
                  }`}
                >
                  Vista Unificada
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] ${
                    selectedScheduleIndex === -1
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                  }`}>
                    {result?.assignments.length} total
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm">
            <div className="grid min-w-[1200px] grid-cols-[110px_repeat(6,minmax(0,1fr))] divide-y divide-gray-100 dark:divide-gray-900">
              {/* Header Grid Row */}
              <div className="contents bg-gray-50 dark:bg-gray-900/50">
                <div className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center border-r border-gray-100 dark:border-gray-900">
                  Bloque
                </div>
                {DAYS.map((day) => (
                  <div 
                    key={day.key} 
                    className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                    {day.label}
                  </div>
                ))}
              </div>

              {/* Calendar Slots Loop */}
              {BLOCKS.map((block) => (
                <div key={block.id} className="contents">
                  {/* Time Label Cell */}
                  <div className="px-2 py-4 text-center flex flex-col items-center justify-center border-r border-b border-gray-100 dark:border-gray-900 bg-gray-50/[0.3] dark:bg-gray-900/[0.1]">
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider">BLOQUE {block.id}</span>
                    <span className="text-xs font-medium text-gray-500 mt-1 whitespace-nowrap">
                      {block.label}
                    </span>
                  </div>

                  {/* Day Columns */}
                  {DAYS.map((day) => {
                    const items = filteredAssignments.filter(
                      (a) => a.slot.day === day.key && a.slot.start_minute === block.start
                    );

                    return (
                      <div 
                        key={`${day.key}-${block.id}`} 
                        className="min-h-[110px] p-2 flex flex-col gap-2 border-l border-b border-gray-100 dark:border-gray-900 transition-colors duration-150 hover:bg-gray-500/[0.01] bg-white dark:bg-gray-950"
                      >
                        {items.map((item, idx) => {
                          const palette = stableColor(item.course_id);
                          return (
                            <div
                              key={idx}
                              className="group relative rounded-xl border p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300"
                              style={{
                                backgroundColor: palette.background,
                                borderColor: palette.border,
                                color: palette.text,
                              }}
                            >
                              <div>
                                <h5 className="text-[11px] font-extrabold leading-tight tracking-tight mb-2 group-hover:text-black dark:group-hover:text-white transition-colors duration-200">
                                  {item.course_name}
                                </h5>
                              </div>

                              <div className="space-y-1 mt-auto pt-1.5 border-t border-black/5 dark:border-white/5">
                                <div className="text-[10px] font-semibold flex items-center gap-1.5 opacity-90 truncate">
                                  <User className="h-3 w-3 shrink-0 opacity-70" />
                                  {item.teacher_name}
                                </div>
                                <div className="text-[10px] flex items-center gap-1.5 opacity-75 truncate">
                                  <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                                  {item.classroom_name}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Warning when no assignments found */}
      {result && result.status !== "OPTIMAL" && (
        <div className="p-6 text-center border-2 border-dashed border-amber-200 bg-amber-500/[0.02] rounded-2xl flex flex-col items-center justify-center space-y-3">
          <Info className="h-8 w-8 text-amber-500 animate-bounce" />
          <h4 className="font-bold text-gray-800 dark:text-gray-100">Resultado Incompleto</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
            El solver de IA devolvió un estatus "{result.status}". Esto suele indicar que el modelo está sobre-restringido (e.g. no hay aulas con suficiente capacidad, o los profesores no tienen idoneidad asignada para dictar).
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResult(null)}
            className="border-gray-200 dark:border-gray-800"
          >
            Reestablecer Formulario
          </Button>
        </div>
      )}
    </div>
  );
}
