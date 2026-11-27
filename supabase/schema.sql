-- ============================================================================
-- BASE DE DATOS PLATAFORMA DE CAPACITACIÓN - VATOHA INGENIERÍA S.A.S.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLA DE PARTICIPANTES (Identificados de forma única por cédula)
CREATE TABLE IF NOT EXISTS public.participantes (
  cedula TEXT PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  cargo_empresa TEXT DEFAULT 'VATOHA Ingeniería S.A.S.',
  fecha_primer_ingreso TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ultimo_acceso TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLA DE INSCRIPCIONES POR CURSO (Evita duplicidad persona + curso)
CREATE TABLE IF NOT EXISTS public.inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cedula TEXT NOT NULL REFERENCES public.participantes(cedula) ON DELETE CASCADE,
  curso_id TEXT NOT NULL,
  curso_titulo TEXT NOT NULL,
  fecha_ingreso TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  porcentaje_avance INTEGER NOT NULL DEFAULT 0,
  promedio_general NUMERIC(3,1) NOT NULL DEFAULT 0.0,
  estado_finalizacion TEXT NOT NULL DEFAULT 'En progreso',
  fecha_finalizacion TIMESTAMPTZ NULL,
  CONSTRAINT unique_participante_curso UNIQUE (cedula, curso_id)
);

-- 3. TABLA DE PROGRESO Y MEJOR NOTA POR MÓDULO
CREATE TABLE IF NOT EXISTS public.progreso_modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscripcion_id UUID NOT NULL REFERENCES public.inscripciones(id) ON DELETE CASCADE,
  cedula TEXT NOT NULL REFERENCES public.participantes(cedula) ON DELETE CASCADE,
  curso_id TEXT NOT NULL,
  modulo_id TEXT NOT NULL,
  modulo_numero TEXT NOT NULL,
  modulo_titulo TEXT NOT NULL,
  orden_modulo INTEGER NOT NULL,
  mejor_nota NUMERIC(3,1) NOT NULL DEFAULT 0.0,
  ultimo_porcentaje INTEGER NOT NULL DEFAULT 0,
  intentos_totales INTEGER NOT NULL DEFAULT 0,
  aprobado BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_aprobacion TIMESTAMPTZ NULL,
  CONSTRAINT unique_inscripcion_modulo UNIQUE (inscripcion_id, modulo_id)
);

-- 4. HISTORIAL INMUTABLE DE INTENTOS DE EVALUACIÓN
CREATE TABLE IF NOT EXISTS public.intentos_quiz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscripcion_id UUID NOT NULL REFERENCES public.inscripciones(id) ON DELETE CASCADE,
  cedula TEXT NOT NULL REFERENCES public.participantes(cedula) ON DELETE CASCADE,
  curso_id TEXT NOT NULL,
  modulo_id TEXT NOT NULL,
  modulo_numero TEXT NOT NULL,
  numero_intento INTEGER NOT NULL,
  respuestas_json JSONB NOT NULL,
  respuestas_correctas INTEGER NOT NULL,
  respuestas_incorrectas INTEGER NOT NULL,
  total_preguntas INTEGER NOT NULL,
  porcentaje_desempeno INTEGER NOT NULL,
  nota NUMERIC(3,1) NOT NULL,
  aprobado BOOLEAN NOT NULL,
  fecha_presentacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CERTIFICADOS OFICIALES EMITIDOS
CREATE TABLE IF NOT EXISTS public.certificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_certificado TEXT NOT NULL UNIQUE,
  inscripcion_id UUID NOT NULL UNIQUE REFERENCES public.inscripciones(id) ON DELETE CASCADE,
  cedula TEXT NOT NULL REFERENCES public.participantes(cedula) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  curso_id TEXT NOT NULL,
  curso_titulo TEXT NOT NULL,
  nota_final NUMERIC(3,1) NOT NULL,
  fecha_emision TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ENCUESTAS DE SATISFACCIÓN
CREATE TABLE IF NOT EXISTS public.encuestas_satisfaccion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscripcion_id UUID NOT NULL UNIQUE REFERENCES public.inscripciones(id) ON DELETE CASCADE,
  cedula TEXT NOT NULL REFERENCES public.participantes(cedula) ON DELETE CASCADE,
  curso_id TEXT NOT NULL,
  calificacion TEXT NOT NULL,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CLAVES OFICIALES DE EVALUACIÓN (Protegida: nadie externo puede leerla)
