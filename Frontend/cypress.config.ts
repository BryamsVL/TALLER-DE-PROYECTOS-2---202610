import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    // Evidencias automaticas requeridas por la consigna (1.4.d / 1.5.d)
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    // El login real contra Supabase puede tardar; damos margen al primer load.
    pageLoadTimeout: 60000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(_on, _config) {
      // Espacio para tasks/reporters futuros.
    },
  },
});
