import { describe, it, expect, beforeAll } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { requireAuth, requireRole } from "./auth.js";

// Integracion del middleware de autenticacion/autorizacion (sin BD).
// Se monta una app minima con una ruta protegida y se prueban los escenarios
// obligatorios de la rubrica: acceso valido, no autenticado y no autorizado.

const TEST_SECRET = "test-secret-123";

function buildApp() {
  const app = express();
  // Ruta solo para ADMIN.
  app.get("/solo-admin", requireAuth, requireRole("ADMIN"), (req, res) => {
    res.json({ ok: true, userId: req.auth?.userId, role: req.auth?.role });
  });
  // Ruta para cualquier usuario autenticado.
  app.get("/privado", requireAuth, (req, res) => {
    res.json({ ok: true, role: req.auth?.role });
  });
  return app;
}

function tokenFor(role: string, userId = "u1"): string {
  return jwt.sign({ userId, role }, TEST_SECRET);
}

const app = buildApp();

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

describe("requireAuth", () => {
  it("401 cuando falta el header Authorization", async () => {
    const res = await request(app).get("/privado");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Missing bearer token" });
  });

  it("401 cuando el header no es Bearer", async () => {
    const res = await request(app).get("/privado").set("Authorization", "Basic abc");
    expect(res.status).toBe(401);
  });

  it("401 cuando el token es invalido", async () => {
    const res = await request(app)
      .get("/privado")
      .set("Authorization", "Bearer token-corrupto");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid token" });
  });

  it("200 con un token valido", async () => {
    const res = await request(app)
      .get("/privado")
      .set("Authorization", `Bearer ${tokenFor("DOCENTE")}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, role: "DOCENTE" });
  });

  it("500 cuando JWT_SECRET no esta configurado", async () => {
    const prev = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    const res = await request(app)
      .get("/privado")
      .set("Authorization", `Bearer ${jwt.sign({ userId: "u1", role: "ADMIN" }, TEST_SECRET)}`);
    expect(res.status).toBe(500);
    process.env.JWT_SECRET = prev;
  });
});

describe("requireRole", () => {
  it("403 cuando el rol no esta permitido", async () => {
    const res = await request(app)
      .get("/solo-admin")
      .set("Authorization", `Bearer ${tokenFor("ESTUDIANTE")}`);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: "Forbidden" });
  });

  it("200 cuando el rol esta permitido", async () => {
    const res = await request(app)
      .get("/solo-admin")
      .set("Authorization", `Bearer ${tokenFor("ADMIN")}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, role: "ADMIN" });
  });
});
