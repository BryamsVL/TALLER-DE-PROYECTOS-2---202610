// Declaración de tipos local para `compression`.
// Se añade porque el registro de npm bloqueó la instalación de @types/compression
// (ECONNRESET repetido). Si más adelante se instala @types/compression, este
// archivo puede eliminarse.
declare module "compression" {
  import type { Request, RequestHandler, Response } from "express";

  interface CompressionFilter {
    (req: Request, res: Response): boolean;
  }

  interface CompressionOptions {
    /** Nivel de compresión zlib (0-9, o -1 por defecto). */
    level?: number;
    /** Tamaño mínimo de respuesta (bytes o string como "1kb") para comprimir. */
    threshold?: number | string;
    /** Función que decide si una respuesta debe comprimirse. */
    filter?: CompressionFilter;
    chunkSize?: number;
    memLevel?: number;
    strategy?: number;
    windowBits?: number;
  }

  function compression(options?: CompressionOptions): RequestHandler;

  export = compression;
}
