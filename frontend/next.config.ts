import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  // Compresión gzip de las respuestas servidas por Next (TP2: reducción de bytes transferidos).
  compress: true,
  // Optimización de imágenes: sirve AVIF (preferido) con WebP como fallback.
  // Formatos modernos => menos KB transferidos => menor consumo de red y energía.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Tree-shaking de barrels: solo carga los módulos usados de cada paquete.
    // Reduce el JS enviado al cliente. lucide-react/date-fns ya vienen
    // optimizados por defecto; Radix UI no, así que se añade aquí.
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-accordion",
      "@radix-ui/react-navigation-menu",
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Caché de recursos: assets con hash en el nombre son inmutables.
      // Cachearlos un año evita re-descargas en cada visita (TP2: caché de recursos).
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
