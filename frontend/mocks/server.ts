import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Servidor MSW para el entorno Node de Jest (intercepta fetch a nivel de red).
export const server = setupServer(...handlers);
