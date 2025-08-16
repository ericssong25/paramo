import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';
import { ContentItem, SupabaseContentItem, TaskFile } from '../types';
import { convertSupabaseContentToContent } from '../utils/typeConverters';

export const useContent = () => {
  const { supabase } = useSupabase();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Obtener todos los elementos de contenido
  const fetchContentItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const convertedContent = data.map(convertSupabaseContentToContent);
      setContentItems(convertedContent);
    } catch (err) {
      console.error('Error fetching content items:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar contenido');
    } finally {
      setLoading(false);
    }
  };

  // Obtener contenido por proyecto
  const fetchContentByProject = async (projectId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const convertedContent = data.map(convertSupabaseContentToContent);
      return convertedContent;
    } catch (err) {
      console.error('Error fetching content by project:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar contenido del proyecto');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo elemento de contenido
  const createContentItem = async (contentData: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const supabaseContent: Omit<SupabaseContentItem, 'id' | 'created_at' | 'updated_at'> = {
        title: contentData.title,
        description: contentData.description,
        publish_date: contentData.publish_date ? contentData.publish_date.toISOString().split('T')[0] : undefined,
        content_type: contentData.content_type,
        platforms: contentData.platforms,
        categories: contentData.categories,
        copy_text: contentData.copy_text,
        media_files: contentData.media_files,
        project_id: contentData.project_id,
        created_by: user?.id,
        status: contentData.status
      };

      const { data, error } = await supabase
        .from('content_items')
        .insert(supabaseContent)
        .select()
        .single();

      if (error) throw error;

      const newContent = convertSupabaseContentToContent(data);
      setContentItems(prev => [newContent, ...prev]);
      
      return newContent;
    } catch (err) {
      console.error('Error creating content item:', err);
      setError(err instanceof Error ? err.message : 'Error al crear contenido');
      throw err;
    }
  };

  // Actualizar elemento de contenido
  const updateContentItem = async (id: string, updates: Partial<ContentItem>) => {
    try {
      const updateData: any = { ...updates };
      
      // Convertir fecha si existe
      if (updates.publish_date) {
        updateData.publish_date = updates.publish_date.toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('content_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedContent = convertSupabaseContentToContent(data);
      setContentItems(prev => 
        prev.map(item => item.id === id ? updatedContent : item)
      );
      
      return updatedContent;
    } catch (err) {
      console.error('Error updating content item:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar contenido');
      throw err;
    }
  };

  // Eliminar elemento de contenido
  const deleteContentItem = async (id: string) => {
    try {
      // 1. Primero obtener el contenido para acceder a los archivos
      const { data: contentData, error: fetchError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Eliminar archivos del storage si existen
      if (contentData.media_files && contentData.media_files.length > 0) {
        console.log('🗑️ Eliminando archivos asociados al contenido:', contentData.media_files.length);
        
        // Extraer las rutas de los archivos
        const filePaths = contentData.media_files
          .filter((file: any) => file.path) // Solo archivos con path
          .map((file: any) => file.path);

        if (filePaths.length > 0) {
          console.log('🗂️ Rutas de archivos a eliminar:', filePaths);
          
          const { error: storageError } = await supabase.storage
            .from('task-files')
            .remove(filePaths);

          if (storageError) {
            console.error('❌ Error al eliminar archivos del storage:', storageError);
            // No lanzar error aquí, continuar con la eliminación del contenido
          } else {
            console.log('✅ Archivos eliminados del storage exitosamente');
          }
        }
      }

      // 3. Eliminar el registro de la base de datos
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 4. Actualizar estado local
      setContentItems(prev => prev.filter(item => item.id !== id));
      
      console.log('✅ Contenido eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting content item:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar contenido');
      throw err;
    }
  };

  // Convertir tarea a contenido
  const convertTaskToContent = async (
    taskId: string, 
    contentData: {
      content_type: ContentItem['content_type'];
      platforms: ContentItem['platforms'];
      categories: ContentItem['categories'];
      copy_text?: string;
      publish_date?: Date;
    }
  ) => {
    try {
      // 1. Obtener la tarea
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;

      // 2. Crear el contenido
      const { data: { user } } = await supabase.auth.getUser();
      
      const newContent: Omit<SupabaseContentItem, 'id' | 'created_at' | 'updated_at'> = {
        title: taskData.title,
        description: taskData.description,
        publish_date: contentData.publish_date ? contentData.publish_date.toISOString().split('T')[0] : undefined,
        content_type: contentData.content_type,
        platforms: contentData.platforms,
        categories: contentData.categories,
        copy_text: contentData.copy_text,
        media_files: taskData.completed_files || [],
        project_id: taskData.project_id,
        created_by: user?.id,
        status: contentData.publish_date ? 'scheduled' : 'draft'
      };

      const { data: createdContent, error: contentError } = await supabase
        .from('content_items')
        .insert(newContent)
        .select()
        .single();

      if (contentError) throw contentError;

      // 3. Eliminar la tarea
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (deleteError) throw deleteError;

      // 4. Actualizar estado local
      const newContentItem = convertSupabaseContentToContent(createdContent);
      setContentItems(prev => [newContentItem, ...prev]);

      return newContentItem;
    } catch (err) {
      console.error('Error converting task to content:', err);
      setError(err instanceof Error ? err.message : 'Error al convertir tarea a contenido');
      throw err;
    }
  };

  // Archivar tarea (sin convertir a contenido)
  const archiveTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'archived' })
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error('Error archiving task:', err);
      setError(err instanceof Error ? err.message : 'Error al archivar tarea');
      throw err;
    }
  };

  // Marcar contenido como publicado
  const markAsPublished = async (contentId: string) => {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .update({ status: 'published' })
        .eq('id', contentId)
        .select()
        .single();

      if (error) throw error;

      const updatedContent = convertSupabaseContentToContent(data);
      setContentItems(prev => 
        prev.map(item => item.id === contentId ? updatedContent : item)
      );

      return updatedContent;
    } catch (err) {
      console.error('Error marking content as published:', err);
      setError(err instanceof Error ? err.message : 'Error al marcar como publicado');
      throw err;
    }
  };

  // Cargar contenido al inicializar
  useEffect(() => {
    fetchContentItems();
  }, []);

  return {
    contentItems,
    loading,
    error,
    fetchContentItems,
    fetchContentByProject,
    createContentItem,
    updateContentItem,
    deleteContentItem,
    convertTaskToContent,
    archiveTask,
    markAsPublished,
    clearError: () => setError(null)
  };
};
