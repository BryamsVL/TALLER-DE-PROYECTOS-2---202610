import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type Role = "ADMIN" | "COORDINADOR" | "DOCENTE" | "ESTUDIANTE";

export interface AuthPayload {
  userId: string;
  role: Role;
}

function isAuthPayload(value: unknown): value is AuthPayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.userId === "string" &&
    ["ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE"].includes(
      String(payload.role),
    )
  );
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "JWT_SECRET not configured" });
    return;
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });

    if (!isAuthPayload(decoded)) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.auth = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (!allowed.includes(req.auth.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
