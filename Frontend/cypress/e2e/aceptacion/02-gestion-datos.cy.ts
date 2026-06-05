/// <reference types="cypress" />

// Consigna 1.4 — Pruebas de Aceptacion (Cypress)
// Escenario obligatorio: Gestion de datos + Validaciones funcionales.
describe("Aceptacion: Gestion de aulas (CRUD)", () => {
  const nombreAula = `Aula Cypress ${Date.now()}`;

  beforeEach(() => {
    cy.login();
  });

  it("lista la pagina de aulas con su encabezado", () => {
    cy.visit("/admin/aulas");
    cy.contains("h1", "Aulas y Laboratorios").should("be.visible");
    cy.contains("button", "Crear nueva aula").should("be.visible");
  });

  it("valida campos obligatorios al crear un aula", () => {
    cy.visit("/admin/aulas");
    cy.abrirDialogoAula();
    // Submit con nombre vacio: required nativo bloquea, el dialog sigue abierto.
    cy.contains("button", "Crear aula").click();
    cy.get("input#aula-nombre:invalid").should("exist");
  });

  it("crea un aula nueva y la muestra en la tabla (persistencia)", () => {
    cy.visit("/admin/aulas");
    cy.abrirDialogoAula();
    cy.get("input#aula-nombre").type(nombreAula);
    cy.get("select#aula-tipo").select("GENERAL");
    cy.get("input#aula-capacidad").type("35");
    cy.contains("button", "Crear aula").click();
    // Tras crear, el dialog se cierra y la fila aparece en la tabla.
    cy.contains("td", nombreAula, { timeout: 15000 }).should("be.visible");
  });

  it("conserva el aula creada tras recargar (persistencia en BD)", () => {
    cy.visit("/admin/aulas");
    cy.reload();
    cy.contains("td", nombreAula).should("be.visible");
  });

  it("elimina el aula creada", () => {
    cy.visit("/admin/aulas");
    cy.contains("td", nombreAula)
      .parents("tr")
      .within(() => {
        // El boton de eliminar es el ultimo del grupo de acciones de la fila.
        cy.get('form button[type="submit"]').last().click({ force: true });
      });
    cy.contains("td", nombreAula).should("not.exist");
  });
});
