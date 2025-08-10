import React, { useState, useEffect } from 'react';
import { X, Lock, Eye, EyeOff, Key } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => boolean;
  onSetPin?: (pin: string) => void;
  isSettingPin?: boolean;
}

const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  onSetPin,
  isSettingPin = false
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setConfirmPin('');
      setError('');
      setShowPin(false);
      setShowConfirmPin(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSettingPin && onSetPin) {
        if (pin.length < 4) {
          setError('El PIN debe tener al menos 4 dígitos');
          return;
        }
        if (pin !== confirmPin) {
          setError('Los PINs no coinciden');
          return;
        }
        onSetPin(pin);
        onClose();
      } else {
        const isValid = onVerify(pin);
        if (isValid) {
          onClose();
        } else {
          setError('PIN incorrecto');
          setPin('');
        }
      }
    } catch (error) {
      setError('Error al verificar el PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
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
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isSettingPin ? 'Configurar PIN de Seguridad' : 'Verificar PIN'}
              </h2>
              <p className="text-sm text-gray-500">
                {isSettingPin 
                  ? 'Establece un PIN para proteger las credenciales' 
                  : 'Ingresa tu PIN para ver las credenciales'
                }
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
          {/* PIN Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PIN de Seguridad
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                placeholder="••••"
                maxLength={6}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {isSettingPin ? 'Mínimo 4 dígitos' : 'Ingresa tu PIN de 4-6 dígitos'}
            </p>
          </div>

          {/* Confirm PIN (solo para configurar) */}
          {isSettingPin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar PIN
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPin ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                  placeholder="••••"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Security Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Seguridad</h4>
                <p className="text-xs text-blue-700 mt-1">
                  {isSettingPin 
                    ? 'Este PIN protegerá el acceso a todas las credenciales de suscripciones. Guárdalo en un lugar seguro.'
                    : 'Las credenciales están protegidas por tu PIN de seguridad.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || pin.length < 4 || (isSettingPin && pin !== confirmPin)}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isLoading 
                  ? 'Verificando...' 
                  : isSettingPin 
                    ? 'Configurar PIN' 
                    : 'Verificar'
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinModal;
