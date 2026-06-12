import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../../app.js";
import { prisma } from "../../../lib/prisma.js";

// Integracion CRUD con PERSISTENCIA real contra la base de datos.
//
// Estas pruebas escriben en la BD, por lo que solo corren con opt-in explicito:
//   RUN_DB_TESTS=1 npm test
// Apunta DATABASE_URL a una base DESECHABLE (proyecto Supabase de test o
// Postgres local), nunca a produccion. Cada caso limpia lo que crea.

const runDb = process.env.RUN_DB_TESTS === "1";
const app = createApp();
const codigoPrueba = `TEST-${Date.now()}`;

describe.skipIf(!runDb)("CRUD /api/v1/courses (integracion con BD)", () => {
  afterAll(async () => {
    await prisma.course.deleteMany({ where: { code: codigoPrueba } });
    await prisma.$disconnect();
  });

  it("POST crea un curso y responde 201 con el registro persistido", async () => {
    const res = await request(app).post("/api/v1/courses").send({
      code: codigoPrueba,
      name: "Curso de Prueba Integracion",
      credits: 3,
      cycle: 1,
      weeklyHours: 3,
      requiredRoomType: "TEORIA",
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ code: codigoPrueba, credits: 3 });
    expect(typeof res.body.id).toBe("string");

    // Verifica persistencia real consultando la BD directamente.
    const enDb = await prisma.course.findUnique({ where: { code: codigoPrueba } });
    expect(enDb).not.toBeNull();
  });

  it("GET devuelve la lista incluyendo el curso creado", async () => {
    const res = await request(app).get("/api/v1/courses");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((c: { code: string }) => c.code === codigoPrueba)).toBe(true);
  });

  it("POST con codigo duplicado falla (no crea registro repetido)", async () => {
    const res = await request(app).post("/api/v1/courses").send({
      code: codigoPrueba,
      name: "Duplicado",
      credits: 3,
      cycle: 1,
      weeklyHours: 3,
      requiredRoomType: "TEORIA",
    });
    expect(res.status).toBe(500); // la ruta mapea P2002 a 500 (sin validacion previa)
  });
});
