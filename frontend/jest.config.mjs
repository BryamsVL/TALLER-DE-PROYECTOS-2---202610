import nextJest from "next/jest.js";

// next/jest carga el transform de Next (SWC), los alias de tsconfig (@/...) y
// las variables de entorno, para testear componentes del App Router con Jest.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jest-environment-jsdom",
  // customExportConditions: [""] evita el fetch roto de jsdom y deja que MSW
  // use el de undici (cargado en jest.polyfills.js).
  testEnvironmentOptions: { customExportConditions: [""] },
  // setupFiles corre ANTES del framework: instala los polyfills que MSW v2 exige.
  setupFiles: ["<rootDir>/jest.polyfills.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/?(*.)+(test).{ts,tsx}"],
  // El Backend tiene su propia suite (Vitest); no mezclar.
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  // Alcance de cobertura UNITARIA: componentes cliente y utilidades puras.
  // Lo excluido se valida en otras capas (ver docs/consignas/TP2-testing.md):
  //  - components/ui/**  -> primitivas generadas por shadcn/ui (3rd-party).
  //  - app/**/page|layout|actions -> server components y server actions ligados
  //    a Supabase/Prisma; cubiertos por integracion (Supertest) y E2E (Cypress).
  //  - lib/scheduler/**  -> motor TS heredado, fuera de produccion (deuda doc.).
  //  - lib/supabase, lib/prisma -> singletons de infraestructura.
  collectCoverageFrom: [
    "components/*.{ts,tsx}",
    "app/admin/cursos/CursoForm.tsx",
    "app/admin/horarios/GenerarHorarioPanel.tsx",
    "lib/utils.ts",
    "!**/*.d.ts",
    "!**/*.test.{ts,tsx}",
  ],
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};

// MSW v2 y sus dependencias se publican como ESM puro y hay que transpilarlas.
// next/jest sobrescribe transformIgnorePatterns, asi que post-procesamos la
// config resuelta para reinyectar el whitelist sin perder los alias ni el SWC.
const mswEsmDeps =
  "msw|@mswjs|@bundled-es-modules|@open-draft|until-async|outvariant|strict-event-emitter|is-node-process|headers-polyfill|rettime|graphql";

export default async () => {
  const resolvedConfig = await createJestConfig(config)();
  resolvedConfig.transformIgnorePatterns = [
    `/node_modules/(?!(?:.pnpm/)?(?:${mswEsmDeps})/)`,
    "^.+\\.module\\.(css|sass|scss)$",
  ];
  return resolvedConfig;
};
