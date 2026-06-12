import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

// Pruebas de integracion HTTP sobre la app Express completa (sin abrir puerto).
// Cubren el contrato de rutas que no dependen de BD ni del servicio CSP.
const app = createApp();

describe("GET /health", () => {
  it("responde 200 con el estado del servicio", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok",
      service: "sgoha-backend",
    });
    expect(typeof res.body.timestamp).toBe("string");
  });

  it("devuelve JSON", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});

describe("manejo de rutas inexistentes", () => {
  it("responde 404 con cuerpo de error en rutas no registradas", async () => {
    const res = await request(app).get("/ruta-que-no-existe");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not Found" });
  });

  it("aplica cabeceras de seguridad de helmet", async () => {
    const res = await request(app).get("/health");
    // helmet establece X-Content-Type-Options: nosniff por defecto.
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });
});
