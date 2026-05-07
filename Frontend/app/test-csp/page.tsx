"use client";

import { useState } from "react";

export default function TestCSP() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:3001/api/v1/solver/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error en el servidor");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const DAYS = [
    { key: 1, label: "Lunes" },
    { key: 2, label: "Martes" },
    { key: 3, label: "Miércoles" },
    { key: 4, label: "Jueves" },
    { key: 5, label: "Viernes" },
  ];

  // Helper to colorize cards based on course name
  function stableColor(value: string) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % 360;
    return {
      background: `hsl(${colorIndex}, 80%, 95%)`,
      border: `hsl(${colorIndex}, 80%, 80%)`,
      text: `hsl(${colorIndex}, 85%, 25%)`,
    };
  }

  const BLOCKS = [
    { id: 1, start: 420, end: 510, label: "7:00-8:30" },
    { id: 2, start: 520, end: 610, label: "8:40-10:10" },
    { id: 3, start: 620, end: 710, label: "10:20-11:50" },
    { id: 4, start: 720, end: 780, label: "12:00-13:00" },
    { id: 5, start: 840, end: 930, label: "14:00-15:30" },
    { id: 6, start: 940, end: 1030, label: "15:40-17:10" },
    { id: 7, start: 1040, end: 1130, label: "17:20-18:50" },
    { id: 8, start: 1140, end: 1230, label: "19:00-20:30" },
    { id: 9, start: 1240, end: 1330, label: "20:40-22:10" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-2 tracking-tight">Prototipo de Generación de Horarios</h1>
      <p className="mb-6 text-gray-500">
        Esta vista solicita al motor CSP de Python que resuelva el horario usando los datos de tu Supabase.
      </p>

      <button 
        onClick={runTest} 
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-2.5 rounded-md font-medium disabled:opacity-50 shadow-sm"
      >
        {loading ? "Calculando Horario Óptimo..." : "Generar Horario Definitivo"}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <h3 className="font-bold">Error del Motor:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && result.status === "OPTIMAL" && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl text-green-700">✅ Horario Generado Exitosamente</h3>
            <span className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
              Status: {result.status}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <div className="grid min-w-[920px] grid-cols-[100px_repeat(5,minmax(0,1fr))]">
              {/* Header */}
              <div className="border-b border-r bg-gray-50 px-3 py-3 text-xs font-semibold uppercase text-gray-500 text-center">
                Hora
              </div>
              {DAYS.map((day) => (
                <div key={day.key} className="border-b px-3 py-3 text-center text-xs font-semibold uppercase text-gray-500 bg-gray-50">
                  {day.label}
                </div>
              ))}

              {/* Body Rows */}
              {BLOCKS.map((block, i) => {
                const isLast = i === BLOCKS.length - 1;
                return (
                  <div key={block.id} className="contents">
                    <div className={`border-r px-2 py-3 text-center flex items-center justify-center ${isLast ? "" : "border-b"}`}>
                      <span className="text-xs font-medium text-gray-500">
                        {block.label}
                      </span>
                    </div>

                    {DAYS.map((day) => {
                      // Find assignments that exactly match this block's start minute
                      const items = (result.assignments || []).filter((a: any) => 
                        a.slot.day === day.key && 
                        a.slot.start_minute === block.start
                      );

                      return (
                        <div key={`${day.key}-${block.id}`} className={`min-h-[80px] p-1 border-l ${isLast ? "" : "border-b"}`}>
                          {items.map((item: any, idx: number) => {
                            const color = stableColor(item.course_id);
                            return (
                              <div
                                key={idx}
                                className="w-full h-full rounded-md border p-2 shadow-sm flex flex-col gap-1"
                                style={{
                                  backgroundColor: color.background,
                                  borderColor: color.border,
                                  color: color.text,
                                }}
                              >
                                <div className="text-xs font-bold leading-tight" title={item.course_name}>
                                  {item.course_name}
                                </div>
                                <div className="mt-auto">
                                  <div className="text-[10px] font-medium opacity-90 truncate">👨‍🏫 {item.teacher_name}</div>
                                  <div className="text-[10px] opacity-70 truncate">📍 Aula: {item.classroom_name}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
