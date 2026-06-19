# Declaración de Trabajo (Statement of Work, SOW) — Cierre del Proyecto

**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos
**Project Manager:** Edward Flores Rodríguez
**Fecha de preparación:** 2026-06-19

## 1. Aplicabilidad del SOW

La Declaración de Trabajo (SOW) se utiliza, según PMBOK, para **verificar el cumplimiento contractual con proveedores externos** antes de cerrar un contrato.

**En el proyecto SGOHA no aplica un SOW contractual**, por las siguientes razones verificables:

- Es un **proyecto académico** de la asignatura Taller de Proyectos 2 (Universidad Continental), sin presupuesto monetario de adquisiciones (ver restricción R4 y charter §3.3).
- **No hubo proveedores ni contratos externos.** Toda la infraestructura se sostuvo en servicios de **tier gratuito** de las tecnologías empleadas.
- No existe entregable contratado a terceros cuyo cumplimiento deba validarse antes de un pago o cierre de contrato.

> Se documenta esta sección —en lugar de omitir el entregable— para dejar constancia formal de la verificación de adquisiciones, conforme a la consigna.

## 2. Inventario de servicios e insumos de terceros (sin contrato de pago)

| Servicio / insumo | Proveedor | Modalidad | Rol en el proyecto | ¿Contrato/pago? |
|-------------------|-----------|-----------|--------------------|-----------------|
| Repositorio y CI | GitHub | Free tier | Control de versiones, GitHub Actions, SonarCloud | No |
| Hosting frontend | Vercel | Free tier | Despliegue de la app Next.js | No |
| Hosting backend / solver | Render | Free tier | Microservicio FastAPI/OR-Tools | No |
| Base de datos / Auth | Supabase | Free tier | Postgres, RLS, autenticación | No |
| Análisis de calidad | SonarCloud | Free (open) | Métricas de calidad y seguridad | No |
| Librerías | OR-Tools, Next.js, Prisma, etc. | Open source | Desarrollo | No |

## 3. Verificación de cierre de adquisiciones

| Punto de verificación | Resultado |
|-----------------------|-----------|
| ¿Existen contratos de proveedor abiertos? | No |
| ¿Hay pagos pendientes a terceros? | No |
| ¿Algún entregable depende de un proveedor por validar? | No |
| ¿Se respetaron los términos de uso de los servicios free tier? | Sí |

## 4. Conclusión

**No corresponde cierre contractual de adquisiciones**: el proyecto operó íntegramente sobre software open source y servicios gratuitos, sin proveedores bajo contrato. La verificación de adquisiciones queda **cerrada sin pendientes**.

> Trazabilidad: §1 ↔ restricción R4 (sin presupuesto cloud de pago) · §2 ↔ stack del Informe Final §2.
</content>
