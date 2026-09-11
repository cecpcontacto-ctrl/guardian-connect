CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  guardian_name TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  origin TEXT NOT NULL DEFAULT 'Otro',
  work_minutes INTEGER NOT NULL DEFAULT 0,
  progress TEXT NOT NULL DEFAULT 'Sin Proceso',
  next_followup DATE,
  stage TEXT NOT NULL DEFAULT 'Nuevo Apoderado',
  position DOUBLE PRECISION NOT NULL DEFAULT 0,
  notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage cases" ON public.cases FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.cases (student_name, guardian_name, whatsapp, email, origin, work_minutes, progress, next_followup, stage, position, notes) VALUES
('Martina Rojas', 'Claudia Rojas', '56912345678', 'claudia.rojas@correo.cl', 'Inasistencia', 45, 'Sin Proceso', CURRENT_DATE - 2, 'Nuevo Apoderado', 1000, '[{"id":"n1","text":"Apoderada contactada por teléfono, no contesta.","created_at":"2026-09-08T14:00:00Z"}]'::jsonb),
('Benjamín Soto', 'Pedro Soto', '56987654321', 'pedro.soto@correo.cl', 'Atrasos', 30, 'En Proceso', CURRENT_DATE + 3, 'Problema Observado', 1000, '[{"id":"n2","text":"Se registran 6 atrasos en el mes.","created_at":"2026-09-09T11:30:00Z"}]'::jsonb),
('Sofía Muñoz', 'Ana Muñoz', '56911223344', 'ana.munoz@correo.cl', 'Calificaciones', 60, 'En Proceso', CURRENT_DATE + 1, 'Propuesta Enviada', 1000, '[{"id":"n3","text":"Se envía plan de reforzamiento en matemáticas.","created_at":"2026-09-10T09:15:00Z"}]'::jsonb),
('Diego Fuentes', 'Carla Fuentes', '56955667788', 'carla.fuentes@correo.cl', 'Conducta', 90, 'En Proceso', CURRENT_DATE - 1, 'Negociando', 1000, '[{"id":"n4","text":"Reunión con inspectoría agendada.","created_at":"2026-09-10T16:45:00Z"}]'::jsonb),
('Isidora Vega', 'Luis Vega', '56999887766', 'luis.vega@correo.cl', 'Inasistencia', 120, 'Proceso Exitoso', CURRENT_DATE + 14, 'Proceso Exitoso', 1000, '[{"id":"n5","text":"Asistencia normalizada durante 3 semanas.","created_at":"2026-09-05T08:00:00Z"}]'::jsonb),
('Tomás Herrera', 'Marcela Herrera', '56922334455', 'marcela.herrera@correo.cl', 'Otro', 15, 'Sin Proceso', CURRENT_DATE + 7, 'Proceso en Construcción', 1000, '[{"id":"n6","text":"Solicitud de apoyo psicosocial en evaluación.","created_at":"2026-09-11T10:00:00Z"}]'::jsonb);