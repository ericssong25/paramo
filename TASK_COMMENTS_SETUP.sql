-- Script para crear la tabla task_comments en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear la tabla task_comments
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_author_id ON public.task_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON public.task_comments(created_at);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas RLS
-- Política para lectura: todos los usuarios autenticados pueden ver comentarios de tareas
CREATE POLICY "Users can view task comments" ON public.task_comments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserción: usuarios autenticados pueden crear comentarios
CREATE POLICY "Users can create task comments" ON public.task_comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para actualización: solo el autor puede editar sus comentarios
CREATE POLICY "Users can update own comments" ON public.task_comments
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles WHERE id = author_id
        )
    );

-- Política para eliminación: solo el autor puede eliminar sus comentarios
CREATE POLICY "Users can delete own comments" ON public.task_comments
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles WHERE id = author_id
        )
    );

-- 5. Crear trigger para updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS task_comments_set_updated_at ON public.task_comments;
CREATE TRIGGER task_comments_set_updated_at
    BEFORE UPDATE ON public.task_comments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Comentarios para documentación
COMMENT ON TABLE public.task_comments IS 'Comentarios asociados a tareas';
COMMENT ON COLUMN public.task_comments.task_id IS 'ID de la tarea a la que pertenece el comentario';
COMMENT ON COLUMN public.task_comments.author_id IS 'ID del perfil del autor del comentario';
COMMENT ON COLUMN public.task_comments.content IS 'Contenido del comentario';
COMMENT ON COLUMN public.task_comments.created_at IS 'Fecha de creación del comentario';
COMMENT ON COLUMN public.task_comments.updated_at IS 'Fecha de última actualización del comentario';

-- 7. Verificar que la tabla se creó correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'task_comments'
ORDER BY ordinal_position;
