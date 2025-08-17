-- Script para agregar columna archived_at a la tabla tasks
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Agregar la columna archived_at
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- 2. Actualizar las tareas que ya están archivadas con la fecha de hoy
UPDATE tasks 
SET archived_at = NOW() 
WHERE status = 'archived' 
AND archived_at IS NULL;

-- 3. Crear un trigger para actualizar archived_at cuando se cambia el status a 'archived'
CREATE OR REPLACE FUNCTION update_archived_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el status cambió a 'archived', establecer archived_at
  IF NEW.status = 'archived' AND (OLD.status IS NULL OR OLD.status != 'archived') THEN
    NEW.archived_at = NOW();
  END IF;
  
  -- Si el status cambió de 'archived' a otro, limpiar archived_at
  IF OLD.status = 'archived' AND NEW.status != 'archived' THEN
    NEW.archived_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger si no existe
DROP TRIGGER IF EXISTS trigger_update_archived_at_timestamp ON tasks;
CREATE TRIGGER trigger_update_archived_at_timestamp
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_archived_at_timestamp();

-- 4. Verificar que la columna se agregó correctamente
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name = 'archived_at';

-- 5. Verificar las tareas archivadas actuales
SELECT 
  id,
  title,
  status,
  archived_at,
  updated_at
FROM tasks 
WHERE status = 'archived'
ORDER BY archived_at DESC;

-- 6. Mostrar el resultado final
SELECT 
  'Columna archived_at agregada exitosamente' as status,
  'Las tareas archivadas ahora tienen fecha de archivo' as message;
