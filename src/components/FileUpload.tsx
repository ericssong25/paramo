import React, { useState, useCallback } from 'react';
import { Upload, X, File, Image, Video, FileText, AlertCircle } from 'lucide-react';
import { TaskFile } from '../types';
import { useStorage } from '../hooks/useStorage';

interface FileUploadProps {
  onFilesUploaded: (files: TaskFile[]) => void;
  existingFiles?: TaskFile[];
  maxFiles?: number;
  maxFileSize?: number; // en bytes
  acceptedTypes?: string[];
  className?: string;
  taskId?: string; // ID de la tarea para organizar archivos en Storage
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  existingFiles = [],
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB por defecto (límite del plan gratuito de Supabase)
  acceptedTypes = ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  className = '',
  taskId
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { uploadFile, deleteFile, uploading: storageUploading, error: storageError, clearError } = useStorage();
  const [error, setError] = useState<string | null>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const renderFilePreview = (file: TaskFile) => {
    return (
      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        {getFileIcon(file.type)}
      </div>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Verificar tamaño
    if (file.size > maxFileSize) {
      return `El archivo ${file.name} es demasiado grande. Máximo ${formatFileSize(maxFileSize)}`;
    }

    // Verificar tipo
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `El archivo ${file.name} no es un tipo válido`;
    }

    return null;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    setError(null);
    clearError();

    try {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      // Validar archivos
      fileArray.forEach(file => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        setError(errors.join('\n'));
        return;
      }

      if (validFiles.length === 0) {
        return;
      }

      // Crear archivos locales (sin subir a Supabase Storage aún)
      const localFiles: TaskFile[] = [];
      
      for (const file of validFiles) {
        const localFile: TaskFile = {
          name: file.name,
          url: URL.createObjectURL(file), // URL local temporal
          size: file.size,
          type: file.type,
          uploaded_at: new Date().toISOString(),
          uploaded_by: 'local', // Marcador para identificar archivos locales
          path: null, // No hay path en Supabase Storage aún
          file: file // Guardar la referencia al archivo original
        };
        localFiles.push(localFile);
      }

      if (localFiles.length > 0) {
        onFilesUploaded([...existingFiles, ...localFiles]);
      }
    } catch (err) {
      setError('Error al procesar archivos. Inténtalo de nuevo.');
    }
  }, [existingFiles, maxFileSize, acceptedTypes, onFilesUploaded, clearError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);



  const removeFile = async (index: number) => {
    const fileToRemove = existingFiles[index];
    
    // Si el archivo tiene path, eliminarlo de Supabase Storage
    if (fileToRemove.path) {
      const success = await deleteFile(fileToRemove.path);
      if (!success) {
        setError('Error al eliminar archivo del servidor');
        return;
      }
    }
    
    // Si es un archivo local, revocar la URL del objeto
    if (fileToRemove.uploaded_by === 'local' && fileToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    
    const newFiles = existingFiles.filter((_, i) => i !== index);
    onFilesUploaded(newFiles);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de subida */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Arrastra archivos aquí o{' '}
          <label className="text-blue-600 hover:text-blue-800 cursor-pointer">
            selecciona archivos
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
              disabled={storageUploading}
            />
          </label>
        </p>
                 <p className="text-xs text-gray-500">
           Máximo {maxFiles} archivos, {formatFileSize(maxFileSize)} cada uno
         </p>
         <p className="text-xs text-blue-600 mt-1">
           Los archivos se guardarán localmente y se subirán al servidor cuando envíes la tarea a revisión
         </p>
        {storageUploading && (
          <div className="mt-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-xs text-gray-500 mt-1">Subiendo archivos...</p>
          </div>
        )}
      </div>

      {/* Error */}
      {(error || storageError) && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-600">{error || storageError}</p>
        </div>
      )}

      {/* Archivos existentes */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Archivos subidos:</h4>
          <div className="space-y-2">
                         {existingFiles.map((file, index) => (
               <div
                 key={index}
                 className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
               >
                 <div className="flex items-center space-x-3 flex-1">
                   {renderFilePreview(file)}
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center space-x-2">
                       <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                       {file.uploaded_by === 'local' && (
                         <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                           Local
                         </span>
                       )}
                     </div>
                     <p className="text-xs text-gray-500">
                       {formatFileSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                     </p>
                   </div>
                 </div>
                 <button
                   onClick={() => removeFile(index)}
                   className="p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                   title="Eliminar archivo"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
     );
 };

 
 
 export default FileUpload;