CREATE TABLE IF NOT EXISTS public.quiz_claves (
  modulo_id TEXT PRIMARY KEY,
  respuestas_correctas INTEGER[] NOT NULL
);

-- Cargar claves oficiales de los 9 módulos actuales de js/data.js (índices base 0)
INSERT INTO public.quiz_claves (modulo_id, respuestas_correctas) VALUES
  ('lid-m1', ARRAY[1, 2, 0, 3, 1]),
  ('lid-m2', ARRAY[2, 0, 3, 1, 2]),
  ('lid-m3', ARRAY[1, 0]),
  ('ie-m1',  ARRAY[1, 0]),
  ('ie-m2',  ARRAY[0, 2, 1, 3, 0]),
  ('ie-m3',  ARRAY[1, 1]),
  ('rc-m1',  ARRAY[0, 1]),
  ('rc-m2',  ARRAY[1, 0]),
  ('rc-m3',  ARRAY[0, 1])
ON CONFLICT (modulo_id) DO UPDATE
SET respuestas_correctas = EXCLUDED.respuestas_correctas;

-- ============================================================================
-- SEGURIDAD (ROW LEVEL SECURITY)
-- ============================================================================
ALTER TABLE public.participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progreso_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas_satisfaccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_claves ENABLE ROW LEVEL SECURITY;

-- Solo los administradores autenticados pueden leer y administrar toda la base de datos
CREATE POLICY "Admin lee participantes" ON public.participantes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin lee inscripciones" ON public.inscripciones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin lee progreso" ON public.progreso_modulos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin lee intentos" ON public.intentos_quiz
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin lee certificados" ON public.certificados
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin lee encuestas" ON public.encuestas_satisfaccion
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin gestiona claves" ON public.quiz_claves
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Nota: El rol público (anon) NO tiene permisos directos de INSERT, UPDATE ni DELETE
-- sobre las tablas. Toda operación de participante pasa exclusivamente por las
-- siguientes funciones validadas en servidor (SECURITY DEFINER).

-- ============================================================================
-- FUNCIONES DE NEGOCIO SEGURAS (RPC)
-- ============================================================================

