-- ============================================================================
-- SGOHA - schema.sql (Sprint 1)
-- Stack: Supabase (PostgreSQL 15+) + Supabase Auth
-- Idempotente: DROP CASCADE + CREATE. Pensado para iterar en desarrollo.
-- En Sprint 2+ migrar a Supabase CLI con migraciones versionadas.
-- ============================================================================

-- 0. Extensiones --------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- 1. DROP en orden inverso de dependencias ------------------------------------
DROP TABLE IF EXISTS solicitud_cambio       CASCADE;
DROP TABLE IF EXISTS inscripcion            CASCADE;
DROP TABLE IF EXISTS sesion_nrc             CASCADE;
DROP TABLE IF EXISTS nrc                    CASCADE;
DROP TABLE IF EXISTS nrc_secuencia          CASCADE;
DROP TABLE IF EXISTS generation_job         CASCADE;
DROP TABLE IF EXISTS disponibilidad_profesor CASCADE;
DROP TABLE IF EXISTS bloque_horario         CASCADE;
DROP TABLE IF EXISTS aula                   CASCADE;
DROP TABLE IF EXISTS curso_profesor         CASCADE;
DROP TABLE IF EXISTS curso                  CASCADE;
DROP TABLE IF EXISTS cohorte                CASCADE;
DROP TABLE IF EXISTS ciclo                  CASCADE;
DROP TABLE IF EXISTS estudiante             CASCADE;
DROP TABLE IF EXISTS profesor               CASCADE;
DROP TABLE IF EXISTS perfil                 CASCADE;
DROP TABLE IF EXISTS carrera                CASCADE;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS handle_new_user()       CASCADE;
DROP FUNCTION IF EXISTS sync_sesion_denorm()    CASCADE;
DROP FUNCTION IF EXISTS set_updated_at()        CASCADE;
DROP FUNCTION IF EXISTS current_rol()           CASCADE;

DROP TYPE IF EXISTS rol_enum                CASCADE;
DROP TYPE IF EXISTS tipo_aula_enum          CASCADE;
DROP TYPE IF EXISTS tipo_profesor_enum      CASCADE;
DROP TYPE IF EXISTS turno_enum              CASCADE;
DROP TYPE IF EXISTS dia_enum                CASCADE;
DROP TYPE IF EXISTS inscripcion_estado_enum CASCADE;
DROP TYPE IF EXISTS solicitud_estado_enum   CASCADE;
DROP TYPE IF EXISTS job_status_enum         CASCADE;

-- 2. ENUMs --------------------------------------------------------------------
CREATE TYPE rol_enum                AS ENUM ('ADMIN','COORDINADOR','DOCENTE','ESTUDIANTE');
CREATE TYPE tipo_aula_enum          AS ENUM ('TEORIA','LABORATORIO','AUDITORIO');
CREATE TYPE tipo_profesor_enum      AS ENUM ('TIEMPO_COMPLETO','MEDIO_TIEMPO');
CREATE TYPE turno_enum              AS ENUM ('MANANA','TARDE','NOCHE');
CREATE TYPE dia_enum                AS ENUM ('LUN','MAR','MIE','JUE','VIE','SAB');
CREATE TYPE inscripcion_estado_enum AS ENUM ('ACTIVA','RETIRADA','APROBADA','DESAPROBADA');
CREATE TYPE solicitud_estado_enum   AS ENUM ('PENDIENTE','APROBADA','RECHAZADA');
CREATE TYPE job_status_enum         AS ENUM ('PENDIENTE','EJECUTANDO','EXITOSO','FALLIDO','CANCELADO');

-- 3. Funciones auxiliares -----------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Nota: `current_rol()` se define mas abajo, despues de crear la tabla
-- `perfil` (seccion 4) porque LANGUAGE sql valida el cuerpo en CREATE.

-- 4. Tablas -------------------------------------------------------------------

