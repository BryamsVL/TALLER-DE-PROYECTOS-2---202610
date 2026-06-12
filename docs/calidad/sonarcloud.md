# SonarCloud

## Estado actual

El repositorio ya incluye los dos artefactos base requeridos por la consigna:

- `sonar-project.properties`
- `.github/workflows/sonarcloud.yml`

La configuracion analiza `backend` y `frontend` en un mismo proyecto y consume cobertura LCOV desde:

- `backend/coverage/lcov.info`
- `frontend/coverage/lcov.info`

## Pendientes operativos

1. Reemplazar `sonar.organization=CHANGE_ME_ORG` por la organizacion real de SonarCloud.
2. Crear el secreto `SONAR_TOKEN` en GitHub.
3. Ejecutar el workflow `SonarCloud Analysis`.
4. Capturar dashboard inicial.
5. Corregir issues priorizados y volver a capturar dashboard final.

## Alcance configurado

- Fuentes backend: `backend/src`
- Fuentes frontend: `frontend/app`, `frontend/components`, `frontend/lib`, `frontend/hooks`
- Exclusiones: `node_modules`, `.next`, `coverage`, `cypress/videos`, `cypress/screenshots`, builds y migraciones
- Tests incluidos: `*.test.*`, `*.spec.*` y `cypress`

## Evidencia a adjuntar

- Ejecucion exitosa del workflow en GitHub Actions
- Dashboard SonarCloud antes
- Dashboard SonarCloud despues
- Tabla comparativa: bugs, vulnerabilities, code smells, duplicated lines, coverage, technical debt
