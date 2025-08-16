-- Script para verificar y corregir la configuración de Supabase Storage
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Verificar la configuración actual del bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'task-files';

-- 2. Si el bucket no existe, crearlo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-files',
  'task-files',
  false, -- bucket privado
  52428800, -- 50MB en bytes (límite del plan gratuito de Supabase)
  ARRAY[
    'image/*', 
    'video/*', 
    'application/pdf', 
    'text/*', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 3. Eliminar políticas existentes para recrearlas
DROP POLICY IF EXISTS "Users can upload task files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view task files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update task files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete task files" ON storage.objects;

-- 4. Crear políticas RLS para el bucket task-files (bucket privado)

-- Política para permitir a usuarios autenticados subir archivos
CREATE POLICY "Users can upload task files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'task-files'
  AND auth.role() = 'authenticated'
);

-- Política para permitir a usuarios autenticados ver archivos
CREATE POLICY "Users can view task files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'task-files'
  AND auth.role() = 'authenticated'
);

-- Política para permitir a usuarios autenticados actualizar sus archivos
CREATE POLICY "Users can update task files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'task-files'
  AND auth.role() = 'authenticated'
);

-- Política para permitir a usuarios autenticados eliminar sus archivos
CREATE POLICY "Users can delete task files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'task-files'
  AND auth.role() = 'authenticated'
);

-- 5. Verificar la configuración final
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'task-files';

-- 6. Verificar las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
