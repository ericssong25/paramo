import { useState } from 'react';
import { useSupabase } from './useSupabase';
import { TaskFile } from '../types';

export const useStorage = () => {
  const { supabase } = useSupabase();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, taskId?: string): Promise<TaskFile | null> => {
    setUploading(true);
    setError(null);

    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = taskId ? `${taskId}/${fileName}` : fileName;

      // Subir archivo a Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('task-files')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Obtener información del usuario actual
      const { data: { user } } = await supabase.auth.getUser();

      // Crear URL firmada para el archivo
      const { data: urlData } = await supabase.storage
        .from('task-files')
        .createSignedUrl(filePath, 3600); // URL válida por 1 hora

      const uploadedFile: TaskFile = {
        name: file.name,
        url: urlData.signedUrl,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString(),
        uploaded_by: user?.id || 'unknown',
        path: filePath
      };

      return uploadedFile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir archivo';
      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('task-files')
        .remove([filePath]);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar archivo';
      setError(errorMessage);
      return false;
    }
  };

  const deleteFilesByTask = async (taskId: string): Promise<boolean> => {
    try {
      console.log('🗑️ Iniciando eliminación de archivos para tarea:', taskId);
      
      // Listar todos los archivos en la carpeta de la tarea
      const { data: files, error: listError } = await supabase.storage
        .from('task-files')
        .list(taskId);

      if (listError) {
        console.error('❌ Error al listar archivos:', listError);
        throw new Error(listError.message);
      }

      console.log('📁 Archivos encontrados en la tarea:', files?.length || 0);

      if (!files || files.length === 0) {
        console.log('✅ No hay archivos para eliminar');
        return true; // No hay archivos para eliminar
      }

      // Crear rutas completas para eliminar
      const filePaths = files.map(file => `${taskId}/${file.name}`);
      console.log('🗂️ Rutas de archivos a eliminar:', filePaths);

      // Eliminar todos los archivos de la tarea
      const { error: deleteError } = await supabase.storage
        .from('task-files')
        .remove(filePaths);

      if (deleteError) {
        console.error('❌ Error al eliminar archivos:', deleteError);
        throw new Error(deleteError.message);
      }

      console.log('✅ Archivos eliminados exitosamente');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar archivos de la tarea';
      console.error('❌ Error en deleteFilesByTask:', err);
      setError(errorMessage);
      return false;
    }
  };

  const getFileUrl = async (filePath: string): Promise<string> => {
    try {
      // Para buckets privados, crear una URL firmada
      const { data, error } = await supabase.storage
        .from('task-files')
        .createSignedUrl(filePath, 3600); // URL válida por 1 hora
      
      if (error) {
        throw error;
      }
      
      return data.signedUrl;
    } catch (err) {
      console.error('Error getting signed URL:', err);
      throw err;
    }
  };

  const downloadFile = async (filePath: string, fileName: string): Promise<boolean> => {
    try {
      // Descargar el archivo directamente
      const { data, error } = await supabase.storage
        .from('task-files')
        .download(filePath);
      
      if (error) {
        throw error;
      }
      
      // Crear URL del blob y descargar
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      console.error('Error downloading file:', err);
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    deleteFilesByTask,
    getFileUrl,
    downloadFile,
    uploading,
    error,
    clearError: () => setError(null)
  };
};
