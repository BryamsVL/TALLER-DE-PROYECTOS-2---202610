# Documentación de Capacitación y Transferencia — Cierre del Proyecto

**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos
**Project Manager:** Edward Flores Rodríguez
**Fecha de preparación:** 2026-06-19

## 1. Destinatario de la transferencia

El producto final (MVP admin/docente) se transfiere al **docente sponsor de la asignatura**, en calidad de receptor y evaluador del sistema. No existe un área de operaciones externa que herede el producto en producción continua (proyecto académico).

## 2. Material de capacitación disponible

| Recurso | Ubicación | Contenido |
|---------|-----------|-----------|
| Manual de usuario / despliegue | `README.md` del repositorio | Instalación, variables de entorno, ejecución de frontend, backend y microservicio del solver. |
| Video demostrativo | Referenciado en el README | Recorrido funcional del sistema (golden path: generar horario). |
| Documentación técnica | `docs/sdd/`, `docs/arquitectura/` | Arquitectura, modelo CSP, decisiones técnicas. |
| Guía de pruebas | `docs/arquitectura/Guía de Pruebas (Testing) - Backend SGOHA.md` | Cómo ejecutar y verificar las pruebas. |

## 3. Guía rápida por rol

### Rol Administrador
1. Iniciar sesión (login con JWT).
2. Gestionar entidades base: estudiantes, docentes, cursos, aulas, franjas, parámetros.
3. Generar el horario institucional (motor CSP) — el sistema retorna solución `OPTIMAL` o `FEASIBLE` (≤ 30 s).
4. Ajustar manualmente asignaciones (drag & drop) con re-validación de cruces.
5. Activar/cancelar el horario institucional.
6. Exportar el horario en PDF / Excel.

### Rol Docente
1. Iniciar sesión.
2. Consultar su horario generado (vista por docente).
3. Exportar su horario (PDF / Excel).

## 4. Flujo principal (Golden Path)

```
Login (Admin) → Cargar/parametrizar datos → Generar horario (CSP) →
Revisar/ajustar manualmente → Activar horario → Exportar PDF/Excel
```

## 5. Requisitos para operar / mantener el sistema

- Cuentas free tier configuradas: Vercel (frontend), Render (solver), Supabase (BD/auth).
- Variables de entorno según `README.md` (claves de Supabase como `server-only`; nunca exponer `SERVICE_ROLE_KEY` en cliente).
- Para extender el modelo CSP: revisar el microservicio FastAPI/OR-Tools y las restricciones D1–D9 / B1–B5.

## 6. Conclusión

La transferencia se apoya en documentación **ya existente y verificable** (README con manual y despliegue, video demo, documentación técnica y de pruebas). El material cubre instalación, operación por rol y el flujo principal, suficiente para que el docente evaluador reproduzca y mantenga el sistema.

> Trazabilidad: §2 ↔ `README.md` y `docs/sdd/` · §3 ↔ RAN-02/RAN-04 del Acta revisada.
</content>
