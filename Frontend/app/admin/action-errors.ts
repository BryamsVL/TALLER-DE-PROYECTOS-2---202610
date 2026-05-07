export function mapAdminWriteErrorMessage(code?: string, fallback?: string) {
  if (code === "42501") {
    return "No tienes permisos para realizar esta accion. Tu usuario debe tener rol ADMIN o COORDINADOR.";
  }

  return fallback ?? "Ocurrio un error inesperado.";
}
