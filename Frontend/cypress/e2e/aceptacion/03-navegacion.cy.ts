/// <reference types="cypress" />

// Consigna 1.4 — Pruebas de Aceptacion (Cypress)
// Escenario obligatorio: Navegacion funcional + Manejo de errores.
describe("Aceptacion: Navegacion y control de acceso", () => {
  it("redirige a login al acceder a una ruta protegida sin sesion", () => {
    cy.clearCookies();
    cy.visit("/admin/aulas", { failOnStatusCode: false });
    cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
  });

  it("navega entre las secciones del panel admin autenticado", () => {
    cy.login();

    cy.visit("/admin/aulas");
    cy.contains("h1", "Aulas y Laboratorios").should("be.visible");

    cy.visit("/admin/cursos");
    cy.get("h1").should("be.visible");

    cy.visit("/admin/profesores");
    cy.get("h1").should("be.visible");

    // El dashboard reenvia al admin a /admin (307): ambos son area autenticada.
    cy.visit("/dashboard");
    cy.location("pathname", { timeout: 15000 }).should(
      "match",
      /^\/(dashboard|admin)/,
    );
  });

  it("muestra una pagina manejada para rutas inexistentes", () => {
    cy.login();
    cy.visit("/ruta-que-no-existe-1234", { failOnStatusCode: false });
    cy.contains(/404|no.*encontr|not found/i).should("exist");
  });
});
