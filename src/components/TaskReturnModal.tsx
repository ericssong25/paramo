import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

interface TaskReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment?: string) => void;
  taskTitle: string;
}

const TaskReturnModal: React.FC<TaskReturnModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
}) => {
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    const trimmedComment = comment.trim();
    onConfirm(trimmedComment || undefined);
    setComment(''); // Reset comment
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Devolver Tarea</h3>
              <p className="text-sm text-gray-500">Agregar observaciones (opcional)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tarea a devolver:</h4>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
              {taskTitle}
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones de revisión
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe los cambios necesarios, problemas encontrados, o cualquier observación para el equipo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter para salto de línea • Ctrl+Enter para enviar
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Devolver Tarea</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskReturnModal;
