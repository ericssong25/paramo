-- Script para configurar Supabase Storage con límites aumentados
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Eliminar el bucket existente si existe (para recrearlo con nueva configuración)
DELETE FROM storage.buckets WHERE id = 'task-files';

-- 2. Crear el bucket principal para archivos de tareas con límites aumentados
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
);

-- 3. Crear políticas RLS para el bucket task-files

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

-- 4. Verificar la configuración
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'task-files';
