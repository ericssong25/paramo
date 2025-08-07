import React from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  // Mock notifications - en el futuro esto vendría de Supabase
  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'Nueva tarea asignada',
      message: 'Se te ha asignado la tarea "Diseñar landing page"',
      time: 'Hace 5 minutos',
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: 'Proyecto completado',
      message: 'El proyecto "Rediseño web" ha sido marcado como completado',
      time: 'Hace 1 hora',
      read: true
    },
    {
      id: 3,
      type: 'warning',
      title: 'Fecha límite próxima',
      message: 'La tarea "Revisar contenido" vence mañana',
      time: 'Hace 2 horas',
      read: false
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No hay notificaciones</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
            Marcar todas como leídas
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
