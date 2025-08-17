import React, { useState } from 'react';
import { X, LogOut, User, Shield, Bell, Palette, Key, Lock, Globe, Edit } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { usePinSecurity } from '../hooks/usePinSecurity';
import { useTranslation } from '../hooks/useTranslation';
import ProfileEditModal from './ProfileEditModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SupabaseUser | null;
  onLogout: () => void;
  currentProfile?: {
    id: string;
    name: string;
    avatar?: string;
  };
  onUpdateProfile?: (updates: { name: string; avatar?: string }) => Promise<void>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  currentProfile,
  onUpdateProfile
}) => {
  const { isPinSet, setPin, clearPin } = usePinSecurity();
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const [showPinSection, setShowPinSection] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showReloadOption, setShowReloadOption] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  if (!isOpen) return null;

  const handleSetPin = () => {
    if (newPin.length < 4) {
      setPinError(t('settings.pinError'));
      return;
    }
    if (newPin !== confirmPin) {
      setPinError(t('settings.pinMismatch'));
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
          <h2 className="text-xl font-semibold text-gray-900">{t('settings.title')}</h2>
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
            <div className="flex items-center space-x-3 flex-1">
              {/* Avatar */}
              {currentProfile?.avatar ? (
                <img
                  src={currentProfile.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              )}
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {currentProfile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || t('settings.user')}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            {/* Edit Profile Button */}
            {onUpdateProfile && currentProfile && (
              <button
                onClick={() => setShowProfileEdit(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Editar perfil"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Settings Options */}
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
              <span className="text-sm">{t('settings.notifications')}</span>
            </button>

            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Palette className="w-4 h-4" />
              <span className="text-sm">{t('settings.appearance')}</span>
            </button>

            {/* Language Selection */}
            <div className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4" />
                <span className="text-sm">{t('settings.language')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    changeLanguage('es');
                    setShowReloadOption(true);
                  }}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    currentLanguage === 'es'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Español
                </button>
                <button
                  onClick={() => {
                    changeLanguage('en');
                    setShowReloadOption(true);
                  }}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    currentLanguage === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Opción de recarga */}
            {showReloadOption && (
              <div className="px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 mb-2">
                  {t('common.loading')} - {t('settings.language')} {t('common.update')}d
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      changeLanguage(currentLanguage, true); // Recargar página
                    }}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {t('common.confirm')} & {t('common.reload')}
                  </button>
                  <button
                    onClick={() => setShowReloadOption(false)}
                    className="text-xs bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Shield className="w-4 h-4" />
              <span className="text-sm">{t('settings.privacy')}</span>
            </button>

            {/* PIN de Seguridad */}
            <div className="border-t pt-2">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-3">
                  {isPinSet ? <Lock className="w-4 h-4 text-green-600" /> : <Key className="w-4 h-4 text-gray-500" />}
                  <div>
                    <span className="text-sm font-medium text-gray-700">{t('settings.pinSecurity')}</span>
                    <p className="text-xs text-gray-500">
                      {isPinSet ? t('settings.pinConfigured') : t('settings.pinNotConfigured')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!isPinSet ? (
                    <button
                      onClick={() => setShowPinSection(true)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t('settings.configure')}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowPinSection(true)}
                        className="text-xs bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        {t('settings.change')}
                      </button>
                      <button
                        onClick={handleClearPin}
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors"
                      >
                        {t('settings.remove')}
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
                      {t('settings.newPin')}
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
                      {t('settings.confirmPin')}
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
                      {t('settings.savePin')}
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
                      {t('common.cancel')}
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
              <span className="text-sm font-medium">{t('navigation.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileEdit && currentProfile && onUpdateProfile && (
        <ProfileEditModal
          isOpen={showProfileEdit}
          onClose={() => setShowProfileEdit(false)}
          currentProfile={currentProfile}
          onUpdateProfile={onUpdateProfile}
        />
      )}
    </div>
  );
};

export default SettingsModal;
