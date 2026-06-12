import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // HTML + LCOV requeridos como evidencia de la consigna (TP_2).
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      // Logica critica del backend: metricas de huecos, middleware de auth y la
      // factoria de la app. Las rutas (solver/courses) dependen del servicio
      // Python/BD y se validan por integracion (Supertest), no por unitarias.
      include: [
        "src/lib/gapMetrics.ts",
        "src/middleware/**/*.ts",
        "src/app.ts",
      ],
      exclude: ["src/**/*.test.ts"],
      // Umbrales de la rubrica sobre la logica critica cubierta.
      thresholds: { lines: 85, functions: 85, branches: 85, statements: 85 },
    },
  },
});
