-- Script para verificar y corregir la tabla projects
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Agregar las columnas si no existen
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS calendar_ends DATE,
ADD COLUMN IF NOT EXISTS strategy TEXT;

-- 3. Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
AND column_name IN ('calendar_ends', 'strategy')
ORDER BY column_name;

-- 4. Verificar que existe al menos un proyecto (para debugging)
SELECT COUNT(*) as total_projects FROM public.projects;

-- 5. Mostrar un proyecto de ejemplo para verificar estructura
SELECT id, name, type, calendar_ends, strategy 
FROM public.projects 
LIMIT 1;

-- 6. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'projects';

-- 7. Comentarios en las columnas
COMMENT ON COLUMN public.projects.calendar_ends IS 'Fecha de finalización de la estrategia del calendario para proyectos recurrentes';
COMMENT ON COLUMN public.projects.strategy IS 'Enlace a la estrategia del proyecto (URL)';

-- 8. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_projects_calendar_ends 
ON public.projects(calendar_ends) 
WHERE calendar_ends IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_strategy 
ON public.projects(strategy) 
WHERE strategy IS NOT NULL;
