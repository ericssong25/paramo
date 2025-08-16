// Utilidad para comprimir videos antes de subir
export const compressVideo = async (file: File, maxSizeMB: number = 50): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Si el archivo ya es menor que el límite, no comprimir
    if (file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file);
      return;
    }

    // Crear un elemento de video para comprimir
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('No se pudo obtener el contexto del canvas'));
      return;
    }

    video.onloadedmetadata = () => {
      // Calcular dimensiones para mantener aspect ratio
      const aspectRatio = video.videoWidth / video.videoHeight;
      let newWidth = video.videoWidth;
      let newHeight = video.videoHeight;

      // Reducir dimensiones si son muy grandes
      const maxDimension = 1280;
      if (newWidth > maxDimension || newHeight > maxDimension) {
        if (newWidth > newHeight) {
          newWidth = maxDimension;
          newHeight = maxDimension / aspectRatio;
        } else {
          newHeight = maxDimension;
          newWidth = maxDimension * aspectRatio;
        }
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Configurar calidad de compresión
      const quality = 0.7; // 70% de calidad

      // Función para capturar frames y crear video comprimido
      const captureAndCompress = () => {
        ctx.drawImage(video, 0, 0, newWidth, newHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            // Crear nuevo archivo comprimido
            const compressedFile = new File([blob], file.name, {
              type: 'video/webm',
              lastModified: Date.now()
            });

            // Verificar si el tamaño es aceptable
            if (compressedFile.size <= maxSizeMB * 1024 * 1024) {
              resolve(compressedFile);
            } else {
              // Si aún es muy grande, intentar con menor calidad
              canvas.toBlob((smallerBlob) => {
                if (smallerBlob) {
                  const smallerFile = new File([smallerBlob], file.name, {
                    type: 'video/webm',
                    lastModified: Date.now()
                  });
                  resolve(smallerFile);
                } else {
                  reject(new Error('No se pudo comprimir el video'));
                }
              }, 'video/webm', quality * 0.5);
            }
          } else {
            reject(new Error('No se pudo comprimir el video'));
          }
        }, 'video/webm', quality);
      };

      video.onseeked = captureAndCompress;
      video.currentTime = 0;
    };

    video.onerror = () => {
      reject(new Error('Error al cargar el video'));
    };

    // Cargar el video
    video.src = URL.createObjectURL(file);
  });
};

// Función para verificar si un archivo necesita compresión
export const needsCompression = (file: File, maxSizeMB: number = 50): boolean => {
  return file.size > maxSizeMB * 1024 * 1024;
};

// Función para obtener el tamaño en formato legible
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
