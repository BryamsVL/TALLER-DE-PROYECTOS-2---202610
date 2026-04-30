import "dotenv/config";
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/health", healthRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(500).json({ error: "Internal Server Error" });
};
app.use(errorHandler);

app.listen(port, () => {
  console.log(`SGOHA backend listening on http://localhost:${port}`);
});
