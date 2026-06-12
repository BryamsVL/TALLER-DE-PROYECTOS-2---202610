// Matchers extra de Testing Library (toBeInTheDocument, toHaveAttribute, etc.).
import "@testing-library/jest-dom";
import { server } from "./mocks/server";

// URL base determinista para que los handlers MSW coincidan con el fetch real.
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";

// Ciclo de vida de MSW: arranca el servidor de mocks, restablece handlers entre
// tests y lo cierra al final.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
