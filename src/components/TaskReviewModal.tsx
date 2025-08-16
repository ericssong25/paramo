import React, { useState } from 'react';
import { X, Upload, Eye, CheckCircle } from 'lucide-react';
import { Task, TaskFile } from '../types';
import FileUpload from './FileUpload';
import { useStorage } from '../hooks/useStorage';

interface TaskReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onMarkForReview: (taskId: string, files: TaskFile[], notes?: string) => void;
}

const TaskReviewModal: React.FC<TaskReviewModalProps> = ({
  isOpen,
  onClose,
  task,
  onMarkForReview,
}) => {
  const [files, setFiles] = useState<TaskFile[]>(task.completedFiles || []);
  const [notes, setNotes] = useState(task.reviewNotes || '');
  const [submitting, setSubmitting] = useState(false);
  const { uploadFile } = useStorage();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Subir archivos locales a Supabase Storage antes de marcar para review
      const uploadedFiles: TaskFile[] = [];
      
      for (const file of files) {
        if (file.uploaded_by === 'local' && file.file) {
          // Subir archivo local a Supabase Storage
          const uploadedFile = await uploadFile(file.file, task.id);
          if (uploadedFile) {
            uploadedFiles.push(uploadedFile);
          }
        } else {
          // Archivo ya subido, mantenerlo
          uploadedFiles.push(file);
        }
      }
      
      await onMarkForReview(task.id, uploadedFiles, notes);
      onClose();
    } catch (error) {
      console.error('Error marking task for review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilesUploaded = (newFiles: TaskFile[]) => {
    setFiles(newFiles);
  };

  // Limpiar URLs de objetos cuando se cierre el modal
  const cleanupLocalFiles = () => {
    files.forEach(file => {
      if (file.uploaded_by === 'local' && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });
  };

  // Limpiar archivos locales cuando se cierre el modal
  React.useEffect(() => {
    return () => {
      if (!isOpen) {
        cleanupLocalFiles();
      }
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Marcar para revisión
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Task Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>Prioridad: {task.priority}</span>
                {task.assignee && (
                  <span>Asignado: {task.assignee.name}</span>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Upload className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Archivos completados (opcional)</h4>
              </div>
                             <p className="text-sm text-gray-600 mb-4">
                 Sube los archivos relacionados con esta tarea para que el equipo pueda revisarlos. 
                 Los archivos se subirán al servidor al confirmar.
               </p>
              <FileUpload
                onFilesUploaded={handleFilesUploaded}
                existingFiles={files}
                maxFiles={10}
                                 maxFileSize={50 * 1024 * 1024} // 50MB (límite del plan gratuito de Supabase)
                taskId={task.id}
                acceptedTypes={[
                  'image/*',
                  'video/*',
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'text/plain'
                ]}
              />
            </div>

            {/* Review Notes */}
            <div>
              <label htmlFor="review-notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notas de revisión (opcional)
              </label>
              <textarea
                id="review-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agrega notas adicionales para la revisión..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Resumen de la acción</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Al confirmar, esta tarea será marcada como "En revisión" y estará disponible 
                    para que el equipo revise los archivos y notas proporcionados.
                  </p>
                  {files.length > 0 && (
                    <p className="text-sm text-blue-700 mt-2">
                      📎 {files.length} archivo{files.length > 1 ? 's' : ''} listo{files.length > 1 ? 's' : ''} para revisión
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Marcar para revisión</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskReviewModal;
