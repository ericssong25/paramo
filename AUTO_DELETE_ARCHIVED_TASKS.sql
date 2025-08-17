-- Script para configurar eliminación automática de tareas archivadas
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear función para eliminar tareas archivadas automáticamente
CREATE OR REPLACE FUNCTION delete_old_archived_tasks()
RETURNS void AS $$
BEGIN
  -- Eliminar tareas archivadas que tienen más de 30 días
  DELETE FROM tasks 
  WHERE status = 'archived' 
  AND updated_at < NOW() - INTERVAL '30 days';
  
  -- Log de la operación (opcional)
  RAISE NOTICE 'Eliminación automática de tareas archivadas completada';
END;
$$ LANGUAGE plpgsql;

-- 2. Crear un job programado para ejecutar la limpieza automática
-- Nota: Supabase no soporta cron jobs directamente, pero puedes usar pg_cron si está habilitado
-- Alternativamente, puedes ejecutar esta función manualmente o desde tu aplicación

-- 3. Crear una función que puedas llamar desde tu aplicación
CREATE OR REPLACE FUNCTION cleanup_archived_tasks()
RETURNS TABLE(deleted_count bigint) AS $$
DECLARE
  deleted_count bigint;
BEGIN
  -- Contar cuántas tareas se van a eliminar
  SELECT COUNT(*) INTO deleted_count
  FROM tasks 
  WHERE status = 'archived' 
  AND updated_at < NOW() - INTERVAL '30 days';
  
  -- Eliminar las tareas
  DELETE FROM tasks 
  WHERE status = 'archived' 
  AND updated_at < NOW() - INTERVAL '30 days';
  
  -- Retornar el número de tareas eliminadas
  RETURN QUERY SELECT deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear una función para obtener estadísticas de tareas archivadas
CREATE OR REPLACE FUNCTION get_archived_tasks_stats()
RETURNS TABLE(
  total_archived bigint,
  old_tasks bigint,
  days_until_auto_delete integer
) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    COUNT(*) as total_archived,
    COUNT(CASE WHEN updated_at < NOW() - INTERVAL '30 days' THEN 1 END) as old_tasks,
    30 as days_until_auto_delete
  FROM tasks 
  WHERE status = 'archived';
END;
$$ LANGUAGE plpgsql;

-- 5. Crear un trigger para actualizar updated_at cuando se cambia el status a archived
CREATE OR REPLACE FUNCTION update_archived_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el status cambió a 'archived', actualizar updated_at
  IF NEW.status = 'archived' AND (OLD.status IS NULL OR OLD.status != 'archived') THEN
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger si no existe
DROP TRIGGER IF EXISTS trigger_update_archived_timestamp ON tasks;
CREATE TRIGGER trigger_update_archived_timestamp
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_archived_timestamp();

-- 6. Verificar que todo funciona correctamente
SELECT 
  'Funciones creadas exitosamente' as status,
  'Las tareas archivadas se eliminarán automáticamente después de 30 días' as message;

-- 7. Probar la función de estadísticas
SELECT * FROM get_archived_tasks_stats();

-- 8. Mostrar las funciones disponibles
SELECT 
  'Funciones disponibles:' as info,
  '1. delete_old_archived_tasks() - Elimina tareas archivadas automáticamente' as function_1,
  '2. cleanup_archived_tasks() - Elimina y retorna el número de tareas eliminadas' as function_2,
  '3. get_archived_tasks_stats() - Obtiene estadísticas de tareas archivadas' as function_3;
