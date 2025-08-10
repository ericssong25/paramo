import React, { useState } from 'react';
import { X, LogOut, User, Shield, Bell, Palette, Key, Lock } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { usePinSecurity } from '../hooks/usePinSecurity';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SupabaseUser | null;
  onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout
}) => {
  const { isPinSet, setPin, clearPin } = usePinSecurity();
  const [showPinSection, setShowPinSection] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handleSetPin = () => {
    if (newPin.length < 4) {
      setPinError('El PIN debe tener al menos 4 dígitos');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('Los PINs no coinciden');
      return;
    }
    
    setPin(newPin);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    setShowPinSection(false);
  };

  const handleClearPin = () => {
    clearPin();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Configuración</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Settings Options */}
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
              <span className="text-sm">Notificaciones</span>
            </button>

            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Palette className="w-4 h-4" />
              <span className="text-sm">Apariencia</span>
            </button>

            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Privacidad</span>
            </button>

            {/* PIN de Seguridad */}
            <div className="border-t pt-2">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-3">
                  {isPinSet ? <Lock className="w-4 h-4 text-green-600" /> : <Key className="w-4 h-4 text-gray-500" />}
                  <div>
                    <span className="text-sm font-medium text-gray-700">PIN de Seguridad</span>
                    <p className="text-xs text-gray-500">
                      {isPinSet ? 'PIN configurado' : 'Sin PIN configurado'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!isPinSet ? (
                    <button
                      onClick={() => setShowPinSection(true)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Configurar
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowPinSection(true)}
                        className="text-xs bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Cambiar
                      </button>
                      <button
                        onClick={handleClearPin}
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Sección para configurar PIN */}
              {showPinSection && (
                <div className="px-4 py-3 bg-gray-50 rounded-lg space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nuevo PIN (mínimo 4 dígitos)
                    </label>
                    <input
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1234"
                      maxLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Confirmar PIN
                    </label>
                    <input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1234"
                      maxLength={8}
                    />
                  </div>
                  {pinError && (
                    <p className="text-xs text-red-600">{pinError}</p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSetPin}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Guardar PIN
                    </button>
                    <button
                      onClick={() => {
                        setShowPinSection(false);
                        setNewPin('');
                        setConfirmPin('');
                        setPinError('');
                      }}
                      className="text-xs bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
