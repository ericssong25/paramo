import React, { useState, useEffect } from 'react';
import { X, Calendar, Type, Share2, Tag, FileText, Download } from 'lucide-react';
import { ContentItem, ContentType, ContentPlatform } from '../types';

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItem | null;
  onSave: (contentId: string, contentData: {
    content_type: ContentType;
    platforms: ContentPlatform[];
    categories: string[];
    copy_text?: string;
    publish_date?: Date;
    title?: string;
    description?: string;
    status?: ContentItem['status'];
  }) => Promise<void>;
}

const CONTENT_TYPES: { value: ContentType; label: string; icon: React.ReactNode }[] = [
  { value: 'reel', label: 'Reel', icon: <Type className="w-4 h-4" /> },
  { value: 'carousel', label: 'Carrusel', icon: <Type className="w-4 h-4" /> },
  { value: 'story', label: 'Historia', icon: <Type className="w-4 h-4" /> },
  { value: 'static', label: 'Estático', icon: <Type className="w-4 h-4" /> },
  { value: 'video', label: 'Video', icon: <Type className="w-4 h-4" /> },
  { value: 'image', label: 'Imagen', icon: <Type className="w-4 h-4" /> },
];

const PLATFORMS: { value: ContentPlatform; label: string; icon: React.ReactNode }[] = [
  { value: 'instagram', label: 'Instagram', icon: <Share2 className="w-4 h-4" /> },
  { value: 'facebook', label: 'Facebook', icon: <Share2 className="w-4 h-4" /> },
  { value: 'youtube', label: 'YouTube', icon: <Share2 className="w-4 h-4" /> },
  { value: 'tiktok', label: 'TikTok', icon: <Share2 className="w-4 h-4" /> },
  { value: 'twitter', label: 'Twitter', icon: <Share2 className="w-4 h-4" /> },
  { value: 'linkedin', label: 'LinkedIn', icon: <Share2 className="w-4 h-4" /> },
];

const CATEGORIES = [
  'Humor', 'Educativo', 'Ventas', 'Inspiracional', 'Tutorial', 
  'Entretenimiento', 'Noticias', 'Promocional', 'Behind the Scenes',
  'Testimonial', 'Producto', 'Servicio', 'Evento', 'Anuncio'
];

const EditContentModal: React.FC<EditContentModalProps> = ({
  isOpen,
  onClose,
  content,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>('static');
  const [platforms, setPlatforms] = useState<ContentPlatform[]>(['instagram']);
  const [categories, setCategories] = useState<string[]>([]);
  const [copyText, setCopyText] = useState('');
  const [publishDate, setPublishDate] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos del contenido cuando se abre el modal
  useEffect(() => {
    if (isOpen && content) {
      setTitle(content.title);
      setDescription(content.description || '');
      setContentType(content.content_type);
      setPlatforms(content.platforms);
      setCategories(content.categories);
      setCopyText(content.copy_text || '');
      setPublishDate(content.publish_date ? content.publish_date.toISOString().split('T')[0] : '');
    }
  }, [isOpen, content]);

  const handlePlatformToggle = (platform: ContentPlatform) => {
    setPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    if (!title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (platforms.length === 0) {
      alert('Debes seleccionar al menos una plataforma');
      return;
    }

    if (categories.length === 0) {
      alert('Debes seleccionar al menos una categoría');
      return;
    }

    setIsSaving(true);
    try {
      // Determinar el status automáticamente basado en la fecha de publicación
      const hasPublishDate = publishDate && publishDate.trim() !== '';
      const newStatus = hasPublishDate ? 'scheduled' : 'draft';

      await onSave(content.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        content_type: contentType,
        platforms,
        categories,
        copy_text: copyText.trim() || undefined,
        publish_date: publishDate ? new Date(publishDate) : undefined,
        status: newStatus,
      });
      onClose();
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderHashtags = (text: string) => {
    // Dividir por líneas primero
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      // Dividir cada línea por hashtags
      const parts = line.split(/(#\w+)/g);
      const lineParts = parts.map((part, index) => 
        part.startsWith('#') ? (
          <span key={`${lineIndex}-${index}`} className="text-blue-600 font-medium">{part}</span>
        ) : (
          part
        )
      );
      
      return (
        <div key={lineIndex}>
          {lineParts}
          {lineIndex < lines.length - 1 && <br />}
        </div>
      );
    });
  };

  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Editar Contenido
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {content.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Título del contenido"
                required
              />
            </div>

            {/* Fecha de publicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Publicación
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Descripción del contenido"
            />
          </div>

          {/* Configuración en dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-6">
              {/* Tipo de contenido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Contenido *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CONTENT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setContentType(type.value)}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                        contentType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {type.icon}
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              {/* Plataformas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Plataformas *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => handlePlatformToggle(platform.value)}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                        platforms.includes(platform.value)
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {platform.icon}
                      <span className="text-sm font-medium">{platform.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categorías *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                        categories.includes(category)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Tag className="w-4 h-4" />
                      <span className="text-sm font-medium">{category}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Archivos existentes */}
          {content.media_files && content.media_files.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Archivos adjuntos ({content.media_files.length})
              </label>
              <div className="space-y-2">
                {content.media_files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Download className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Copy text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copy de la Publicación
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                value={copyText}
                onChange={(e) => setCopyText(e.target.value)}
                placeholder="Escribe el texto de la publicación... Los hashtags se resaltarán automáticamente (#ejemplo)"
                rows={6}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            {copyText && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                <div className="text-sm">
                  {renderHashtags(copyText)}
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || platforms.length === 0 || categories.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContentModal;
