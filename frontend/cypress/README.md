# Pruebas de Aceptacion y E2E (Cypress)

Cubre las secciones **1.4 (Aceptacion)** y **1.5 (End-to-End)** de la consigna de
Testing y Aseguramiento de Calidad.

## Estructura

```
cypress/
├── e2e/
│   ├── aceptacion/        # Consigna 1.4 — escenarios de aceptacion
│   │   ├── 01-auth.cy.ts          # Registro e inicio de sesion
│   │   ├── 02-gestion-datos.cy.ts # CRUD de aulas + validaciones
│   │   └── 03-navegacion.cy.ts    # Navegacion + control de acceso + errores
│   └── e2e/
│       └── horario-flow.cy.ts     # Golden / Happy / Unhappy Path
├── support/
│   ├── commands.ts        # comando custom cy.login()
│   └── e2e.ts
└── README.md
```

## Requisitos previos

1. La aplicacion debe estar corriendo en local:

   ```bash
   npm run dev          # http://localhost:3000
   ```

2. Debe existir un usuario **administrador** real en Supabase.

3. Crear `cypress.env.json` en `Frontend/` (NO se versiona, ya esta en `.gitignore`):

   ```json
   {
     "ADMIN_EMAIL": "tu-admin@institucion.edu",
     "ADMIN_PASSWORD": "tu-password"
   }
   ```

## Ejecucion

```bash
# Modo interactivo (abre el navegador, util para depurar)
npm run cy:open

# Modo headless (genera videos y capturas como evidencia)
npm run cy:run
```

## Evidencias generadas

- **Videos**: `cypress/videos/` (uno por archivo de especificacion).
- **Capturas de fallo**: `cypress/screenshots/` (solo cuando un test falla).
- **Reporte en consola**: resumen de pruebas exitosas/fallidas.

Ambas carpetas estan en `.gitignore`; copia los artefactos al informe de evidencias.

## Escenarios cubiertos

| Spec | Consigna | Escenarios |
|---|---|---|
| 01-auth | 1.4 | Login OK, credenciales invalidas, validacion de email, formulario de registro |
| 02-gestion-datos | 1.4 | Listado, validacion de campos, crear, persistencia, eliminar |
| 03-navegacion | 1.4 | Acceso no autorizado, navegacion admin, ruta inexistente |
| horario-flow | 1.5 | Golden Path, Happy Path (persistencia), Unhappy Path (acceso/credenciales) |
