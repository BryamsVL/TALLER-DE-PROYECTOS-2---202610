# Auditoria WCAG

Fecha de revision: 2026-06-12

## Alcance revisado

- `frontend/app/login/page.tsx`
- `frontend/app/register/page.tsx`
- Formularios administrativos representativos

## Hallazgos corregidos

| ID | Criterio | Hallazgo | Correccion |
|---|---|---|---|
| WCAG-01 | 3.3.1 Error Identification | Los errores de login y registro no estaban vinculados explicitamente a los controles. | Se agrego `aria-invalid` y `aria-describedby` en campos con error. |
| WCAG-02 | 4.1.3 Status Messages | Los mensajes globales de error no se anunciaban como estado. | Se agrego `role="alert"` y `aria-live="polite"` en mensajes de formulario. |
| WCAG-03 | 4.1.2 Name, Role, Value | Los toggles de mostrar/ocultar contrasena no exponian estado presionado. | Se agrego `aria-pressed` y `title` a los botones de visibilidad. |

## Checklist actual

| Punto | Estado | Nota |
|---|---|---|
| Labels asociados a inputs | Cumple en flujos revisados | Uso consistente de `Label htmlFor` |
| Indicacion programatica de error | Cumple en login/registro tras ajuste | Revisar modulos restantes |
| Navegacion por teclado | Parcial | Requiere validacion manual en navegador |
| Semantica HTML | Parcial | Base correcta; falta auditoria completa del resto del app |
| Contraste | Pendiente | Requiere Lighthouse/axe y contraste visual real |
| Lectores de pantalla | Pendiente | Requiere prueba manual con NVDA o VoiceOver |
| Formularios admin | Parcial | Varios ya usan `aria-invalid`, pero falta unir mensajes con `aria-describedby` |
