# TDD.md — Implementación con Test-Driven Development (SGOHA)

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos  
**Curso:** Taller de Proyectos 2  
**Referencia base:** SDD_SGOHA.md, Spec_SGOHA_v2_0.md, HU_SGOHA.md

---

## Propósito del documento

Este documento convierte los contratos del SDD en **casos de prueba concretos** siguiendo el ciclo TDD: primero se escribe la prueba (Red), luego el código mínimo que la hace pasar (Green), luego se refactoriza (Refactor). Cada caso de prueba está identificado, vinculado a un contrato del SDD y a una historia de usuario, e incluye el código de prueba en Python usando `pytest`.

**Stack de pruebas:**
- Framework: `pytest` + `pytest-asyncio`
- Cliente HTTP: `httpx.AsyncClient` con la app FastAPI en modo de prueba
- Base de datos: SQLite en memoria para pruebas unitarias / PostgreSQL de prueba para integración
- Cobertura objetivo: ≥ 70% en módulos críticos (OR-Tools, validaciones, autenticación)

---

## Convenciones

- `TC-XXX-N` → caso de prueba del módulo XXX, número N
- Cada bloque de código es un test listo para ejecutarse
- Los fixtures compartidos se declaran en `conftest.py`
- Las marcas `@pytest.mark.unit` e `@pytest.mark.integration` separan los tipos de prueba

---

## conftest.py — Fixtures globales

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient
from app.main import app
from app.database import get_db, Base, engine

@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def admin_token(client):
    """Retorna un JWT de administrador ya registrado."""
    ...  # implementación auxiliar de registro + login

@pytest.fixture
def docente_token(client):
    """Retorna un JWT de docente ya registrado."""
    ...

@pytest.fixture
def estudiante_token(client):
    """Retorna un JWT de estudiante ya registrado."""
    ...

@pytest.fixture
def periodo_base(client, admin_token):
    """Carga el escenario base: 3 cursos, 3 docentes, 3 aulas, franjas de lunes a viernes."""
    ...
```

---

## 1. Módulo de Autenticación (HU-01, HU-02, HU-03)

### TC-AUTH-1 — Registro exitoso de usuario

**Contrato SDD:** Auth 1.1 C1  
**Ciclo TDD:** Red → implementar `POST /api/auth/register` → Green

```python
# tests/test_auth.py
import pytest