-- A. Registrar participante o recuperar su avance existente para un curso
CREATE OR REPLACE FUNCTION public.iniciar_sesion_capacitacion(
  p_cedula TEXT,
  p_nombre TEXT,
  p_curso_id TEXT,
  p_curso_titulo TEXT,
  p_modulos JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cedula TEXT := regexp_replace(trim(p_cedula), '[^0-9]', '', 'g');
  v_nombre TEXT := trim(p_nombre);
  v_participante public.participantes%ROWTYPE;
  v_inscripcion public.inscripciones%ROWTYPE;
  v_mod JSONB;
  v_idx INTEGER := 0;
  v_progreso JSONB;
  v_certificado public.certificados%ROWTYPE;
BEGIN
  IF length(v_cedula) < 5 OR length(v_cedula) > 12 THEN
    RAISE EXCEPTION 'Número de cédula inválido. Debe contener entre 5 y 12 dígitos.';
  END IF;

  IF length(v_nombre) < 3 THEN
    RAISE EXCEPTION 'Debes ingresar tu nombre completo.';
  END IF;

  -- Crear o actualizar acceso del participante sin duplicar cédula
  INSERT INTO public.participantes (cedula, nombre_completo, ultimo_acceso)
  VALUES (v_cedula, v_nombre, NOW())
  ON CONFLICT (cedula) DO UPDATE
  SET nombre_completo = CASE
        WHEN length(EXCLUDED.nombre_completo) >= 3 THEN EXCLUDED.nombre_completo
        ELSE public.participantes.nombre_completo
      END,
      ultimo_acceso = NOW()
  RETURNING * INTO v_participante;

  -- Crear inscripción única (cedula + curso_id) o recuperar la existente
  INSERT INTO public.inscripciones (cedula, curso_id, curso_titulo, fecha_ingreso)
  VALUES (v_cedula, p_curso_id, p_curso_titulo, NOW())
  ON CONFLICT (cedula, curso_id) DO UPDATE
  SET curso_titulo = EXCLUDED.curso_titulo
  RETURNING * INTO v_inscripcion;

  -- Inicializar los módulos del curso si aún no existen
  FOR v_mod IN SELECT * FROM jsonb_array_elements(p_modulos)
  LOOP
    v_idx := v_idx + 1;
    INSERT INTO public.progreso_modulos (
      inscripcion_id, cedula, curso_id, modulo_id, modulo_numero, modulo_titulo, orden_modulo
    )
    VALUES (
      v_inscripcion.id,
      v_cedula,
      p_curso_id,
      v_mod ->> 'id',
      v_mod ->> 'numero',
      v_mod ->> 'titulo',
      v_idx
    )
    ON CONFLICT (inscripcion_id, modulo_id) DO NOTHING;
  END LOOP;

  SELECT COALESCE(jsonb_agg(to_jsonb(pm) ORDER BY pm.orden_modulo ASC), '[]'::jsonb)
  INTO v_progreso
  FROM public.progreso_modulos pm
  WHERE pm.inscripcion_id = v_inscripcion.id;

  SELECT * INTO v_certificado
  FROM public.certificados
  WHERE inscripcion_id = v_inscripcion.id;

  RETURN jsonb_build_object(
    'participante', to_jsonb(v_participante),
    'inscripcion', to_jsonb(v_inscripcion),
    'progreso', v_progreso,
    'certificado', CASE WHEN v_certificado.id IS NOT NULL THEN to_jsonb(v_certificado) ELSE NULL END
  );
END;
$$;

-- B. Calificar evaluación automáticamente (1.0 a 5.0), guardar intento y actualizar avance
CREATE OR REPLACE FUNCTION public.registrar_intento_quiz(
  p_cedula TEXT,
  p_curso_id TEXT,
  p_modulo_id TEXT,
  p_respuestas JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cedula TEXT := regexp_replace(trim(p_cedula), '[^0-9]', '', 'g');
  v_inscripcion public.inscripciones%ROWTYPE;
  v_mod_prog public.progreso_modulos%ROWTYPE;
  v_prev_aprobado BOOLEAN;
  v_clave INTEGER[];
  v_total INTEGER;
  v_correctas INTEGER := 0;
  v_incorrectas INTEGER;
  v_porcentaje INTEGER;
  v_nota NUMERIC(3,1);
  v_aprobado BOOLEAN;
  v_num_intento INTEGER;
  v_total_modulos INTEGER;
  v_modulos_aprobados INTEGER;
  v_avance INTEGER;
  v_promedio NUMERIC(3,1);
  v_finalizado BOOLEAN;
  v_progreso_actualizado JSONB;
  i INTEGER;
  v_resp INTEGER;
BEGIN
  SELECT * INTO v_inscripcion
  FROM public.inscripciones
  WHERE cedula = v_cedula AND curso_id = p_curso_id;

  IF v_inscripcion.id IS NULL THEN
    RAISE EXCEPTION 'No existe una inscripción activa para esta cédula y curso.';
  END IF;

  SELECT * INTO v_mod_prog
  FROM public.progreso_modulos
  WHERE inscripcion_id = v_inscripcion.id AND modulo_id = p_modulo_id;

  IF v_mod_prog.id IS NULL THEN
    RAISE EXCEPTION 'El módulo no pertenece al curso inscrito.';
  END IF;

  -- Verificar que el módulo anterior esté aprobado (evita saltar módulos)
  IF v_mod_prog.orden_modulo > 1 THEN
    SELECT aprobado INTO v_prev_aprobado
    FROM public.progreso_modulos
    WHERE inscripcion_id = v_inscripcion.id
      AND orden_modulo = v_mod_prog.orden_modulo - 1;

    IF NOT COALESCE(v_prev_aprobado, FALSE) THEN
      RAISE EXCEPTION 'Bloqueado: debes aprobar el módulo anterior con nota mínima de 3.0.';
    END IF;
  END IF;

  -- Obtener respuestas correctas desde tabla protegida quiz_claves
  SELECT respuestas_correctas INTO v_clave
  FROM public.quiz_claves
  WHERE modulo_id = p_modulo_id;

  IF v_clave IS NULL THEN
    RAISE EXCEPTION 'No se encontraron claves de evaluación para el módulo %.', p_modulo_id;
  END IF;

  v_total := array_length(v_clave, 1);

  FOR i IN 0 .. (v_total - 1) LOOP
    v_resp := (p_respuestas ->> i)::INTEGER;
    IF v_resp IS NOT NULL AND v_resp = v_clave[i + 1] THEN
      v_correctas := v_correctas + 1;
    END IF;
  END LOOP;

  v_incorrectas := v_total - v_correctas;
  v_porcentaje := ROUND((v_correctas::NUMERIC / v_total::NUMERIC) * 100);
  -- Fórmula oficial: Nota = 1 + (Respuestas correctas / Total de preguntas * 4)
  v_nota := ROUND((1.0 + (v_correctas::NUMERIC / v_total::NUMERIC) * 4.0), 1);
  v_aprobado := (v_nota >= 3.0);

  SELECT COALESCE(MAX(numero_intento), 0) + 1 INTO v_num_intento
  FROM public.intentos_quiz
  WHERE inscripcion_id = v_inscripcion.id AND modulo_id = p_modulo_id;

  -- Guardar registro permanente en historial_intentos
  INSERT INTO public.intentos_quiz (
    inscripcion_id, cedula, curso_id, modulo_id, modulo_numero,
    numero_intento, respuestas_json, respuestas_correctas, respuestas_incorrectas,
    total_preguntas, porcentaje_desempeno, nota, aprobado
  ) VALUES (
    v_inscripcion.id, v_cedula, p_curso_id, p_modulo_id, v_mod_prog.modulo_numero,
    v_num_intento, p_respuestas, v_correctas, v_incorrectas,
    v_total, v_porcentaje, v_nota, v_aprobado
  );

  -- Actualizar progreso del módulo conservando la mejor nota obtenida
  UPDATE public.progreso_modulos
  SET mejor_nota = GREATEST(mejor_nota, v_nota),
      ultimo_porcentaje = GREATEST(ultimo_porcentaje, v_porcentaje),
      intentos_totales = v_num_intento,
      aprobado = (aprobado OR v_aprobado),
      fecha_aprobacion = CASE
        WHEN NOT aprobado AND v_aprobado THEN NOW()
        ELSE fecha_aprobacion
      END
  WHERE id = v_mod_prog.id;

  -- Recalcular porcentaje de avance y promedio general del curso
  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE aprobado = TRUE),
         COALESCE(ROUND(AVG(NULLIF(mejor_nota, 0)), 1), 0.0)
  INTO v_total_modulos, v_modulos_aprobados, v_promedio
  FROM public.progreso_modulos
  WHERE inscripcion_id = v_inscripcion.id;

  v_avance := ROUND((v_modulos_aprobados::NUMERIC / GREATEST(v_total_modulos, 1)::NUMERIC) * 100);
  v_finalizado := (v_modulos_aprobados = v_total_modulos AND v_total_modulos > 0);

  UPDATE public.inscripciones
  SET porcentaje_avance = v_avance,
      promedio_general = v_promedio,
      estado_finalizacion = CASE WHEN v_finalizado THEN 'Finalizado' ELSE 'En progreso' END,
      fecha_finalizacion = CASE
        WHEN v_finalizado AND fecha_finalizacion IS NULL THEN NOW()
        ELSE fecha_finalizacion
      END
  WHERE id = v_inscripcion.id
  RETURNING * INTO v_inscripcion;

  SELECT COALESCE(jsonb_agg(to_jsonb(pm) ORDER BY pm.orden_modulo ASC), '[]'::jsonb)
  INTO v_progreso_actualizado
  FROM public.progreso_modulos pm
  WHERE pm.inscripcion_id = v_inscripcion.id;

  RETURN jsonb_build_object(
    'resultado', jsonb_build_object(
      'numero_intento', v_num_intento,
      'correctas', v_correctas,
      'incorrectas', v_incorrectas,
      'total', v_total,
      'porcentaje', v_porcentaje,
      'nota', v_nota,
      'aprobado', v_aprobado
    ),
    'inscripcion', to_jsonb(v_inscripcion),
    'progreso', v_progreso_actualizado
  );
END;
$$;

-- C. Emitir o recuperar certificado oficial (solo si todos los módulos están aprobados >= 3.0)
CREATE OR REPLACE FUNCTION public.emitir_certificado_oficial(
  p_cedula TEXT,
  p_curso_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cedula TEXT := regexp_replace(trim(p_cedula), '[^0-9]', '', 'g');
  v_participante public.participantes%ROWTYPE;
  v_inscripcion public.inscripciones%ROWTYPE;
  v_pendientes INTEGER;
  v_cert public.certificados%ROWTYPE;
  v_codigo TEXT;
BEGIN
  SELECT * INTO v_participante FROM public.participantes WHERE cedula = v_cedula;
  SELECT * INTO v_inscripcion FROM public.inscripciones WHERE cedula = v_cedula AND curso_id = p_curso_id;

  IF v_inscripcion.id IS NULL THEN
    RAISE EXCEPTION 'Inscripción no encontrada.';
  END IF;

  SELECT COUNT(*) INTO v_pendientes
  FROM public.progreso_modulos
  WHERE inscripcion_id = v_inscripcion.id AND (aprobado = FALSE OR mejor_nota < 3.0);

  IF v_pendientes > 0 THEN
    RAISE EXCEPTION 'Aún tienes % módulo(s) sin aprobar con nota mínima de 3.0.', v_pendientes;
  END IF;

  SELECT * INTO v_cert FROM public.certificados WHERE inscripcion_id = v_inscripcion.id;

  IF v_cert.id IS NULL THEN
    v_codigo := 'VAT-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 6));

    INSERT INTO public.certificados (
      codigo_certificado, inscripcion_id, cedula, nombre_completo,
      curso_id, curso_titulo, nota_final, fecha_emision
    ) VALUES (
      v_codigo, v_inscripcion.id, v_cedula, v_participante.nombre_completo,
      v_inscripcion.curso_id, v_inscripcion.curso_titulo, v_inscripcion.promedio_general,
      COALESCE(v_inscripcion.fecha_finalizacion, NOW())
    )
    RETURNING * INTO v_cert;
  END IF;

  RETURN to_jsonb(v_cert);
END;
$$;

-- D. Guardar encuesta de satisfacción
CREATE OR REPLACE FUNCTION public.guardar_encuesta_satisfaccion(
  p_cedula TEXT,
  p_curso_id TEXT,
  p_calificacion TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cedula TEXT := regexp_replace(trim(p_cedula), '[^0-9]', '', 'g');
  v_inscripcion_id UUID;
BEGIN
  SELECT id INTO v_inscripcion_id
  FROM public.inscripciones
  WHERE cedula = v_cedula AND curso_id = p_curso_id;

  IF v_inscripcion_id IS NULL THEN
    RAISE EXCEPTION 'Inscripción no encontrada.';
  END IF;

  INSERT INTO public.encuestas_satisfaccion (inscripcion_id, cedula, curso_id, calificacion)
  VALUES (v_inscripcion_id, v_cedula, p_curso_id, p_calificacion)
  ON CONFLICT (inscripcion_id) DO UPDATE
  SET calificacion = EXCLUDED.calificacion,
      fecha_registro = NOW();

  RETURN TRUE;
END;
$$;

-- E. Verificación pública de autenticidad de certificados por código o cédula
CREATE OR REPLACE FUNCTION public.validar_certificado_publico(p_consulta TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean TEXT := upper(trim(p_consulta));
  v_res JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'codigo_certificado', codigo_certificado,
    'nombre_completo', nombre_completo,
    'cedula', cedula,
    'curso_titulo', curso_titulo,
    'nota_final', nota_final,
    'fecha_emision', fecha_emision
  )), '[]'::jsonb)
  INTO v_res
  FROM public.certificados
  WHERE upper(codigo_certificado) = v_clean
     OR cedula = regexp_replace(v_clean, '[^0-9]', '', 'g');

  RETURN v_res;
END;
$$;

-- Permitir ejecución de las funciones RPC desde la web pública (anon) y administradores (authenticated)
GRANT EXECUTE ON FUNCTION public.iniciar_sesion_capacitacion(TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_intento_quiz(TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emitir_certificado_oficial(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guardar_encuesta_satisfaccion(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validar_certificado_publico(TEXT) TO anon, authenticated;
