/// <reference types="cypress" />

// Comando custom: login real contra Supabase via la UI.
// Lee credenciales de cypress.env.json (no versionado).
Cypress.Commands.add("login", (email?: string, password?: string) => {
  const user = email ?? Cypress.env("ADMIN_EMAIL");
  const pass = password ?? Cypress.env("ADMIN_PASSWORD");

  if (!user || !pass) {
    throw new Error(
      "Faltan credenciales. Define ADMIN_EMAIL y ADMIN_PASSWORD en cypress.env.json",
    );
  }

  cy.session([user, pass], () => {
    cy.visit("/login");
    cy.get("input#email").clear().type(user);
    cy.get("input#password").clear().type(pass, { log: false });
    cy.contains("button", "Ingresar").click();
    // signIn redirige a /dashboard; el dashboard reenvia al admin a /admin (307).
    cy.location("pathname", { timeout: 30000 }).should(
      "match",
      /^\/(dashboard|admin)/,
    );
  });
});

// Abre el dialogo "Crear nueva aula" de forma resiliente.
// Next dev compila rutas on-demand y el App Router hidrata el onClick despues
// del render: los primeros clicks pueden perderse. Reintentamos con una espera
// entre intentos hasta que el formulario aparezca en el DOM.
Cypress.Commands.add("abrirDialogoAula", () => {
  const intentarAbrir = (intentosRestantes: number) => {
    cy.get("body").then(($body) => {
      if ($body.find("input#aula-nombre").length > 0) {
        return; // El dialogo ya esta abierto.
      }
      cy.contains("button", "Crear nueva aula").click({ force: true });
      cy.wait(600);
      cy.get("body").then(($after) => {
        if ($after.find("input#aula-nombre").length === 0 && intentosRestantes > 0) {
          intentarAbrir(intentosRestantes - 1);
        }
      });
    });
  };

  intentarAbrir(8);
  cy.get("input#aula-nombre", { timeout: 15000 }).should("be.visible");
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Inicia sesion contra Supabase usando la UI y cachea la sesion.
       * @param email opcional; por defecto Cypress.env("ADMIN_EMAIL")
       * @param password opcional; por defecto Cypress.env("ADMIN_PASSWORD")
       */
      login(email?: string, password?: string): Chainable<void>;
      /**
       * Abre el dialogo de creacion de aula y espera al formulario.
       * Reintenta el click si se pierde por la hidratacion del App Router.
       */
      abrirDialogoAula(): Chainable<void>;
    }
  }
}

export {};
