import React, { useState, useEffect } from 'react';
import { X, Upload, User, Save, AlertCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useStorage } from '../hooks/useStorage';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    id: string;
    name: string;
    avatar?: string;
  };
  onUpdateProfile: (updates: { name: string; avatar?: string }) => Promise<void>;
  isLoading?: boolean;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onUpdateProfile,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const { uploadFile, deleteFile } = useStorage();
  
  const [name, setName] = useState(currentProfile.name);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentProfile.avatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens/closes or profile changes
  useEffect(() => {
    if (isOpen) {
      setName(currentProfile.name);
      setAvatarPreview(currentProfile.avatar || null);
      setAvatar(null);
      setError('');
    }
  }, [isOpen, currentProfile]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona una imagen válida');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }

      setAvatar(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    setError('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let avatarUrl = currentProfile.avatar;

      // Upload new avatar if selected
      if (avatar) {
        setIsUploading(true);
        const fileName = `${currentProfile.id}/${Date.now()}_${avatar.name}`;
        const uploadedUrl = await uploadFile('avatars', fileName, avatar);
        avatarUrl = uploadedUrl;

        // Delete old avatar if exists
        if (currentProfile.avatar) {
          try {
            // Extract file path from URL for deletion
            const urlParts = currentProfile.avatar.split('/');
            const filePath = urlParts.slice(-2).join('/'); // Get last two parts: userId/filename
            await deleteFile('avatars', filePath);
          } catch (e) {
            console.warn('Could not delete old avatar:', e);
          }
        }
        setIsUploading(false);
      }

      await onUpdateProfile({
        name: name.trim(),
        avatar: avatarUrl
      });

      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Editar Perfil</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Avatar Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Foto de Perfil
            </label>
            
            {/* Avatar Preview - Centered */}
            <div className="flex justify-center">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-gray-100 shadow-lg">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Upload Controls - Vertical */}
            <div className="space-y-3">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isSaving}
                />
                <div className="flex items-center justify-center space-x-2 px-4 py-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium">
                  <Upload className="w-4 h-4" />
                  <span>Subir imagen</span>
                </div>
              </label>

              {avatarPreview && (
                <button
                  onClick={handleRemoveAvatar}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4" />
                  <span>Eliminar foto</span>
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              JPG, PNG, GIF • Máximo 5MB
            </p>
          </div>

          {/* Name Section */}
          <div className="space-y-3">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-sm"
              placeholder="Tu nombre completo"
              disabled={isSaving}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Loading Message */}
          {(isUploading || isSaving) && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
              <p className="text-sm text-blue-600">
                {isUploading ? 'Subiendo imagen...' : 'Guardando cambios...'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading || !name.trim()}
            className="flex items-center space-x-2 px-6 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            <Save className="w-4 h-4" />
            <span>Guardar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
