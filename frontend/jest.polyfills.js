// Polyfills requeridos por MSW v2 dentro de jsdom.
// jsdom no provee fetch/Streams/Encoders del estandar web que MSW necesita,
// asi que los tomamos de Node (util/stream) y de undici (fetch nativo).
const { TextEncoder, TextDecoder } = require("node:util");
const {
  ReadableStream,
  TransformStream,
  WritableStream,
} = require("node:stream/web");
// undici v7 y MSW usan MessagePort/MessageChannel/BroadcastChannel, ausentes en
// jsdom: los tomamos de worker_threads ANTES de cargar undici.
const {
  MessageChannel,
  MessagePort,
  BroadcastChannel,
} = require("node:worker_threads");

// Asignacion directa (writable + configurable) para que los interceptores de
// MSW puedan re-parchear fetch/Headers sin chocar con propiedades selladas.
Object.assign(globalThis, {
  TextEncoder,
  TextDecoder,
  ReadableStream,
  TransformStream,
  WritableStream,
  MessageChannel,
  MessagePort,
  BroadcastChannel,
});

// No sobrescribimos FormData: jsdom ya lo provee y React (useActionState) lo usa
// para construir el FormData del <form>; el de undici rompe esa integracion.
const { fetch, Headers, Request, Response } = require("undici");

Object.assign(globalThis, { fetch, Headers, Request, Response });
