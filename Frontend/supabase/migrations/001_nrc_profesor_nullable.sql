-- ============================================================================
-- Migracion 001: nrc.profesor_id nullable + ON DELETE SET NULL
--
-- Motivo: el flujo del panel admin permite crear NRCs sin profesor asignado
-- (se asigna en un paso posterior desde la UI). Tambien evita fallos al
-- borrar profesores que tengan NRCs ya generados (los deja huerfanos).
--
-- Idempotente: usa IF EXISTS para que correrla 2 veces no falle.
-- Pegar en Supabase Dashboard > SQL Editor > Run.
-- ============================================================================

ALTER TABLE nrc ALTER COLUMN profesor_id DROP NOT NULL;

ALTER TABLE nrc DROP CONSTRAINT IF EXISTS nrc_profesor_id_fkey;
ALTER TABLE nrc
  ADD CONSTRAINT nrc_profesor_id_fkey
  FOREIGN KEY (profesor_id)
  REFERENCES profesor(id)
  ON DELETE SET NULL;
