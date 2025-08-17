-- Script para arreglar el status 'archived' en la tabla tasks
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Verificar si el tipo task_status existe y agregar 'archived' si no está
DO $$ 
BEGIN
    -- Verificar si el tipo task_status existe
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        -- Verificar si 'archived' ya existe en el ENUM
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'archived' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
            ALTER TYPE task_status ADD VALUE 'archived';
            RAISE NOTICE 'Status "archived" agregado al ENUM task_status';
        ELSE
            RAISE NOTICE 'Status "archived" ya existe en el ENUM task_status';
        END IF;
    ELSE
        -- Crear el tipo task_status si no existe
        CREATE TYPE task_status AS ENUM (
            'todo',
            'in-progress', 
            'corrections',
            'review',
            'done',
            'archived'
        );
        RAISE NOTICE 'Tipo task_status creado con todos los valores incluyendo "archived"';
    END IF;
END $$;

-- 2. Verificar la estructura actual de la tabla tasks
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name = 'status';

-- 3. Mostrar las restricciones actuales de la tabla tasks
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'tasks'::regclass;

-- 4. Si hay una restricción check que no incluye 'archived', la eliminamos y recreamos
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Buscar la restricción check del status
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'tasks'::regclass 
    AND contype = 'c' 
    AND pg_get_constraintdef(oid) LIKE '%status%';
    
    -- Si existe una restricción, la eliminamos
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE tasks DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Restricción % eliminada', constraint_name;
    END IF;
    
    -- Agregar nueva restricción que incluya 'archived'
    ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
    CHECK (status::text IN ('todo', 'in-progress', 'corrections', 'review', 'done', 'archived'));
    
    RAISE NOTICE 'Nueva restricción tasks_status_check creada con todos los status incluyendo "archived"';
END $$;

-- 5. Verificar que todo funciona correctamente
SELECT 
    'task_status ENUM values:' as info,
    unnest(enum_range(NULL::task_status)) as enum_values;

-- 6. Probar insertar una tarea con status 'archived' (solo para verificar)
-- INSERT INTO tasks (title, description, status, priority, project_id, created_by) 
-- VALUES ('Test Archived Task', 'This is a test task', 'archived', 'normal', NULL, auth.uid())
-- ON CONFLICT DO NOTHING;

-- 7. Mostrar el resultado final
SELECT 
    'Verificación completada' as status,
    'El status "archived" ahora debería funcionar correctamente' as message;
