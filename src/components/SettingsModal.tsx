import React from 'react';
import { X, LogOut, User, Shield, Bell, Palette } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

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
  if (!isOpen) return null;

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
