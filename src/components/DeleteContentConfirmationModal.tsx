import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { ContentItem } from '../types';

interface DeleteContentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItem | null;
  onConfirm: (contentId: string) => Promise<void>;
}

const DeleteContentConfirmationModal: React.FC<DeleteContentConfirmationModalProps> = ({
  isOpen,
  onClose,
  content,
  onConfirm
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!isOpen || !content) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(content.id);
      onClose();
    } catch (error) {
      console.error('Error deleting content:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Eliminar Contenido
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            ¿Estás seguro de que quieres eliminar el contenido <strong>"{content.title}"</strong>?
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  Esta acción no se puede deshacer
                </h3>
                <p className="text-sm text-red-700">
                  El contenido y todos sus archivos asociados serán eliminados permanentemente.
                </p>
              </div>
            </div>
          </div>

          {/* Información del contenido */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Detalles del contenido:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Título:</span> {content.title}</p>
              <p><span className="font-medium">Tipo:</span> {content.content_type}</p>
              <p><span className="font-medium">Plataformas:</span> {content.platforms.join(', ')}</p>
              {content.media_files && content.media_files.length > 0 && (
                <p><span className="font-medium">Archivos:</span> {content.media_files.length} archivo(s)</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteContentConfirmationModal;
