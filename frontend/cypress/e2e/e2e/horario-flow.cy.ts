/// <reference types="cypress" />

// Consigna 1.5 — Pruebas End-to-End (Cypress)
// Cubre Golden Path, Happy Path y Unhappy Path del flujo critico.
describe("E2E: Flujo critico de gestion academica", () => {
  // ---- Golden Path: flujo principal del negocio sin errores ----
  it("Golden Path: admin inicia sesion y accede al panel de gestion", () => {
    cy.login();
    // El dashboard reenvia al admin a /admin (307).
    cy.visit("/dashboard");
    cy.location("pathname", { timeout: 15000 }).should(
      "match",
      /^\/(dashboard|admin)/,
    );
    cy.visit("/admin/aulas");
    cy.contains("h1", "Aulas y Laboratorios").should("be.visible");
  });

  // ---- Happy Path: escenario exitoso con persistencia ----
  it("Happy Path: crea un aula y verifica que persiste tras recargar", () => {
    const nombre = `Aula E2E ${Date.now()}`;
    cy.login();
    cy.visit("/admin/aulas");

    cy.abrirDialogoAula();
    cy.get("input#aula-nombre").type(nombre);
    cy.get("select#aula-tipo").select("LAB");
    cy.get("input#aula-capacidad").type("20");
    cy.contains("button", "Crear aula").click();

    cy.contains("td", nombre, { timeout: 15000 }).should("be.visible");
    cy.reload();
    cy.contains("td", nombre).should("be.visible");

    // Limpieza: eliminar el aula creada para no contaminar datos.
    cy.contains("td", nombre)
      .parents("tr")
      .within(() => {
        cy.get('form button[type="submit"]').last().click({ force: true });
      });
    cy.contains("td", nombre).should("not.exist");
  });

  // ---- Unhappy Path: errores, restricciones y fallos controlados ----
  it("Unhappy Path: bloquea el acceso a rutas protegidas sin sesion", () => {
    cy.clearCookies();
    cy.visit("/admin/aulas", { failOnStatusCode: false });
    cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
  });

  it("Unhappy Path: rechaza login con credenciales invalidas", () => {
    cy.clearCookies();
    cy.visit("/login");
    cy.get("input#email").type("intruso@institucion.edu");
    cy.get("input#password").type("clave-mala");
    cy.contains("button", "Ingresar").click();
    cy.contains("Credenciales invalidas").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });
});
