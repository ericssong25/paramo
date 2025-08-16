-- Script para crear la tabla de contenido
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear tipos ENUM para las opciones
CREATE TYPE content_type AS ENUM (
  'reel',
  'carousel', 
  'story',
  'static',
  'video',
  'image'
);

CREATE TYPE platform_type AS ENUM (
  'instagram',
  'facebook',
  'youtube',
  'tiktok',
  'twitter',
  'linkedin'
);

-- 2. Crear tipo task_status si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM (
      'todo',
      'in-progress', 
      'corrections',
      'review',
      'done',
      'archived'
    );
  END IF;
END $$;

-- 3. Crear tabla de contenido
CREATE TABLE content_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  publish_date DATE,
  content_type content_type NOT NULL,
  platforms platform_type[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  copy_text TEXT,
  media_files JSONB DEFAULT '[]',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived'))
);

-- 4. Crear índices para mejor rendimiento
CREATE INDEX idx_content_items_project_id ON content_items(project_id);
CREATE INDEX idx_content_items_publish_date ON content_items(publish_date);
CREATE INDEX idx_content_items_content_type ON content_items(content_type);
CREATE INDEX idx_content_items_platforms ON content_items USING GIN(platforms);
CREATE INDEX idx_content_items_categories ON content_items USING GIN(categories);
CREATE INDEX idx_content_items_status ON content_items(status);
CREATE INDEX idx_content_items_created_by ON content_items(created_by);

-- 5. Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_items_updated_at 
  BEFORE UPDATE ON content_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Configurar RLS (Row Level Security)
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Política para permitir a usuarios autenticados ver contenido
CREATE POLICY "Users can view content items" ON content_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir a usuarios autenticados crear contenido
CREATE POLICY "Users can create content items" ON content_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir a usuarios autenticados actualizar contenido
CREATE POLICY "Users can update content items" ON content_items
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir a usuarios autenticados eliminar contenido
CREATE POLICY "Users can delete content items" ON content_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Agregar comentarios para documentación
COMMENT ON TABLE content_items IS 'Tabla para almacenar elementos de contenido creados desde tareas';
COMMENT ON COLUMN content_items.title IS 'Título del contenido (tomado de la tarea)';
COMMENT ON COLUMN content_items.description IS 'Descripción del contenido';
COMMENT ON COLUMN content_items.publish_date IS 'Fecha programada para publicación';
COMMENT ON COLUMN content_items.content_type IS 'Tipo de contenido (reel, carousel, story, etc.)';
COMMENT ON COLUMN content_items.platforms IS 'Plataformas donde se publicará';
COMMENT ON COLUMN content_items.categories IS 'Categorías del contenido (puede ser múltiple)';
COMMENT ON COLUMN content_items.copy_text IS 'Texto de la publicación con hashtags';
COMMENT ON COLUMN content_items.media_files IS 'Archivos multimedia en formato JSONB';
COMMENT ON COLUMN content_items.project_id IS 'ID del proyecto asociado';
COMMENT ON COLUMN content_items.status IS 'Estado del contenido (draft, scheduled, published, archived)';

-- 8. Agregar estado 'archived' a la tabla de tareas (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'archived' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
    ALTER TYPE task_status ADD VALUE 'archived';
  END IF;
END $$;

-- 9. Verificar la creación
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'content_items'
ORDER BY ordinal_position;
