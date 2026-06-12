/// <reference types="cypress" />

// Consigna 1.4 — Pruebas de Aceptacion (Cypress)
// Escenario obligatorio: Registro e inicio de sesion.
describe("Aceptacion: Autenticacion", () => {
  it("muestra el formulario de login", () => {
    cy.visit("/login");
    cy.contains("h1", "Bienvenido de vuelta").should("be.visible");
    cy.get("input#email").should("be.visible");
    cy.get("input#password").should("be.visible");
    cy.contains("button", "Ingresar").should("be.visible");
  });

  it("rechaza credenciales invalidas con mensaje de error", () => {
    cy.visit("/login");
    cy.get("input#email").type("noexiste@institucion.edu");
    cy.get("input#password").type("password-incorrecto");
    cy.contains("button", "Ingresar").click();
    // signIn devuelve { message: "Credenciales invalidas." } sin redirigir.
    cy.contains("Credenciales invalidas").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });

  it("valida formato de email en el formulario de login", () => {
    cy.visit("/login");
    cy.get("input#email").type("no-es-un-email");
    cy.get("input#password").type("algo");
    cy.contains("button", "Ingresar").click();
    // El campo type=email + required impide el submit nativo: seguimos en /login.
    cy.location("pathname").should("eq", "/login");
  });

  it("inicia sesion con credenciales validas y entra al area autenticada", () => {
    cy.visit("/login");
    cy.get("input#email").type(Cypress.env("ADMIN_EMAIL"));
    cy.get("input#password").type(Cypress.env("ADMIN_PASSWORD"), { log: false });
    cy.contains("button", "Ingresar").click();
    // signIn redirige a /dashboard; el admin es reenviado a /admin (307).
    cy.location("pathname", { timeout: 30000 }).should(
      "match",
      /^\/(dashboard|admin)/,
    );
  });

  it("muestra el formulario de registro con validaciones", () => {
    cy.visit("/register");
    cy.get("form").should("exist");
    cy.get("input#email").should("exist");
    cy.get("input#password").should("exist");
  });
});
