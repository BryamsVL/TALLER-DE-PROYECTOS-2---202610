import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email({ error: "Correo invalido." }).trim(),
  password: z
    .string()
    .min(1, { error: "Ingresa tu contrasena." })
    .trim(),
});

export const SignupSchema = z.object({
  nombre: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
    .max(100, { error: "El nombre es muy largo." })
    .trim(),
  email: z.email({ error: "Correo invalido." }).trim(),
  password: z
    .string()
    .min(8, { error: "Minimo 8 caracteres." })
    .regex(/[a-zA-Z]/, { error: "Debe contener al menos una letra." })
    .regex(/[0-9]/, { error: "Debe contener al menos un numero." })
    .trim(),
});

export type AuthFormState =
  | {
      errors?: {
        nombre?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
