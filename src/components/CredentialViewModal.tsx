import React, { useState } from 'react';
import {
  X,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  Edit
} from 'lucide-react';

interface CredentialViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: { username: string; password?: string } | null;
  serviceName: string;
  onEdit?: () => void;
}

const CredentialViewModal: React.FC<CredentialViewModalProps> = ({
  isOpen,
  onClose,
  credentials,
  serviceName,
  onEdit
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);



  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Key className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Credenciales de Acceso
              </h2>
              <p className="text-sm text-gray-500">
                {serviceName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {credentials ? (
            <>
              {/* Nombre de Usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={credentials.username}
                    readOnly
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(credentials.username, 'username')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {copiedField === 'username' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Contraseña */}
              {credentials.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      readOnly
                      className="w-full pr-20 pl-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <div className="absolute right-3 top-2.5 flex space-x-1">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(credentials.password!, 'password')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {copiedField === 'password' ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!credentials.password && (
                <div className="text-center py-4">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No hay contraseña configurada para esta suscripción
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No hay credenciales configuradas para esta suscripción
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          {credentials && onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CredentialViewModal;
