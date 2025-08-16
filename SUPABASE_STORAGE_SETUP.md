# 🗂️ Configuración de Supabase Storage

## 📋 **Pasos para Configurar el Almacenamiento**

### **1. Ejecutar el Script SQL**

Ve a tu **Supabase Dashboard** → **SQL Editor** y ejecuta el script `SUPABASE_STORAGE_SETUP.sql`:

```sql
-- Script para configurar Supabase Storage
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear el bucket principal para archivos de tareas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-files',
  'task-files',
  false, -- bucket privado
  262144000, -- 250MB en bytes
  ARRAY['image/*', 'video/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- 2. Crear políticas RLS para el bucket task-files

-- Política para permitir a usuarios autenticados subir archivos
CREATE POLICY "Users can upload task files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'task-files' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir a usuarios autenticados ver archivos
CREATE POLICY "Users can view task files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'task-files' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir a usuarios autenticados actualizar sus archivos
CREATE POLICY "Users can update task files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'task-files' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir a usuarios autenticados eliminar sus archivos
CREATE POLICY "Users can delete task files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'task-files' 
  AND auth.role() = 'authenticated'
);
```

### **2. Verificar la Configuración**

Después de ejecutar el script, verifica que:

1. **Bucket creado**: Ve a **Storage** → Deberías ver el bucket `task-files`
2. **Políticas aplicadas**: Ve a **Storage** → **Policies** → Deberías ver las 4 políticas creadas

### **3. Configuración del Bucket**

El bucket `task-files` está configurado con:

- ✅ **Privado**: Solo usuarios autenticados pueden acceder
- ✅ **Límite de 250MB**: Suficiente para videos de reels
- ✅ **Tipos permitidos**: Imágenes, videos, PDFs, documentos
- ✅ **Políticas RLS**: Seguridad por usuario autenticado

## 🔧 **Funcionalidades Implementadas**

### **📤 Subida de Archivos**
- **Drag & Drop**: Arrastra archivos al área de subida
- **Selección manual**: Haz clic para seleccionar archivos
- **Validación**: Tamaño y tipo de archivo
- **Organización**: Archivos organizados por `taskId` en Storage

### **📁 Gestión de Archivos**
- **Visualización**: Lista de archivos subidos con iconos
- **Eliminación**: Eliminar archivos individuales
- **Información**: Tamaño, fecha de subida, tipo

### **🔒 Seguridad**
- **Autenticación**: Solo usuarios logueados pueden subir/ver
- **Políticas RLS**: Control granular de permisos
- **URLs seguras**: URLs públicas con expiración

## 🚀 **Cómo Usar**

### **En TaskReviewModal**
```typescript
<FileUpload
  onFilesUploaded={handleFilesUploaded}
  existingFiles={files}
  maxFiles={10}
  maxFileSize={250 * 1024 * 1024} // 250MB
  taskId={task.id} // Organiza archivos por tarea
  acceptedTypes={[
    'image/*',
    'video/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]}
/>
```

### **Estructura en Storage**
```
task-files/
├── task-123/
│   ├── 1703123456789-abc123.jpg
│   ├── 1703123456790-def456.mp4
│   └── 1703123456791-ghi789.pdf
└── task-456/
    ├── 1703123456792-jkl012.docx
    └── 1703123456793-mno345.png
```

## 🛠️ **Solución de Problemas**

### **Error: "No buckets available"**
- ✅ Ejecuta el script SQL completo
- ✅ Verifica que no haya errores en la consola de Supabase

### **Error: "Access denied"**
- ✅ Verifica que las políticas RLS estén creadas
- ✅ Asegúrate de que el usuario esté autenticado

### **Error: "File too large"**
- ✅ El límite está configurado en 250MB
- ✅ Verifica el tamaño del archivo antes de subir

### **Error: "Invalid file type"**
- ✅ Solo se permiten: imágenes, videos, PDFs, documentos
- ✅ Verifica la extensión del archivo

## 📱 **Tipos de Archivo Soportados**

| Tipo | Extensiones | Tamaño Máximo |
|------|-------------|---------------|
| **Imágenes** | JPG, PNG, GIF, SVG, WebP | 250MB |
| **Videos** | MP4, MOV, AVI, WebM | 250MB |
| **Documentos** | PDF, DOC, DOCX, TXT | 250MB |

## 🔄 **Próximos Pasos**

1. **Ejecuta el script SQL** en Supabase
2. **Verifica la creación del bucket** en Storage
3. **Prueba subir un archivo** desde la aplicación
4. **Verifica que aparezca** en el Storage de Supabase

¡Con esto deberías poder subir y ver archivos correctamente! 🎉