@pytest.mark.unit
async def test_registro_exitoso(client):
    payload = {
        "nombre": "Ana Torres",
        "email": "ana@uni.edu",
        "contrasena": "segura123",
        "rol": "administrador"
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "ana@uni.edu"
    assert data["rol"] == "administrador"
    assert "password_hash" not in data
    assert "contrasena" not in data
```

---

### TC-AUTH-2 — Registro con email duplicado

**Contrato SDD:** Auth 1.1 C2

```python
@pytest.mark.unit
async def test_registro_email_duplicado(client):
    payload = {"nombre": "A", "email": "dup@uni.edu", "contrasena": "abc123", "rol": "docente"}
    await client.post("/api/auth/register", json=payload)
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "ya está registrado" in response.json()["error"]
```

---

### TC-AUTH-3 — Registro con rol inválido

**Contrato SDD:** Auth 1.1 C3

```python
@pytest.mark.unit
async def test_registro_rol_invalido(client):
    payload = {"nombre": "B", "email": "b@uni.edu", "contrasena": "abc123", "rol": "superadmin"}
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "Rol inválido" in response.json()["error"]
```

---

### TC-AUTH-4 — Registro con campo obligatorio faltante

**Contrato SDD:** Auth 1.1 C4

```python
@pytest.mark.unit
@pytest.mark.parametrize("campo_faltante", ["nombre", "email", "contrasena", "rol"])
async def test_registro_campo_faltante(client, campo_faltante):
    payload = {"nombre": "C", "email": "c@uni.edu", "contrasena": "abc123", "rol": "estudiante"}
    del payload[campo_faltante]
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
```

---

### TC-AUTH-5 — Login exitoso, JWT contiene id, email y rol

**Contrato SDD:** Auth 1.2 C1–C3

```python
@pytest.mark.unit
@pytest.mark.parametrize("rol", ["administrador", "docente", "estudiante"])
async def test_login_exitoso_por_rol(client, rol):
    email = f"{rol}@uni.edu"
    await client.post("/api/auth/register", json={
        "nombre": "X", "email": email, "contrasena": "pass123", "rol": rol
    })
    response = await client.post("/api/auth/login", json={"email": email, "contrasena": "pass123"})
    assert response.status_code == 200
    token = response.json()["token"]
    import jwt as pyjwt
    payload = pyjwt.decode(token, options={"verify_signature": False})
    assert payload["rol"] == rol
    assert payload["email"] == email
    assert "id" in payload
```

---

### TC-AUTH-6 — Login con credenciales inválidas (mensaje genérico)

**Contrato SDD:** Auth 1.2 C4–C5

```python
@pytest.mark.unit
@pytest.mark.parametrize("email,contrasena", [
    ("noexiste@uni.edu", "cualquiera"),
    ("real@uni.edu", "incorrecta"),
])
async def test_login_credenciales_invalidas(client, email, contrasena):
    await client.post("/api/auth/register", json={
        "nombre": "R", "email": "real@uni.edu", "contrasena": "correcta", "rol": "estudiante"
    })
    response = await client.post("/api/auth/login", json={"email": email, "contrasena": contrasena})
    assert response.status_code == 401
    assert response.json()["error"] == "Credenciales inválidas"
```

---

### TC-AUTH-7 — Acceso denegado por rol incorrecto

**Contrato SDD:** Auth 1.3 C2–C3

```python
@pytest.mark.unit
async def test_acceso_denegado_estudiante_en_endpoint_admin(client, estudiante_token):
    headers = {"Authorization": f"Bearer {estudiante_token}"}
    response = await client.post("/api/schedules/institutional/generate", headers=headers)
    assert response.status_code == 403
    assert "administrador" in response.json()["error"]
```

---

### TC-AUTH-8 — Acceso sin token retorna 401

**Contrato SDD:** Auth 1.3 C4

```python
@pytest.mark.unit
async def test_acceso_sin_token(client):
    response = await client.get("/api/students")
    assert response.status_code == 401
```

---

### TC-AUTH-9 — Estudiante no puede ver horario de otro estudiante

**Contrato SDD:** Auth 1.3 C6

```python
@pytest.mark.unit
async def test_estudiante_no_accede_horario_ajeno(client, estudiante_token):
    headers = {"Authorization": f"Bearer {estudiante_token}"}
    response = await client.get("/api/schedules/students/otro-id-999", headers=headers)
    assert response.status_code == 403
```

---

## 2. Módulo de Gestión de Entidades (HU-04 a HU-10)

### TC-ENT-1 — Crear estudiante con código único

**Contrato SDD:** Entidades 2.1 C1

```python
@pytest.mark.unit
async def test_crear_estudiante_exitoso(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "codigo": "E001", "nombre": "Luis Pérez", "ciclo": 3,
        "carrera": "Ingeniería", "turno_preferido": "mañana",
        "limite_creditos": 20, "limite_horas_semanales": 20,
        "cursos_aprobados": []
    }
    response = await client.post("/api/students", json=payload, headers=headers)
    assert response.status_code == 201
    assert response.json()["codigo"] == "E001"
```

---

### TC-ENT-2 — Código de estudiante duplicado

**Contrato SDD:** Entidades 2.1 C2

```python
@pytest.mark.unit
async def test_crear_estudiante_codigo_duplicado(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {"codigo": "E001", "nombre": "A", "ciclo": 1, "carrera": "Ing",
               "turno_preferido": "mañana", "limite_creditos": 20,
               "limite_horas_semanales": 20, "cursos_aprobados": []}
    await client.post("/api/students", json=payload, headers=headers)
    response = await client.post("/api/students", json=payload, headers=headers)
    assert response.status_code == 400
    assert "duplicado" in response.json()["error"].lower()
```

---

### TC-ENT-3 — Curso aprobado inexistente en catálogo

**Contrato SDD:** Entidades 2.1 C3

```python
@pytest.mark.unit
async def test_crear_estudiante_curso_aprobado_inexistente(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {"codigo": "E002", "nombre": "B", "ciclo": 2, "carrera": "Ing",
               "turno_preferido": "tarde", "limite_creditos": 20,
               "limite_horas_semanales": 20, "cursos_aprobados": ["CUR-999"]}
    response = await client.post("/api/students", json=payload, headers=headers)
    assert response.status_code == 400
    assert "CUR-999" in response.json()["error"]
```

---

### TC-ENT-4 — Crear aula con capacidad cero

**Contrato SDD:** Entidades 2.4 C2

```python
@pytest.mark.unit
async def test_crear_aula_capacidad_cero(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {"codigo": "A001", "capacidad": 0, "tipo": "regular", "disponibilidad": []}
    response = await client.post("/api/classrooms", json=payload, headers=headers)
    assert response.status_code == 400
    assert "mayor a 0" in response.json()["error"]
```

---

### TC-ENT-5 — Configuración de componente inválida (GENERAL + TEORÍA)

**Contrato SDD:** Entidades 2.3 C5

```python
@pytest.mark.unit
async def test_componente_configuracion_invalida_general_teoria(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Primero crear el curso
    await client.post("/api/courses", json={
        "codigo": "MAT-101", "nombre": "Cálculo I", "creditos": 4,
        "horas_semanales": 4, "prerrequisitos": [], "corequisitos": []
    }, headers=headers)
    payload = {"componentes": [
        {"tipo": "GENERAL", "horas_semanales": 2, "tipo_aula_requerido": "regular"},
        {"tipo": "TEORÍA", "horas_semanales": 2, "tipo_aula_requerido": "regular"},
    ]}
    response = await client.post("/api/courses/MAT-101/components", json=payload, headers=headers)
    assert response.status_code == 400
    assert "inválida" in response.json()["error"].lower()
```

---

### TC-ENT-6 — Horas de componentes inconsistentes con total del curso

**Contrato SDD:** Entidades 2.3 C7

```python
@pytest.mark.unit
async def test_componente_horas_inconsistentes(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    await client.post("/api/courses", json={
        "codigo": "FIS-101", "nombre": "Física I", "creditos": 3,
        "horas_semanales": 4, "prerrequisitos": [], "corequisitos": []
    }, headers=headers)
    # Teoría 2h + Práctica 3h = 5h ≠ 4h del curso
    payload = {"componentes": [
        {"tipo": "TEORÍA", "horas_semanales": 2, "tipo_aula_requerido": "regular"},
        {"tipo": "PRÁCTICA", "horas_semanales": 3, "tipo_aula_requerido": "laboratorio"},
    ]}
    response = await client.post("/api/courses/FIS-101/components", json=payload, headers=headers)
    assert response.status_code == 400
    assert "no coincide" in response.json()["error"].lower()
```

---

### TC-ENT-7 — Franja horaria con hora_fin ≤ hora_inicio

**Contrato SDD:** Entidades 2.5 C2

```python
@pytest.mark.unit
async def test_franja_horaria_invalida(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {"dia": "lunes", "hora_inicio": "10:00", "hora_fin": "08:00", "turno": "mañana"}
    response = await client.post("/api/timeslots", json=payload, headers=headers)
    assert response.status_code == 400
    assert "posterior" in response.json()["error"].lower()
```

---

### TC-ENT-8 — Disponibilidad de docente es respetada por el solver (D3)

**Contrato SDD:** Entidades 2.2 C9 | Restricción D3

```python
@pytest.mark.integration
async def test_solver_respeta_disponibilidad_docente(client, admin_token, periodo_base):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Registrar docente con disponibilidad SOLO el viernes
    docente_id = periodo_base["docentes"][0]["id"]
    await client.post(f"/api/teachers/{docente_id}/availability", headers=headers, json=[
        {"dia": "viernes", "hora_inicio": "08:00", "hora_fin": "10:00", "disponible": True}
    ])
    # Generar horario
    await client.post("/api/schedules/institutional/generate", headers=headers)
    # Consultar asignaciones del docente
    r = await client.get(f"/api/schedules/teachers/{docente_id}", headers=headers)
    asignaciones = r.json()["asignaciones"]
    for a in asignaciones:
        assert a["dia"] == "viernes", f"Docente asignado fuera de su disponibilidad: {a['dia']}"
```

---

## 3. Módulo de Etapa 1 — Restricciones Duras (HU-11, HU-12)

### TC-E1-1 — D1: Sin solapamiento de docente

**Contrato SDD:** Etapa 1, 3.2 D1

```python
@pytest.mark.integration
async def test_d1_sin_solapamiento_docente(client, admin_token, periodo_base):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await client.post("/api/schedules/institutional/generate", headers=headers)
    assert response.status_code == 200
    horario = response.json()
    asignaciones = horario["asignaciones"]
    # Verificar que ningún docente aparece dos veces en la misma franja
    from collections import defaultdict
    ocupacion = defaultdict(list)
    for a in asignaciones:
        key = (a["docente_id"], a["franja_id"])
        ocupacion[key].append(a["componente_id"])
    for key, componentes in ocupacion.items():
        assert len(componentes) == 1, f"Solapamiento de docente en franja {key}: {componentes}"
```

---

### TC-E1-2 — D2: Sin solapamiento de aula

**Contrato SDD:** Etapa 1, 3.2 D2

```python
@pytest.mark.integration
async def test_d2_sin_solapamiento_aula(client, admin_token, periodo_base):
    headers = {"Authorization": f"Bearer {admin_token}"}
    await client.post("/api/schedules/institutional/generate", headers=headers)
    r = await client.get("/api/schedules/institutional/activo", headers=headers)
    asignaciones = r.json()["asignaciones"]
    from collections import defaultdict
    ocupacion = defaultdict(list)
    for a in asignaciones:
        key = (a["aula_id"], a["franja_id"])
        ocupacion[key].append(a["componente_id"])
    for key, componentes in ocupacion.items():
        assert len(componentes) == 1, f"Solapamiento de aula en franja {key}: {componentes}"
```

---

### TC-E1-3 — D5: Tipo de aula correcto para cada componente

**Contrato SDD:** Etapa 1, 3.2 D5

```python
@pytest.mark.integration
async def test_d5_tipo_aula_correcto(client, admin_token, periodo_base):
    headers = {"Authorization": f"Bearer {admin_token}"}
    await client.post("/api/schedules/institutional/generate", headers=headers)
    r = await client.get("/api/schedules/institutional/activo", headers=headers)
    for asignacion in r.json()["asignaciones"]:
        tipo_aula = asignacion["aula"]["tipo"]
        tipo_requerido = asignacion["componente"]["tipo_aula_requerido"]
        assert tipo_aula == tipo_requerido, (
            f"Componente {asignacion['componente_id']} requiere '{tipo_requerido}' "
            f"pero se asignó aula de tipo '{tipo_aula}'"
        )
```

---

### TC-E1-4 — D8: Capacidad del aula ≥ demanda del curso

**Contrato SDD:** Etapa 1, 3.2 D8

```python
@pytest.mark.integration
async def test_d8_capacidad_aula_suficiente(client, admin_token, periodo_base):
    headers = {"Authorization": f"Bearer {admin_token}"}
    await client.post("/api/schedules/institutional/generate", headers=headers)
    r = await client.get("/api/schedules/institutional/activo", headers=headers)
    for a in r.json()["asignaciones"]:
        assert a["aula"]["capacidad"] >= a["curso"]["demanda_proyectada"], (
            f"Aula con capacidad {a['aula']['capacidad']} insuficiente "
            f"para demanda {a['curso']['demanda_proyectada']}"
        )
```

---

### TC-E1-5 — EA-01: Docente sin disponibilidad no bloquea el proceso

**Contrato SDD:** Etapa 1, 3.1 C2

```python
@pytest.mark.integration
async def test_ea01_docente_sin_disponibilidad_no_bloquea(client, admin_token, periodo_base):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Crear docente sin ninguna franja disponible
    r_doc = await client.post("/api/teachers", json={
        "codigo": "D-SIN-DISP", "nombre": "Sin Disponibilidad", "especialidad": "Matemáticas"
    }, headers=headers)
    # No registramos disponibilidad para este docente
    response = await client.post("/api/schedules/institutional/generate", headers=headers)
    assert response.status_code == 200
    conflictos = response.json().get("conflictos", [])
    causas = [c["causa"] for c in conflictos]
    assert "sin_disponibilidad" in causas
    # El resto del horario debe existir
    assert len(response.json().get("asignaciones", [])) > 0
```

---

### TC-E1-6 — EA-13: Timeout del solver no persiste resultado

**Contrato SDD:** Etapa 1, 3.1 C6

```python
@pytest.mark.integration
async def test_ea13_timeout_no_persiste(client, admin_token, mocker):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Simular que el solver excede el tiempo límite
    mocker.patch("app.services.ortools_solver.solve", side_effect=TimeoutError("Solver timeout"))
    response = await client.post("/api/schedules/institutional/generate", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body.get("estado") != "BORRADOR"
    assert "conflictos" in body
    # Verificar que no quedó ningún horario persistido
    r_list = await client.get("/api/schedules/institutional", headers=headers)
    assert len(r_list.json()) == 0
```

---

### TC-E1-7 — Generación completa dentro de 30 segundos (escenario base)

**Contrato SDD:** Rendimiento 8

```python
@pytest.mark.integration
async def test_generacion_etapa1_dentro_tiempo_limite(client, admin_token, periodo_base):
    import time
    headers = {"Authorization": f"Bearer {admin_token}"}
    inicio = time.time()
    response = await client.post("/api/schedules/institutional/generate", headers=headers)
    duracion = time.time() - inicio
    assert response.status_code == 200
    assert duracion <= 30, f"Etapa 1 tardó {duracion:.2f}s, límite: 30s"
```

---

## 4. Módulo de Activación y Ajuste Manual (HU-13, HU-14)

### TC-ACT-1 — Activación exitosa de horario sin solapamientos

**Contrato SDD:** Etapa 1, 3.3 C1

```python
@pytest.mark.integration
async def test_activacion_exitosa(client, admin_token, periodo_base):
    headers = {"Authorization": f"Bearer {admin_token}"}
    r_gen = await client.post("/api/schedules/institutional/generate", headers=headers)
    horario_id = r_gen.json()["id"]
    r_act = await client.post(f"/api/schedules/institutional/{horario_id}/activate", headers=headers)
    assert r_act.status_code == 200
    assert r_act.json()["estado"] == "ACTIVO"
```

---

### TC-ACT-2 — No se puede modificar horario ACTIVO directamente

**Contrato SDD:** Etapa 1, 3.3 C3

```python
@pytest.mark.integration
async def test_modificacion_horario_activo_bloqueada(client, admin_token, periodo_base):
    headers = {"Authorization": f"Bearer {admin_token}"}
    r_gen = await client.post("/api/schedules/institutional/generate", headers=headers)
    horario_id = r_gen.json()["id"]
    assignment_id = r_gen.json()["asignaciones"][0]["id"]
    await client.post(f"/api/schedules/institutional/{horario_id}/activate", headers=headers)
    # Intentar modificar el horario ACTIVO
    response = await client.put(
        f"/api/schedules/institutional/{horario_id}/assignments/{assignment_id}",
        json={"docente_id": "nuevo", "aula_id": "nueva", "franja_id": "nueva"},
        headers=headers
    )
    assert response.status_code == 409
    assert "activo" in response.json()["error"].lower()
```

---

### TC-ACT-3 — Validación de solapamiento en ajuste manual ≤ 1 segundo

**Contrato SDD:** Etapa 1, 3.4 C2

```python
@pytest.mark.integration
async def test_ajuste_manual_solapamiento_docente_en_tiempo(client, admin_token, periodo_base):
    import time
    headers = {"Authorization": f"Bearer {admin_token}"}
    r_gen = await client.post("/api/schedules/institutional/generate", headers=headers)
    horario_id = r_gen.json()["id"]
    asignaciones = r_gen.json()["asignaciones"]
    # Intentar mover el segundo componente a la franja del primero (mismo docente)
    a1, a2 = asignaciones[0], asignaciones[1]
    inicio = time.time()
    response = await client.put(
        f"/api/schedules/institutional/{horario_id}/assignments/{a2['id']}",
        json={"docente_id": a1["docente_id"], "aula_id": a2["aula_id"], "franja_id": a1["franja_id"]},
        headers=headers
    )
    duracion = time.time() - inicio
    assert response.status_code == 409
    assert duracion <= 1.0, f"Validación tardó {duracion:.3f}s, límite: 1s"
    assert "Solapamiento de docente" in response.json()["error"]
```

---

### TC-ACT-4 — Cancelación libera todos los recursos

**Contrato SDD:** Etapa 1, 3.3 C4

```python
@pytest.mark.integration
async def test_cancelacion_libera_recursos(client, admin_token, periodo_base):
    headers = {"Authorization": f"Bearer {admin_token}"}
    r_gen = await client.post("/api/schedules/institutional/generate", headers=headers)
    horario_id = r_gen.json()["id"]
    await client.post(f"/api/schedules/institutional/{horario_id}/activate", headers=headers)
    r_cancel = await client.post(f"/api/schedules/institutional/{horario_id}/cancel", headers=headers)
    assert r_cancel.status_code == 200
    assert r_cancel.json()["estado"] == "CANCELADO"
    # Verificar que se puede generar un nuevo horario (recursos liberados)
    r_nuevo = await client.post("/api/schedules/institutional/generate", headers=headers)
    assert r_nuevo.status_code == 200
```

---

## 5. Módulo de Etapa 2 — Horario de Docentes (HU-16, HU-17)

### TC-E2-1 — Etapa 2 sin horario ACTIVO retorna error descriptivo

**Contrato SDD:** Etapa 2, 4.1 C2

```python
@pytest.mark.integration
async def test_etapa2_sin_horario_activo(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await client.post("/api/schedules/teachers/generate", headers=headers)
    assert response.status_code == 400
    assert "activo" in response.json()["error"].lower()
```

---

### TC-E2-2 — D10: Vista del docente solo contiene sus propias asignaciones

**Contrato SDD:** Etapa 2, 4.2 invariante D10

```python
@pytest.mark.integration
async def test_d10_vista_docente_solo_sus_asignaciones(client, admin_token, periodo_base):
    headers = {"Authorization": f"Bearer {admin_token}"}
    r_gen = await client.post("/api/schedules/institutional/generate", headers=headers)
    horario_id = r_gen.json()["id"]
    await client.post(f"/api/schedules/institutional/{horario_id}/activate", headers=headers)
    await client.post("/api/schedules/teachers/generate", headers=headers)
    docente_id = periodo_base["docentes"][0]["id"]
    r = await client.get(f"/api/schedules/teachers/{docente_id}", headers=headers)
    for asignacion in r.json()["asignaciones"]:
        assert asignacion["docente_id"] == docente_id
```

---

### TC-E2-3 — Alerta de carga excesiva cuando supera 4 horas consecutivas (B2)

**Contrato SDD:** Etapa 2, 4.2 C4

```python
@pytest.mark.integration
async def test_b2_alerta_carga_excesiva(client, admin_token, periodo_docente_sobrecargado):
    headers = {"Authorization": f"Bearer {admin_token}"}
    docente_id = periodo_docente_sobrecargado["docente_id"]
    r = await client.get(f"/api/schedules/teachers/{docente_id}", headers=headers)
    assert r.json()["alerta_carga_excesiva"] is True
```

---

### TC-E2-4 — Etapa 2 se genera en ≤ 5 segundos por docente

**Contrato SDD:** Rendimiento 8

```python
@pytest.mark.integration
async def test_etapa2_tiempo_limite(client, admin_token, periodo_base):
    import time
    headers = {"Authorization": f"Bearer {admin_token}"}
    r_gen = await client.post("/api/schedules/institutional/generate", headers=headers)
    horario_id = r_gen.json()["id"]
    await client.post(f"/api/schedules/institutional/{horario_id}/activate", headers=headers)
    inicio = time.time()
    await client.post("/api/schedules/teachers/generate", headers=headers)
    duracion = time.time() - inicio
    n_docentes = len(periodo_base["docentes"])
    assert duracion <= 5 * n_docentes, f"Etapa 2 tardó {duracion:.2f}s para {n_docentes} docentes"
```

---

## 6. Módulo de Etapa 3 — Horario de Estudiantes (HU-18 a HU-22)

### TC-E3-1 — D12: Prerrequisito faltante excluye el curso con notificación precisa

**Contrato SDD:** Etapa 3, 5.1 C2

```python
@pytest.mark.unit
async def test_d12_prerequisito_faltante(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Crear cursos: CALC-1 como prerrequisito de CALC-2
    await client.post("/api/courses", json={
        "codigo": "CALC-1", "nombre": "Cálculo I", "creditos": 4,
        "horas_semanales": 4, "prerrequisitos": [], "corequisitos": []
    }, headers=headers)
    await client.post("/api/courses", json={
        "codigo": "CALC-2", "nombre": "Cálculo II", "creditos": 4,
        "horas_semanales": 4, "prerrequisitos": ["CALC-1"], "corequisitos": []
    }, headers=headers)
    # Crear estudiante sin CALC-1 aprobado
    await client.post("/api/students", json={
        "codigo": "E100", "nombre": "Pedro", "ciclo": 2, "carrera": "Ing",
        "turno_preferido": "mañana", "limite_creditos": 20,
        "limite_horas_semanales": 20, "cursos_aprobados": []
    }, headers=headers)
    # Simular evaluación de prerrequisitos
    r = await client.post("/api/schedules/students/E100/validate-prerequisites",
                          json={"cursos_candidatos": ["CALC-2"]}, headers=headers)
    assert "CALC-1" in r.json()["excluidos"][0]["prerequisito_faltante"]
```

---

### TC-E3-2 — D13: Exceso de créditos con mensaje exacto (EA-10)

**Contrato SDD:** Etapa 3, 5.2 C2

```python
@pytest.mark.unit
async def test_d13_exceso_creditos_mensaje_exacto(client, admin_token, estudiante_con_18_creditos):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Intentar agregar curso de 5 créditos a un estudiante con 18/20 créditos acumulados
    response = await client.post(
        f"/api/schedules/students/{estudiante_con_18_creditos['id']}/add-course",
        json={"curso_id": "CURSO-5CR"},
        headers=headers
    )
    assert response.status_code == 200
    body = response.json()
    assert body["excluidos"][0]["causa"] == "LIMITE_CREDITOS"
    assert "18 + 5 = 23" in body["excluidos"][0]["detalle"]
    assert "límite: 20" in body["excluidos"][0]["detalle"]
```

---

### TC-E3-3 — D14: Exceso de horas semanales con mensaje exacto (EA-11)

**Contrato SDD:** Etapa 3, 5.2 C3

```python
@pytest.mark.unit
async def test_d14_exceso_horas_mensaje_exacto(client, admin_token, estudiante_con_18_horas):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await client.post(
        f"/api/schedules/students/{estudiante_con_18_horas['id']}/add-course",
        json={"curso_id": "CURSO-4H"},
        headers=headers
    )
    body = response.json()
    assert body["excluidos"][0]["causa"] == "LIMITE_HORAS"
    assert "18 + 4 = 22" in body["excluidos"][0]["detalle"]
    assert "límite: 20" in body["excluidos"][0]["detalle"]
```

---

### TC-E3-4 — D16: Turno alternativo emitido cuando no hay oferta en turno preferido

**Contrato SDD:** Etapa 3, 5.3 C3

```python
@pytest.mark.integration
async def test_d16_turno_alternativo_emitido(client, admin_token, periodo_solo_tarde):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Estudiante con turno preferido "mañana", pero solo hay oferta en "tarde"
    estudiante_id = periodo_solo_tarde["estudiante_manana"]
    r = await client.post(
        f"/api/schedules/students/{estudiante_id}/generate", headers=headers
    )
    assert r.status_code == 200
    body = r.json()
    assert body["TURNO_ALTERNATIVO"] is True
    # Verificar que las asignaciones son efectivamente en turno tarde
    for curso in body["cursos_asignados"]:
        assert curso["franja"]["turno"] == "tarde"
```

---

### TC-E3-5 — EA-08: Estudiante sin turno preferido usa todas las franjas (sin TURNO_ALTERNATIVO)

**Contrato SDD:** Etapa 3, 5.3 C4

```python
@pytest.mark.integration
async def test_ea08_sin_turno_preferido_no_emite_turno_alternativo(client, admin_token, periodo_base):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Estudiante sin turno_preferido
    await client.post("/api/students", json={
        "codigo": "E-SIN-TURNO", "nombre": "Sin Turno", "ciclo": 1, "carrera": "Ing",
        "turno_preferido": None, "limite_creditos": 20,
        "limite_horas_semanales": 20, "cursos_aprobados": []
    }, headers=headers)
    r = await client.post("/api/schedules/students/E-SIN-TURNO/generate", headers=headers)
    assert r.status_code == 200
    assert r.json().get("TURNO_ALTERNATIVO") is False
```

---

### TC-E3-6 — D17: Atomicidad de curso compuesto (TEORÍA sin PRÁCTICA → ninguno asignado)

**Contrato SDD:** Etapa 3, 5.3 C6

```python
@pytest.mark.integration
async def test_d17_atomicidad_curso_compuesto(client, admin_token, periodo_sin_laboratorio):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # El período no tiene laboratorios disponibles
    # El curso FIS-101 requiere TEORÍA (regular) + PRÁCTICA (laboratorio)
    estudiante_id = periodo_sin_laboratorio["estudiante_id"]
    r = await client.post(f"/api/schedules/students/{estudiante_id}/generate", headers=headers)
    body = r.json()
    codigos_asignados = [c["codigo"] for c in body["cursos_asignados"]]
    assert "FIS-101" not in codigos_asignados
    excluidos = {e["curso"] for e in body["cursos_no_asignables"]}
    assert "FIS-101" in excluidos
    # Verificar que los créditos de FIS-101 no se acumularon
    assert body["creditos_totales"] == 0
```

---

### TC-E3-7 — D18: Atomicidad de corequisitos (uno falla → grupo completo excluido)

**Contrato SDD:** Etapa 3, 5.1 C3

```python
@pytest.mark.integration
async def test_d18_atomicidad_corequisitos(client, admin_token, periodo_corequisito_falla):
    headers = {"Authorization": f"Bearer {admin_token}"}
    estudiante_id = periodo_corequisito_falla["estudiante_id"]
    # Cursos A y B son corequisitos; B no puede asignarse por falta de docente
    r = await client.post(f"/api/schedules/students/{estudiante_id}/generate", headers=headers)
    body = r.json()
    codigos_asignados = [c["codigo"] for c in body["cursos_asignados"]]
    assert "CURSO-A" not in codigos_asignados
    assert "CURSO-B" not in codigos_asignados
```

---

### TC-E3-8 — EA-12: Etapa 3 sin horario ACTIVO retorna error descriptivo

**Contrato SDD:** Etapa 3, 5.3 C2

```python
@pytest.mark.integration
async def test_ea12_etapa3_sin_horario_activo(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await client.post("/api/schedules/students/E001/generate", headers=headers)
    assert response.status_code == 400
    assert "horario de docentes" in response.json()["error"].lower()
```

---

### TC-E3-9 — Generación de Etapa 3 dentro de 5 segundos

**Contrato SDD:** Rendimiento 8

```python
@pytest.mark.integration
async def test_etapa3_tiempo_limite_por_estudiante(client, admin_token, periodo_etapa3_listo):
    import time
    headers = {"Authorization": f"Bearer {admin_token}"}
    estudiante_id = periodo_etapa3_listo["estudiante_id"]
    inicio = time.time()
    r = await client.post(f"/api/schedules/students/{estudiante_id}/generate", headers=headers)
    duracion = time.time() - inicio
    assert r.status_code == 200
    assert duracion <= 5.0, f"Etapa 3 tardó {duracion:.2f}s, límite: 5s"
```

---

## 7. Módulo de Visualización y Exportación (HU-23, HU-24, HU-25)

### TC-VIZ-1 — Grilla semanal carga en ≤ 3 segundos

**Contrato SDD:** Visualización 6.1 C1

```python
@pytest.mark.integration
async def test_grilla_carga_en_tiempo(client, admin_token, periodo_etapa3_listo):
    import time
    headers = {"Authorization": f"Bearer {admin_token}"}
    inicio = time.time()
    response = await client.get("/api/schedules/institutional/activo/grid", headers=headers)
    duracion = time.time() - inicio
    assert response.status_code == 200
    assert duracion <= 3.0, f"Grilla tardó {duracion:.2f}s, límite: 3s"
```

---

### TC-VIZ-2 — Exportación PDF dentro de 30 segundos

**Contrato SDD:** Visualización 6.2 C1

```python
@pytest.mark.integration
async def test_exportacion_pdf_en_tiempo(client, admin_token, periodo_etapa3_listo):
    import time
    headers = {"Authorization": f"Bearer {admin_token}"}
    docente_id = periodo_etapa3_listo["docente_id"]
    inicio = time.time()
    response = await client.get(
        f"/api/schedules/teacher/{docente_id}/export?format=pdf", headers=headers
    )
    duracion = time.time() - inicio
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert duracion <= 30.0, f"PDF tardó {duracion:.2f}s, límite: 30s"
```

---

### TC-VIZ-3 — Exportación denegada sobre horario ajeno

**Contrato SDD:** Visualización 6.2 C3

```python
@pytest.mark.integration
async def test_exportacion_denegada_horario_ajeno(client, estudiante_token):
    headers = {"Authorization": f"Bearer {estudiante_token}"}
    response = await client.get("/api/schedules/student/otro-id-999/export?format=pdf", headers=headers)
    assert response.status_code == 403
```

---

### TC-VIZ-4 — Formato de exportación no soportado

**Contrato SDD:** Visualización 6.2 C4

```python
@pytest.mark.unit
async def test_exportacion_formato_no_soportado(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await client.get("/api/schedules/institutional/1/export?format=csv", headers=headers)
    assert response.status_code == 400
    assert "Formato no soportado" in response.json()["error"]
```

---

## 8. Módulo de Seguridad OWASP (HU-26)

### TC-SEC-1 — Sin SQL Injection por uso de ORM

```python
@pytest.mark.unit
async def test_no_sql_injection_en_busqueda(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Intentar SQL injection en el filtro de nombre
    response = await client.get(
        "/api/students?nombre=' OR '1'='1", headers=headers
    )
    # El sistema no debe devolver todos los registros ni producir error 500
    assert response.status_code in [200, 400]
    if response.status_code == 200:
        # Si retorna 200, debe ser una lista vacía (no todos los registros)
        assert response.json() == []
```

---

### TC-SEC-2 — Datos sensibles no expuestos en logs ni respuestas de error

```python
@pytest.mark.unit
async def test_password_no_expuesto_en_respuesta(client):
    payload = {"nombre": "Z", "email": "z@uni.edu", "contrasena": "MiClaveSecreta", "rol": "docente"}
    response = await client.post("/api/auth/register", json=payload)
    response_str = response.text
    assert "MiClaveSecreta" not in response_str
    assert "password_hash" not in response_str
```

---

## 9. Resumen de cobertura por módulo

| Módulo | TCs unitarios | TCs integración | HU vinculadas | Restricciones cubiertas |
|---|---|---|---|---|
| Autenticación | TC-AUTH-1 a 9 | TC-AUTH-7, 8, 9 | HU-01, 02, 03 | RNF Seguridad |
| Gestión de entidades | TC-ENT-1 a 8 | TC-ENT-8 | HU-04 a 10 | RF-01 a RF-06 |
| Etapa 1 — Generación | — | TC-E1-1 a 7 | HU-11, 12 | D1–D9, EA-01, EA-13 |
| Activación / Ajuste | — | TC-ACT-1 a 4 | HU-13, 14 | D1, D2, Regla 10 |
| Etapa 2 — Docentes | TC-E2-1 | TC-E2-2 a 4 | HU-16, 17 | D10, D11, B2 |
| Etapa 3 — Estudiantes | TC-E3-1 a 3 | TC-E3-4 a 9 | HU-18 a 22 | D12–D19, EA-07 a EA-12 |
| Visualización / Exportación | TC-VIZ-4 | TC-VIZ-1 a 3 | HU-23, 24, 25 | RNF Rendimiento |
| Seguridad OWASP | TC-SEC-1, 2 | — | HU-26 | OWASP Top 10 |

---

## 10. Ciclo TDD por historia de usuario

```
Para cada HU del proyecto, el equipo sigue este ciclo estricto:

  1. RED   → Escribir el caso de prueba de este documento.
             Ejecutar: pytest → FALLA (el código aún no existe).

  2. GREEN → Escribir el código mínimo en FastAPI / OR-Tools
             que hace pasar exactamente ese test.
             Ejecutar: pytest → PASA.

  3. REFACTOR → Mejorar el código (legibilidad, estructura, rendimiento)
                sin romper ningún test existente.
                Ejecutar: pytest → todos PASAN.

  4. COMMIT  → Commit atómico: test + código + refactor juntos.
```

**Criterio de cierre de sprint:** La suite completa de tests definidos en este documento debe pasar con cobertura ≥ 70% en los módulos críticos antes de considerar el sprint cerrado.