CREATE TABLE carrera (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL UNIQUE,
  activo        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- perfil extiende auth.users (Supabase Auth) con datos de dominio.
CREATE TABLE perfil (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre        VARCHAR(100) NOT NULL,
  rol           rol_enum NOT NULL,
  activo        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profesor (
  id            UUID PRIMARY KEY REFERENCES perfil(id) ON DELETE CASCADE,
  tipo          tipo_profesor_enum NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE estudiante (
  id            UUID PRIMARY KEY REFERENCES perfil(id) ON DELETE CASCADE,
  carrera_id    INT NOT NULL REFERENCES carrera(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ciclo (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(20) NOT NULL UNIQUE,    -- '2026-1'
  prefijo_nrc   CHAR(2) NOT NULL UNIQUE,        -- '61' => NRCs 61001, 61002, ...
  fecha_inicio  DATE NOT NULL,
  fecha_fin     DATE NOT NULL,
  activo        BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (fecha_fin > fecha_inicio),
  CHECK (prefijo_nrc ~ '^[0-9]{2}$')
);

CREATE TABLE cohorte (
  id            SERIAL PRIMARY KEY,
  carrera_id    INT NOT NULL REFERENCES carrera(id),
  ciclo_id      INT NOT NULL REFERENCES ciclo(id),
  nivel         SMALLINT NOT NULL CHECK (nivel BETWEEN 1 AND 10),
  seccion       VARCHAR(5) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (carrera_id, ciclo_id, nivel, seccion)
);

CREATE TABLE curso (
  id              SERIAL PRIMARY KEY,
  carrera_id      INT NOT NULL REFERENCES carrera(id),
  nivel           SMALLINT NOT NULL CHECK (nivel BETWEEN 1 AND 10),
  codigo          VARCHAR(15) NOT NULL UNIQUE,
  nombre          VARCHAR(100) NOT NULL,
  horas_semanales NUMERIC(3,1) NOT NULL,
  tipo_aula       tipo_aula_enum NOT NULL,
  activo          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- horas_semanales debe ser multiplo de 1.5 (1.5, 3.0, 4.5, 6.0, ...)
  CHECK (horas_semanales > 0 AND ((horas_semanales * 10)::INT % 15 = 0))
);

CREATE TABLE curso_profesor (
  curso_id      INT NOT NULL REFERENCES curso(id) ON DELETE CASCADE,
  profesor_id   UUID NOT NULL REFERENCES profesor(id) ON DELETE CASCADE,
  PRIMARY KEY (curso_id, profesor_id)
);

CREATE TABLE aula (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(50) NOT NULL UNIQUE,
  tipo          tipo_aula_enum NOT NULL,
  capacidad     INT NOT NULL CHECK (capacidad > 0),
  activo        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bloque_horario (
  id            SERIAL PRIMARY KEY,
  orden         SMALLINT NOT NULL UNIQUE,        -- 1..9 (orden cronologico del dia)
  hora_inicio   TIME NOT NULL,
  hora_fin      TIME NOT NULL,
  turno         turno_enum NOT NULL,
  CHECK (hora_fin > hora_inicio),
  UNIQUE (hora_inicio, hora_fin)
);

CREATE TABLE disponibilidad_profesor (
  profesor_id   UUID NOT NULL REFERENCES profesor(id) ON DELETE CASCADE,
  dia           dia_enum NOT NULL,
  turno         turno_enum NOT NULL,
  PRIMARY KEY (profesor_id, dia, turno)
);

-- Secuencia logica de NRCs por ciclo. Codigo final = prefijo_ciclo (2) + seq (3).
CREATE TABLE nrc_secuencia (
  ciclo_id      INT PRIMARY KEY REFERENCES ciclo(id) ON DELETE CASCADE,
  ultimo_valor  INT NOT NULL DEFAULT 0
);

-- Job de generacion de horario. Reanudable: estado_serializado guarda snapshot
-- del backtracking cada N decisiones. Si la Edge Function se corta por timeout,
-- el siguiente invoke lee este JSONB y continua desde donde quedo.
CREATE TABLE generation_job (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo_id            INT NOT NULL REFERENCES ciclo(id) ON DELETE CASCADE,
  status              job_status_enum NOT NULL DEFAULT 'PENDIENTE',
  progreso_actual     INT NOT NULL DEFAULT 0,    -- # NRCs ya asignados
  progreso_total      INT NOT NULL DEFAULT 0,    -- # NRCs a asignar
  estado_serializado  JSONB,                     -- snapshot para reanudar
  resultado           JSONB,                     -- output final (NRCs + sesiones)
  motivo_fallo        TEXT,                      -- "imposibilidad explicable"
  creado_por          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at          TIMESTAMPTZ,
  finished_at         TIMESTAMPTZ
);

CREATE TABLE nrc (
  nrc                 CHAR(5) PRIMARY KEY CHECK (nrc ~ '^[0-9]{5}$'),
  curso_id            INT NOT NULL REFERENCES curso(id),
  -- profesor_id nullable: el panel admin crea NRCs sin docente y lo asigna despues.
  -- ON DELETE SET NULL: borrar un profesor no falla si tenia NRCs asignados.
  profesor_id         UUID REFERENCES profesor(id) ON DELETE SET NULL,
  ciclo_id            INT NOT NULL REFERENCES ciclo(id),
  cohorte_id          INT NOT NULL REFERENCES cohorte(id),
  cupo_max            SMALLINT NOT NULL DEFAULT 30 CHECK (cupo_max BETWEEN 1 AND 30),
  generation_job_id   UUID REFERENCES generation_job(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- profesor_id y cohorte_id se denormalizan desde nrc para permitir UNIQUEs
-- que prevengan choques. Se mantienen en sincronia via trigger.
CREATE TABLE sesion_nrc (
  id            BIGSERIAL PRIMARY KEY,
  nrc           CHAR(5) NOT NULL REFERENCES nrc(nrc) ON DELETE CASCADE,
  profesor_id   UUID NOT NULL,
  cohorte_id    INT  NOT NULL,
  dia           dia_enum NOT NULL,
  bloque_id     INT NOT NULL REFERENCES bloque_horario(id),
  aula_id       INT NOT NULL REFERENCES aula(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Restricciones duras del CSP (las hace cumplir Postgres):
  UNIQUE (dia, bloque_id, aula_id),       -- 1 aula a la vez
  UNIQUE (dia, bloque_id, nrc),            -- 1 sesion por NRC en ese slot
  UNIQUE (dia, bloque_id, profesor_id),   -- 1 profesor a la vez
  UNIQUE (dia, bloque_id, cohorte_id)     -- 1 cohorte a la vez
);

CREATE OR REPLACE FUNCTION sync_sesion_denorm()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  SELECT n.profesor_id, n.cohorte_id
    INTO NEW.profesor_id, NEW.cohorte_id
  FROM nrc n WHERE n.nrc = NEW.nrc;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sesion_sync
  BEFORE INSERT OR UPDATE OF nrc ON sesion_nrc
  FOR EACH ROW EXECUTE FUNCTION sync_sesion_denorm();

CREATE TABLE inscripcion (
  id              BIGSERIAL PRIMARY KEY,
  estudiante_id   UUID NOT NULL REFERENCES estudiante(id) ON DELETE CASCADE,
  nrc             CHAR(5) NOT NULL REFERENCES nrc(nrc) ON DELETE CASCADE,
  estado          inscripcion_estado_enum NOT NULL DEFAULT 'ACTIVA',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (estudiante_id, nrc)
);

CREATE TABLE solicitud_cambio (
  id              BIGSERIAL PRIMARY KEY,
  estudiante_id   UUID NOT NULL REFERENCES estudiante(id),
  nrc_actual      CHAR(5) NOT NULL REFERENCES nrc(nrc),
  nrc_nuevo       CHAR(5) NOT NULL REFERENCES nrc(nrc),
  estado          solicitud_estado_enum NOT NULL DEFAULT 'PENDIENTE',
  motivo          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (nrc_actual <> nrc_nuevo)
);

-- 5. Triggers updated_at ------------------------------------------------------
CREATE TRIGGER trg_carrera_updated     BEFORE UPDATE ON carrera             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_perfil_updated      BEFORE UPDATE ON perfil              FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_profesor_updated    BEFORE UPDATE ON profesor            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_estudiante_updated  BEFORE UPDATE ON estudiante          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_ciclo_updated       BEFORE UPDATE ON ciclo               FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cohorte_updated     BEFORE UPDATE ON cohorte             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_curso_updated       BEFORE UPDATE ON curso               FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_aula_updated        BEFORE UPDATE ON aula                FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_nrc_updated         BEFORE UPDATE ON nrc                 FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_inscripcion_updated BEFORE UPDATE ON inscripcion         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_solicitud_updated   BEFORE UPDATE ON solicitud_cambio    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. Indices ------------------------------------------------------------------
CREATE INDEX idx_curso_carrera_nivel    ON curso(carrera_id, nivel) WHERE activo;
CREATE INDEX idx_aula_tipo_activo       ON aula(tipo) WHERE activo;
CREATE INDEX idx_disp_dia_turno         ON disponibilidad_profesor(dia, turno);
CREATE INDEX idx_sesion_dia_bloque      ON sesion_nrc(dia, bloque_id);
CREATE INDEX idx_sesion_profesor_slot   ON sesion_nrc(profesor_id, dia, bloque_id);
CREATE INDEX idx_sesion_cohorte_slot    ON sesion_nrc(cohorte_id, dia, bloque_id);
CREATE INDEX idx_nrc_ciclo              ON nrc(ciclo_id);
CREATE INDEX idx_nrc_cohorte            ON nrc(cohorte_id);
CREATE INDEX idx_inscripcion_estudiante ON inscripcion(estudiante_id);
CREATE INDEX idx_inscripcion_nrc        ON inscripcion(nrc);
CREATE INDEX idx_genjob_ciclo_status    ON generation_job(ciclo_id, status);

-- 7. RLS (Row Level Security) -------------------------------------------------
-- Nota: las Edge Functions / Server Actions que usen SERVICE_ROLE_KEY
-- bypassan RLS. Estas policies aplican a clientes con sesion (browser).

-- SECURITY DEFINER + search_path explicito: que la consulta dentro de las
-- policies NO dispare RLS recursivo sobre la propia tabla `perfil`.
CREATE OR REPLACE FUNCTION current_rol()
RETURNS rol_enum LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT rol FROM perfil WHERE id = auth.uid();
$$;

ALTER TABLE perfil                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesor                ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiante              ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrera                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciclo                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorte                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE curso                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE curso_profesor          ENABLE ROW LEVEL SECURITY;
ALTER TABLE aula                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloque_horario          ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad_profesor ENABLE ROW LEVEL SECURITY;
ALTER TABLE nrc                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE nrc_secuencia           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesion_nrc              ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripcion             ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitud_cambio        ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_job          ENABLE ROW LEVEL SECURITY;

-- ---------- perfil: lee/edita el suyo; ADMIN/COORD ven todo ----------
CREATE POLICY perfil_self_read   ON perfil FOR SELECT
  USING (id = auth.uid() OR current_rol() IN ('ADMIN','COORDINADOR'));
CREATE POLICY perfil_self_update ON perfil FOR UPDATE
  USING (id = auth.uid() OR current_rol() IN ('ADMIN','COORDINADOR'));
CREATE POLICY perfil_admin_ins   ON perfil FOR INSERT
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));
CREATE POLICY perfil_admin_del   ON perfil FOR DELETE
  USING (current_rol() = 'ADMIN');

-- ---------- catalogo (carrera, ciclo, cohorte, curso, aula, bloque) ----------
-- read: cualquier autenticado | write: ADMIN/COORDINADOR
CREATE POLICY carrera_read  ON carrera        FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY carrera_write ON carrera        FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

CREATE POLICY ciclo_read    ON ciclo          FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY ciclo_write   ON ciclo          FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

CREATE POLICY cohorte_read  ON cohorte        FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY cohorte_write ON cohorte        FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

CREATE POLICY curso_read    ON curso          FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY curso_write   ON curso          FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

CREATE POLICY aula_read     ON aula           FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY aula_write    ON aula           FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

CREATE POLICY bloque_read   ON bloque_horario FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY bloque_write  ON bloque_horario FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

-- ---------- profesor / curso_profesor / estudiante ----------
CREATE POLICY profesor_read  ON profesor       FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY profesor_write ON profesor       FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

CREATE POLICY cprof_read     ON curso_profesor FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY cprof_write    ON curso_profesor FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

CREATE POLICY est_self_read   ON estudiante    FOR SELECT
  USING (id = auth.uid() OR current_rol() IN ('ADMIN','COORDINADOR'));
CREATE POLICY est_admin_write ON estudiante    FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

-- ---------- disponibilidad_profesor: docente edita la suya ----------
CREATE POLICY disp_read  ON disponibilidad_profesor FOR SELECT
  USING (profesor_id = auth.uid() OR current_rol() IN ('ADMIN','COORDINADOR'));
CREATE POLICY disp_write ON disponibilidad_profesor FOR ALL
  USING (profesor_id = auth.uid() OR current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (profesor_id = auth.uid() OR current_rol() IN ('ADMIN','COORDINADOR'));

-- ---------- NRC y sesion_nrc: lectura amplia, escritura admin/coord ----------
CREATE POLICY nrc_read   ON nrc        FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY nrc_write  ON nrc        FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

CREATE POLICY ses_read   ON sesion_nrc FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY ses_write  ON sesion_nrc FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

-- ---------- inscripcion: estudiante CRUD self; docente lee; admin/coord all ----------
CREATE POLICY ins_read  ON inscripcion FOR SELECT
  USING (estudiante_id = auth.uid() OR current_rol() IN ('ADMIN','COORDINADOR','DOCENTE'));
CREATE POLICY ins_write ON inscripcion FOR ALL
  USING (estudiante_id = auth.uid() OR current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (estudiante_id = auth.uid() OR current_rol() IN ('ADMIN','COORDINADOR'));

-- ---------- solicitud_cambio: estudiante CRUD self; admin/coord all ----------
CREATE POLICY sol_read  ON solicitud_cambio FOR SELECT
  USING (estudiante_id = auth.uid() OR current_rol() IN ('ADMIN','COORDINADOR'));
CREATE POLICY sol_write ON solicitud_cambio FOR ALL
  USING (estudiante_id = auth.uid() OR current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (estudiante_id = auth.uid() OR current_rol() IN ('ADMIN','COORDINADOR'));

-- ---------- generation_job y nrc_secuencia: solo admin/coord ----------
CREATE POLICY genjob_admin ON generation_job FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

CREATE POLICY nrcseq_admin ON nrc_secuencia FOR ALL
  USING (current_rol() IN ('ADMIN','COORDINADOR'))
  WITH CHECK (current_rol() IN ('ADMIN','COORDINADOR'));

-- 7.5. Auto-creacion de perfil al registrar usuario --------------------------
-- Cuando Supabase Auth crea una fila en auth.users (signUp), este trigger
-- crea automaticamente la fila correspondiente en `perfil` con rol ESTUDIANTE.
-- Corre con SECURITY DEFINER para bypassar las policies RLS (un usuario nuevo
-- no tiene perfil aun, por lo que current_rol() retorna NULL y no puede
-- insertar el suyo a traves de la policy normal).
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO perfil (id, nombre, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    'ESTUDIANTE'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. Seed minimo (Sprint 1) ---------------------------------------------------

-- 9 bloques horarios (4 manana + 3 tarde + 2 noche)
INSERT INTO bloque_horario (orden, hora_inicio, hora_fin, turno) VALUES
  (1, '07:00', '08:30', 'MANANA'),
  (2, '08:40', '10:10', 'MANANA'),
  (3, '10:20', '11:50', 'MANANA'),
  (4, '12:00', '13:30', 'MANANA'),
  (5, '14:00', '15:30', 'TARDE'),
  (6, '15:40', '17:10', 'TARDE'),
  (7, '17:20', '18:50', 'TARDE'),
  (8, '19:00', '20:30', 'NOCHE'),
  (9, '20:40', '22:10', 'NOCHE');

-- Carrera y ciclo demo (Sprint 1: 1 carrera, 1 ciclo, ~20 cursos)
INSERT INTO carrera (nombre) VALUES ('Ingenieria de Sistemas');
INSERT INTO ciclo (nombre, prefijo_nrc, fecha_inicio, fecha_fin, activo)
  VALUES ('2026-1', '61', '2026-03-01', '2026-07-15', true);
INSERT INTO nrc_secuencia (ciclo_id, ultimo_valor)
  SELECT id, 0 FROM ciclo WHERE nombre = '2026-1';

-- ============================================================================
-- NOTAS PARA EL EQUIPO
-- ============================================================================
-- 1. Crear usuarios: registrar via Supabase Auth (Authentication > Users en
--    el dashboard, o supabase.auth.signUp desde la app). El trigger
--    on_auth_user_created (seccion 7.5) crea automaticamente la fila en
--    `perfil` con rol ESTUDIANTE. Para promover a ADMIN/COORDINADOR/DOCENTE:
--      UPDATE perfil SET rol = 'ADMIN' WHERE id = '<uuid>';
--
-- 2. Para regenerar el schema desde cero: SQL Editor > pegar este archivo > Run.
--    Borra TODO (DROP CASCADE). En Sprint 2+ pasamos a Supabase CLI con
--    migraciones versionadas en `web/supabase/migrations/`.
--
-- 3. El algoritmo generador respeta automaticamente las restricciones duras:
--    si intenta INSERT en sesion_nrc que viola un UNIQUE (aula/profesor/cohorte
--    ocupados), Postgres lo rechaza. La logica de backtracking es la red de
--    seguridad; la BD es el guardian final.
-- ============================================================================
