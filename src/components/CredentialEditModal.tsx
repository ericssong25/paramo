import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Key, 
  Eye, 
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

interface CredentialEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credentials: { username: string; password?: string }) => Promise<void>;
  currentCredentials?: { username: string; password?: string } | null;
  serviceName: string;
  loading?: boolean;
}

const CredentialEditModal: React.FC<CredentialEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentCredentials,
  serviceName,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: currentCredentials?.username || '',
        password: currentCredentials?.password || ''
      });
      setErrors({});
    }
  }, [isOpen, currentCredentials]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave({
        username: formData.username.trim(),
        password: formData.password.trim() || undefined
      });

      onClose();
    } catch (error) {
      console.error('Error al guardar credenciales:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Editar Credenciales
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre de Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de Usuario *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="admin, usuario@empresa.com, etc."
              />
              <button
                type="button"
                onClick={() => copyToClipboard(formData.username, 'username')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {copiedField === 'username' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pr-20 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contraseña (opcional)"
              />
              <div className="absolute right-3 top-2.5 flex space-x-1">
                <button
                  type="button"
                  onClick={() => copyToClipboard(formData.password, 'password')}
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
            <p className="mt-1 text-xs text-gray-500">
              Contraseña de acceso (opcional si el método de acceso es diferente)
            </p>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Credenciales'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CredentialEditModal;
