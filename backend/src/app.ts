import express, {
  type Application,
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { healthRouter } from "./routes/health.js";
import { solverRouter } from "./routes/api/v1/solver.js";
import { coursesRouter } from "./routes/api/v1/courses.js";
import { testRouter } from "./routes/api/v1/test.js";

// Construye la app Express con todos los middlewares y rutas, SIN escuchar en
// un puerto. Esto permite que Supertest la importe para pruebas de integracion
// (HU-28) sin abrir un socket, y que index.ts solo se encargue del arranque.
export function createApp(): Application {
  const app = express();

  app.use(helmet());
  // Compresión gzip de las respuestas de la API (TP2: optimización de APIs Express).
  // Reduce los bytes transferidos en payloads JSON grandes (p. ej. horarios del solver).
  app.use(compression());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || ["http://localhost:3000", "http://localhost:5173"],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.use("/health", healthRouter);
  app.use("/api/v1/solver", solverRouter);
  app.use("/api/v1/courses", coursesRouter);
  app.use("/api/v1/test-seed-and-run", testRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Not Found" });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error("[error]", err);
    res.status(500).json({ error: "Internal Server Error" });
  };
  app.use(errorHandler);

  return app;
}
