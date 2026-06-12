-- ============================================================================
-- Migracion 002: perfil de DOCENTE legible para todos los autenticados
--                + funciones de conteo de cupos por NRC
--
-- Motivo:
-- (a) RLS de `perfil` solo permite leer la propia fila o admin/coord. Pero
--     estudiantes y docentes necesitan ver el NOMBRE del docente asignado a
--     un NRC (en /estudiante/inscripciones, /estudiante/horario, etc).
--
-- (b) RLS de `inscripcion` solo permite leer las propias filas (o docente/
--     admin). Eso rompe el conteo de cupos por NRC tanto en la UI como en
--     la validacion server-side antes de inscribirse.
--     Solucion: SECURITY DEFINER functions que cuentan saltando RLS y solo
--     devuelven el numero (no datos personales).
--
-- Idempotente.
-- Pegar en Supabase Dashboard > SQL Editor > Run.
-- ============================================================================

-- (a) RLS: cualquier autenticado puede leer el perfil de un DOCENTE -----------
DROP POLICY IF EXISTS perfil_docente_public_read ON perfil;
CREATE POLICY perfil_docente_public_read ON perfil
  FOR SELECT
  USING (rol = 'DOCENTE' AND auth.role() = 'authenticated');

-- (b1) Conteo escalar de inscripciones activas para un NRC --------------------
DROP FUNCTION IF EXISTS inscripcion_activas_count(CHAR(5));
CREATE FUNCTION inscripcion_activas_count(p_nrc CHAR(5))
RETURNS INT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*)::INT FROM inscripcion
   WHERE nrc = p_nrc AND estado = 'ACTIVA';
$$;

GRANT EXECUTE ON FUNCTION inscripcion_activas_count(CHAR(5)) TO authenticated;

-- (b2) Conteo set-returning para un set de NRCs (para la pagina) --------------
DROP FUNCTION IF EXISTS nrc_cupo_actual(CHAR(5)[]);
CREATE FUNCTION nrc_cupo_actual(p_nrcs CHAR(5)[])
RETURNS TABLE (nrc CHAR(5), ocupados INT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.nrc, COUNT(*)::INT
    FROM inscripcion i
   WHERE i.nrc = ANY(p_nrcs) AND i.estado = 'ACTIVA'
   GROUP BY i.nrc;
$$;

GRANT EXECUTE ON FUNCTION nrc_cupo_actual(CHAR(5)[]) TO authenticated;
