import React from 'react';
import { X, Calendar, Type, Share2, Tag, FileText, Download, Edit, Trash2, Copy, Check } from 'lucide-react';
import { ContentItem, TaskFile } from '../types';

interface ContentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItem | null;
  onEdit?: (content: ContentItem) => void;
  onDelete?: (content: ContentItem) => void;
  onDownloadFile?: (file: TaskFile) => void;
  onDownloadAllFiles?: (files: TaskFile[]) => void;
  onMarkAsPublished?: (contentId: string) => void;
}

const ContentViewModal: React.FC<ContentViewModalProps> = ({
  isOpen,
  onClose,
  content,
  onEdit,
  onDelete,
  onDownloadFile,
  onDownloadAllFiles,
  onMarkAsPublished
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !content) return null;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(content.copy_text || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar texto:', err);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'published': return 'bg-green-100 text-green-700 border-green-200';
      case 'archived': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'scheduled': return 'Programado';
      case 'published': return 'Publicado';
      case 'archived': return 'Archivado';
      default: return status;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'reel': return 'Reel';
      case 'carousel': return 'Carrusel';
      case 'story': return 'Historia';
      case 'static': return 'Estático';
      case 'video': return 'Video';
      case 'image': return 'Imagen';
      default: return type;
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'Instagram';
      case 'facebook': return 'Facebook';
      case 'youtube': return 'YouTube';
      case 'tiktok': return 'TikTok';
      case 'twitter': return 'Twitter';
      case 'linkedin': return 'LinkedIn';
      default: return platform;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {content.title}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(content.status)}`}>
                {getStatusLabel(content.status)}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {getContentTypeLabel(content.content_type)}
              </span>
            </div>
          </div>
                     <div className="flex items-center space-x-2">
             {/* Botón Marcar como Publicado - solo si no está publicado */}
             {onMarkAsPublished && content.status !== 'published' && (
               <button
                 onClick={() => onMarkAsPublished(content.id)}
                 className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                 title="Marcar como publicado"
               >
                 Publicar
               </button>
             )}
             {onEdit && (
               <button
                 onClick={() => onEdit(content)}
                 className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                 title="Editar contenido"
               >
                 <Edit className="w-5 h-5" />
               </button>
             )}
             {onDelete && (
               <button
                 onClick={() => onDelete(content)}
                 className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                 title="Eliminar contenido"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
             )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Descripción */}
          {content.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Descripción</h3>
              <p className="text-gray-900">{content.description}</p>
            </div>
          )}

          {/* Información básica en dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-4">
              {/* Tipo de contenido */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Type className="w-4 h-4 mr-2" />
                  Tipo de Contenido
                </h3>
                <p className="text-gray-900">{getContentTypeLabel(content.content_type)}</p>
              </div>

              {/* Fecha de publicación */}
              {content.publish_date && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Fecha de Publicación
                  </h3>
                  <p className="text-gray-900">
                    {content.publish_date.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              {/* Plataformas */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Share2 className="w-4 h-4 mr-2" />
                  Plataformas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {content.platforms.map((platform, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                    >
                      {getPlatformLabel(platform)}
                    </span>
                  ))}
                </div>
              </div>

                             {/* Categorías */}
               <div>
                 <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                   <Tag className="w-4 h-4 mr-2" />
                   Categorías
                 </h3>
                 <div className="grid grid-cols-2 gap-2">
                   {content.categories.map((category, index) => (
                     <span
                       key={index}
                       className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full text-center"
                     >
                       {category}
                     </span>
                   ))}
                 </div>
               </div>
            </div>
          </div>

                     {/* Archivos - Posicionado entre las primeras secciones */}
           {content.media_files && content.media_files.length > 0 && (
             <div>
               <div className="flex items-center justify-between mb-3">
                 <h3 className="text-sm font-medium text-gray-700 flex items-center">
                   <Download className="w-4 h-4 mr-2" />
                   Archivos ({content.media_files.length})
                 </h3>
                 {onDownloadAllFiles && content.media_files.length > 1 && (
                   <button
                     onClick={() => onDownloadAllFiles(content.media_files)}
                     className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors flex items-center"
                   >
                     <Download className="w-4 h-4 mr-1" />
                     Descargar todo
                   </button>
                 )}
               </div>
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
                    {onDownloadFile && (
                      <button
                        onClick={() => onDownloadFile(file)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Descargar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Copy text con botón de copiar */}
          {content.copy_text && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Copy de la Publicación
                </h3>
                <button
                  onClick={handleCopyText}
                  className={`flex items-center px-3 py-1 text-sm rounded-lg transition-colors ${
                    copied 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-gray-900 whitespace-pre-wrap">
                  {renderHashtags(content.copy_text)}
                </div>
              </div>
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
};

export default ContentViewModal;
