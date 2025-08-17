# 📊 Documentación de Supabase - Paramo

## 🏗️ Estructura de Base de Datos

### **Tablas Principales**

#### **0. `user_preferences` - Preferencias de Usuario**
Preferencias persistentes por usuario autenticado (vista de tareas, tema, idioma, etc.). Relación 1:1 con cada usuario.

```sql
user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  task_view TEXT NOT NULL DEFAULT 'board' CHECK (task_view IN ('board', 'list')),
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('en', 'es')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

Políticas RLS recomendadas:

```sql
-- Habilitar RLS
alter table public.user_preferences enable row level security;

-- Lectura: cada usuario solo ve sus preferencias
create policy "Users can read own preferences" on public.user_preferences
for select using (auth.uid() = user_id);

-- Inserción/Actualización: cada usuario solo gestiona sus preferencias
create policy "Users upsert own preferences" on public.user_preferences
for insert with check (auth.uid() = user_id);

create policy "Users update own preferences" on public.user_preferences
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Opcional: permitir upsert idempotente con constraint UNIQUE(user_id)
-- Usar on conflict (user_id) en el cliente
```

Trigger de `updated_at`:

```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();
```

#### **1. `profiles` - Perfiles de Usuario**
Extensión de `auth.users` para almacenar información adicional de usuarios.

```sql
profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
)
```

**Campos:**
- `id`: Identificador único del perfil
- `user_id`: Referencia al usuario de auth.users
- `name`: Nombre completo del usuario
- `avatar`: URL de la imagen de perfil
- `role`: Rol del usuario (admin, member, viewer)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

#### **2. `projects` - Proyectos**
Almacena información de proyectos finitos y recurrentes.

```sql
projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  type TEXT NOT NULL CHECK (type IN ('finite', 'recurring')),
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in-progress', 'paused', 'completed', 'recurring-active')),
  client TEXT,
  project_lead_id UUID REFERENCES profiles(id),
  objective TEXT,
  scope JSONB,
  final_due_date DATE,
  service_cycle TEXT CHECK (service_cycle IN ('monthly', 'weekly', 'quarterly')),
  reporting_day INTEGER CHECK (reporting_day >= 1 AND reporting_day <= 31),
  monthly_deliverables JSONB,
  drive_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**Campos:**
- `id`: Identificador único del proyecto
- `name`: Nombre del proyecto
- `description`: Descripción del proyecto
- `color`: Color del proyecto (hex)
- `type`: Tipo de proyecto (finite, recurring)
- `status`: Estado del proyecto (planning, in-progress, paused, completed, recurring-active)
- `client`: Nombre del cliente
- `project_lead_id`: Referencia al líder del proyecto
- `objective`: Objetivo principal del proyecto
- `scope`: Array JSON de alcance y entregables
- `final_due_date`: Fecha de entrega final (proyectos finitos)
- `service_cycle`: Ciclo de servicio (monthly, weekly, quarterly)
- `reporting_day`: Día del mes para reportes
- `monthly_deliverables`: Array JSON de entregables mensuales
- `drive_link`: Enlace a Google Drive

---

#### **3. `project_members` - Miembros de Proyectos**
Relación many-to-many entre proyectos y usuarios.

```sql
project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
)
```

**Campos:**
- `id`: Identificador único de la relación
- `project_id`: Referencia al proyecto
- `user_id`: Referencia al usuario
- `role`: Rol del usuario en el proyecto
- `created_at`: Fecha de asignación

---

#### **4. `project_milestones` - Hitos de Proyectos**
Hitos y fechas clave de los proyectos.

```sql
project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**Campos:**
- `id`: Identificador único del hito
- `project_id`: Referencia al proyecto
- `title`: Título del hito
- `description`: Descripción del hito
- `due_date`: Fecha de vencimiento
- `completed`: Estado de completado
- `created_at`: Fecha de creación

---

#### **5. `tasks` - Tareas (Actualizada)**
Tareas asignables a usuarios con diferentes estados y funcionalidad de archivo.

```sql
tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'corrections', 'review', 'done', 'archived')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assignee_id UUID REFERENCES profiles(id),
  due_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  time_tracked INTEGER DEFAULT 0,
  tags JSONB,
  completed_files JSONB DEFAULT '[]',
  review_date TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**Campos:**
- `id`: Identificador único de la tarea
- `title`: Título de la tarea
- `description`: Descripción de la tarea
- `status`: Estado de la tarea (todo, in-progress, corrections, review, done, archived)
- `priority`: Prioridad (low, normal, high, urgent)
- `assignee_id`: Referencia al usuario asignado
- `due_date`: Fecha de vencimiento
- `project_id`: Referencia al proyecto
- `time_tracked`: Tiempo registrado en minutos
- `tags`: Array JSON de etiquetas
- `completed_files`: Array JSON de archivos completados (para conversión a contenido)
- `review_date`: Fecha de revisión
- `review_notes`: Notas de revisión
- `archived_at`: Fecha de archivo (se establece automáticamente cuando status cambia a 'archived')
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

**Tipo ENUM task_status:**
```sql
CREATE TYPE task_status AS ENUM (
  'todo',
  'in-progress', 
  'corrections',
  'review',
  'done',
  'archived'
);
```

---

#### **6. `task_subtasks` - Subtareas**
Subtareas de las tareas principales.

```sql
task_subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**Campos:**
- `id`: Identificador único de la subtarea
- `task_id`: Referencia a la tarea padre
- `title`: Título de la subtarea
- `completed`: Estado de completado
- `created_at`: Fecha de creación

---

#### **7. `content_items` - Contenido (Nueva Estructura)**
Contenido de marketing y redes sociales creado desde tareas completadas.

```sql
content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  publish_date DATE,
  content_type content_type NOT NULL,
  platforms platform_type[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  copy_text TEXT,
  media_files JSONB DEFAULT '[]',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived'))
)
```

**Campos:**
- `id`: Identificador único del contenido
- `title`: Título del contenido (tomado de la tarea)
- `description`: Descripción del contenido
- `publish_date`: Fecha programada para publicación
- `content_type`: Tipo de contenido (reel, carousel, story, static, video, image)
- `platforms`: Array de plataformas donde se publicará (instagram, facebook, youtube, tiktok, twitter, linkedin)
- `categories`: Array de categorías del contenido (puede ser múltiple: humor, educativo, ventas, etc.)
- `copy_text`: Texto de la publicación con hashtags
- `media_files`: Array JSON de archivos multimedia (tomados de la tarea)
- `project_id`: Referencia al proyecto asociado
- `created_by`: Referencia al usuario que creó el contenido
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización
- `status`: Estado del contenido (draft, scheduled, published, archived)

**Tipos ENUM:**
```sql
-- Tipo de contenido
CREATE TYPE content_type AS ENUM (
  'reel',
  'carousel', 
  'story',
  'static',
  'video',
  'image'
);

-- Plataformas de publicación
CREATE TYPE platform_type AS ENUM (
  'instagram',
  'facebook',
  'youtube',
  'tiktok',
  'twitter',
  'linkedin'
);
```

---

### **8. `subscriptions` - Suscripciones**
Gestión de suscripciones a servicios y herramientas.

```sql
subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name TEXT NOT NULL,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual')),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired', 'pending')),
  last_renewal_date DATE NOT NULL,
  next_due_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  responsible_id UUID REFERENCES profiles(id),
  notes TEXT,
  alerts BOOLEAN DEFAULT FALSE,
  management_url TEXT,
  access_credentials TEXT,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**Campos:**
- `id`: Identificador único de la suscripción
- `service_name`: Nombre del servicio suscrito
- `subscription_type`: Tipo de suscripción (weekly, biweekly, monthly, quarterly, semiannual, annual)
- `currency`: Moneda del costo (USD, EUR, etc.)
- `status`: Estado de la suscripción (active, paused, cancelled, expired, pending)
- `last_renewal_date`: Fecha de la última renovación
- `next_due_date`: Fecha del próximo vencimiento
- `payment_method`: Método de pago utilizado
- `responsible_id`: Referencia al usuario responsable
- `notes`: Notas adicionales sobre la suscripción
- `alerts`: Si se deben mostrar alertas para esta suscripción
- `management_url`: URL directa para administrar la suscripción
- `access_credentials`: Credenciales de acceso (JSON: {username: string, password?: string})
- `cost`: Costo de la suscripción
- `project_id`: Referencia al proyecto asociado (opcional)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### **9. `subscription_payments` - Historial de Pagos**
Registro de pagos realizados para las suscripciones.

```sql
subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**Campos:**
- `id`: Identificador único del pago
- `subscription_id`: Referencia a la suscripción
- `amount`: Monto del pago
- `currency`: Moneda del pago
- `payment_date`: Fecha del pago
- `payment_method`: Método de pago utilizado
- `status`: Estado del pago (completed, pending, failed)
- `transaction_id`: ID de transacción del proveedor de pagos
- `notes`: Notas adicionales sobre el pago
- `created_at`: Fecha de creación

---

## 🔐 Seguridad (Row Level Security)

### **Políticas Implementadas:**

#### **Profiles:**
- ✅ **Ver todos**: Todos pueden ver todos los perfiles
- ✅ **Actualizar propio**: Usuarios solo pueden actualizar su propio perfil

#### **Projects:**
- ✅ **Ver todos**: Todos pueden ver todos los proyectos
- ✅ **Crear/Editar/Eliminar**: Solo admins pueden modificar proyectos

#### **Tasks:**
- ✅ **Ver todos**: Todos pueden ver todas las tareas
- ✅ **Crear/Editar**: Todos pueden crear y editar tareas
- ✅ **Eliminar**: Solo admins pueden eliminar tareas

#### **Content Items:**
- ✅ **Ver todos**: Todos pueden ver todo el contenido
- ✅ **Crear/Editar**: Todos pueden crear y editar contenido
- ✅ **Eliminar**: Solo admins pueden eliminar contenido

#### **Subscriptions:**
- ✅ **Ver todos**: Todos pueden ver todas las suscripciones
- ✅ **Crear/Editar**: Todos pueden crear y editar suscripciones
- ✅ **Eliminar**: Solo admins pueden eliminar suscripciones

#### **Subscription Payments:**
- ✅ **Ver todos**: Todos pueden ver todos los pagos
- ✅ **Crear/Editar**: Todos pueden crear y editar pagos
- ✅ **Eliminar**: Solo admins pueden eliminar pagos

---

## 📈 Índices Optimizados

### **Tareas:**
- `idx_tasks_project_id`: Filtrado por proyecto
- `idx_tasks_assignee_id`: Filtrado por usuario asignado
- `idx_tasks_status`: Filtrado por estado
- `idx_tasks_due_date`: Filtrado por fecha de vencimiento

### **Contenido:**
- `idx_content_items_project_id`: Filtrado por proyecto
- `idx_content_items_publish_date`: Filtrado por fecha de publicación
- `idx_content_items_content_type`: Filtrado por tipo de contenido
- `idx_content_items_platforms`: Filtrado por plataformas (GIN)
- `idx_content_items_categories`: Filtrado por categorías (GIN)
- `idx_content_items_status`: Filtrado por estado
- `idx_content_items_created_by`: Filtrado por usuario creador

### **Suscripciones:**
- `idx_subscriptions_status`: Filtrado por estado
- `idx_subscriptions_responsible_id`: Filtrado por usuario responsable
- `idx_subscriptions_project_id`: Filtrado por proyecto
- `idx_subscriptions_next_due_date`: Filtrado por fecha de vencimiento
- `idx_subscriptions_service_name`: Búsqueda por nombre de servicio

### **Pagos de Suscripciones:**
- `idx_subscription_payments_subscription_id`: Filtrado por suscripción
- `idx_subscription_payments_payment_date`: Filtrado por fecha de pago
- `idx_subscription_payments_status`: Filtrado por estado de pago

### **Proyectos:**
- `idx_projects_status`: Filtrado por estado
- `idx_projects_type`: Filtrado por tipo

### **Miembros de Proyectos:**
- `idx_project_members_project_id`: Filtrado por proyecto
- `idx_project_members_user_id`: Filtrado por usuario

---

## 🎯 Funciones Útiles

### **`get_user_tasks(user_uuid UUID)`**
Obtiene todas las tareas asignadas a un usuario específico.

**Retorna:**
- `id`: ID de la tarea
- `title`: Título de la tarea
- `description`: Descripción
- `status`: Estado de la tarea
- `priority`: Prioridad
- `due_date`: Fecha de vencimiento
- `project_id`: ID del proyecto
- `project_name`: Nombre del proyecto

### **`get_project_stats(project_uuid UUID)`**
Obtiene estadísticas de un proyecto específico.

**Retorna:**
- `total_tasks`: Número total de tareas
- `completed_tasks`: Número de tareas completadas
- `progress_percentage`: Porcentaje de progreso

### **`get_upcoming_subscriptions(days_ahead INTEGER DEFAULT 30)`**
Obtiene suscripciones próximas a vencer en los próximos días.

**Retorna:**
- `id`: ID de la suscripción
- `service_name`: Nombre del servicio
- `next_due_date`: Fecha de próximo vencimiento
- `cost`: Costo de la suscripción
- `currency`: Moneda
- `responsible_name`: Nombre del responsable

### **`get_subscription_stats()`**
Obtiene estadísticas generales de suscripciones.

**Retorna:**
- `total_subscriptions`: Número total de suscripciones
- `active_subscriptions`: Número de suscripciones activas
- `total_monthly_cost`: Costo total mensual de suscripciones activas
- `overdue_subscriptions`: Número de suscripciones vencidas

---

## 🔄 Triggers Automáticos

### **`update_updated_at_column()`**
Función que actualiza automáticamente el campo `updated_at` cuando se modifica un registro.

**Aplicado a:**
- ✅ `profiles`
- ✅ `projects`
- ✅ `tasks`
- ✅ `content_items`
- ✅ `subscriptions`

### **`update_archived_at_timestamp()`**
Función que actualiza automáticamente el campo `archived_at` cuando el status de una tarea cambia a 'archived'.

**Aplicado a:**
- ✅ `tasks` - Establece `archived_at = NOW()` cuando status cambia a 'archived'
- ✅ `tasks` - Limpia `archived_at = NULL` cuando status cambia de 'archived' a otro

---

## 📊 Relaciones de Datos

```
auth.users
    ↓ (1:1)
profiles
    ↓ (1:N)
projects ←→ project_members ←→ profiles
    ↓ (1:N)
project_milestones
    ↓ (1:N)
tasks ←→ task_subtasks
    ↓ (1:N)
content_items
    ↓ (1:N)
subscriptions ←→ subscription_payments
```

---

## 🚀 Configuración del Cliente

### **URL y Keys:**
```typescript
const supabaseUrl = 'https://hznvcktueznfvpulkmby.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bnZja3R1ZXpuZnZwdWxrbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI5NzQsImV4cCI6MjA3MDE0ODk3NH0.XcbkBFtBTRanC-CoYsFhtSJeZMKmx9-fwVm9rQW7m7w'
```

### **Hooks Disponibles:**
- `useProjects()`: CRUD completo de proyectos
- `useTasks()`: CRUD + filtros por proyecto/usuario
- `useContentItems()`: CRUD de contenido (estructura antigua)
- `useContent()`: CRUD de contenido (nueva estructura) + conversión de tareas
- `useProfiles()`: Gestión de usuarios
- `useSubscriptions()`: CRUD de suscripciones
- `useSubscriptionPayments()`: CRUD de pagos de suscripciones
- `useStorage()`: Gestión de archivos en Supabase Storage
- `useComments()`: Gestión de comentarios de tareas

---

## 📝 Notas de Uso

### **Filtros de Tareas:**
- **Por proyecto**: `getTasksByProject(projectId)`
- **Por usuario**: `getTasksByAssignee(assigneeId)`
- **Por estado**: Filtrado automático en el hook

### **Estados de Proyectos:**
- `planning`: En planificación
- `in-progress`: En progreso
- `paused`: Pausado
- `completed`: Completado
- `recurring-active`: Recurrente activo

### **Estados de Tareas:**
- `todo`: Por hacer
- `in-progress`: En progreso
- `corrections`: En correcciones (tarea devuelta desde review)
- `review`: En revisión
- `done`: Completada
- `archived`: Archivada (sin convertir a contenido)

### **Tipos de Proyectos:**
- `finite`: Proyecto con fecha de fin
- `recurring`: Servicio recurrente

### **Estados de Suscripciones:**
- `active`: Suscripción activa
- `paused`: Suscripción pausada
- `cancelled`: Suscripción cancelada
- `expired`: Suscripción expirada
- `pending`: Suscripción pendiente

### **Tipos de Suscripciones:**
- `weekly`: Semanal
- `biweekly`: Quincenal
- `monthly`: Mensual
- `quarterly`: Trimestral
- `semiannual`: Semestral
- `annual`: Anual

---

## 🔧 Mantenimiento

### **Backup Automático:**
Supabase realiza backups automáticos diarios.

### **Monitoreo:**
- Usar el Dashboard de Supabase para monitorear consultas
- Revisar logs en la sección "Logs" del dashboard

### **Escalabilidad:**
- La estructura está optimizada para hasta 10,000 registros
- Para mayor escala, considerar particionamiento de tablas

---

## 🎯 Funcionalidad de Conversión de Tareas a Contenido

### **Descripción General**
Sistema que permite convertir tareas completadas en elementos de contenido para marketing y redes sociales, con eliminación automática de la tarea original.

### **Flujo de Trabajo**

#### **1. Conversión de Tarea a Contenido**
```
Tarea "Done" → Botón "Convertir a Contenido" → Modal de Configuración → Crear Content Item → Eliminar Tarea
```

#### **2. Archivo de Tarea**
```
Tarea "Done" → Botón "Archivar" → Cambiar estado a "archived"
```

### **Componentes Implementados**

#### **Modales:**
- **`ConvertToContentModal`**: Modal para configurar contenido desde tarea
- **`ContentViewModal`**: Modal para visualizar contenido creado
- **`TaskReviewModal`**: Modal para subir archivos al marcar para revisión
- **`TaskReturnModal`**: Modal para comentarios al devolver tarea

#### **Hooks:**
- **`useContent()`**: Gestión completa de contenido + conversión de tareas
- **`useStorage()`**: Gestión de archivos en Supabase Storage
- **`useComments()`**: Gestión de comentarios de tareas

#### **Funcionalidades:**
- ✅ **Mapeo automático**: Título, descripción, archivos, project_id
- ✅ **Configuración manual**: Tipo, plataformas, categorías, copy, fecha
- ✅ **Eliminación de archivos**: Al devolver tarea de "review" a "corrections"
- ✅ **Descarga de archivos**: Desde preview de contenido
- ✅ **Comentarios**: Sistema de comentarios en tareas
- ✅ **Drag & Drop**: Condicional con validación de estados

### **Estados de Tareas y Transiciones**

#### **Flujo Normal:**
```
todo → in-progress → review → done
```

#### **Flujo con Correcciones:**
```
todo → in-progress → review → corrections → in-progress → review → done
```

#### **Flujo de Archivo:**
```
done → archived (sin conversión)
```

#### **Flujo de Conversión:**
```
done → [conversión] → content_item (tarea eliminada)
```

### **Campos Mapeados Automáticamente**

| Campo Tarea | Campo Contenido | Descripción |
|-------------|-----------------|-------------|
| `title` | `title` | Título de la tarea |
| `description` | `description` | Descripción de la tarea |
| `completed_files` | `media_files` | Archivos subidos en review |
| `project_id` | `project_id` | Proyecto asociado |
| `assignee_id` | `created_by` | Usuario que creó el contenido |

### **Campos Configurables**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `content_type` | ENUM | reel, carousel, story, static, video, image |
| `platforms` | ARRAY | instagram, facebook, youtube, tiktok, twitter, linkedin |
| `categories` | ARRAY | humor, educativo, ventas, etc. |
| `copy_text` | TEXT | Texto de publicación con hashtags |
| `publish_date` | DATE | Fecha programada de publicación |

### **Gestión de Archivos**

#### **Subida de Archivos:**
- **Local**: Archivos se almacenan temporalmente en el navegador
- **Review**: Archivos se suben a Supabase Storage al marcar para revisión
- **Límite**: 50MB por archivo (límite del plan gratuito)

#### **Eliminación de Archivos:**
- **Trigger**: Tarea pasa de "review" a "corrections"
- **Acción**: Elimina archivos de Supabase Storage
- **Limpieza**: Limpia `completed_files` y `review_notes` en la base de datos

#### **Descarga de Archivos:**
- **Individual**: Desde `TaskView` modal
- **Múltiple**: Botón "Descargar todo" si hay más de un archivo
- **Contenido**: Desde `ContentViewModal`

### **Sistema de Comentarios**

#### **Tabla `task_comments`:**
```sql
task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

#### **Funcionalidades:**
- ✅ **Crear comentarios**: En cualquier tarea
- ✅ **Editar comentarios**: Solo el autor
- ✅ **Eliminar comentarios**: Solo el autor
- ✅ **Realtime**: Actualización en tiempo real
- ✅ **Comentarios automáticos**: Al devolver tarea para correcciones

### **Validaciones y Restricciones**

#### **Drag & Drop:**
- ✅ **Transiciones válidas**: Solo estados secuenciales permitidos
- ✅ **Feedback visual**: Indicadores de validación
- ✅ **Condicional**: Diferentes acciones según estado origen/destino

#### **Conversión:**
- ✅ **Solo tareas "done"**: No se puede convertir tareas en otros estados
- ✅ **Archivos requeridos**: Tarea debe tener archivos para conversión
- ✅ **Validación de campos**: Plataformas y categorías obligatorias

#### **Archivo:**
- ✅ **Solo tareas "done"**: No se puede archivar tareas en otros estados
- ✅ **Sin conversión**: Tarea se mantiene pero cambia estado a "archived"

### **Integración con Calendario**

#### **ContentCalendar:**
- ✅ **Filtros**: All, Content, Tasks
- ✅ **Vista de contenido**: Elementos de contenido en calendario
- ✅ **Filtrado por proyecto**: Contenido específico del proyecto
- ✅ **Vista detallada**: Modal con información completa

#### **ProjectHub:**
- ✅ **Contenido del proyecto**: Vista de contenido específico
- ✅ **Filtros integrados**: Mismos filtros que calendario principal
- ✅ **Navegación**: Entre tareas y contenido del proyecto

### **Scripts SQL Requeridos**

#### **1. Tabla de Comentarios:**
```sql
-- Ejecutar en Supabase SQL Editor
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_author_id ON task_comments(author_id);

-- RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view task comments" ON task_comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create task comments" ON task_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" ON task_comments
  FOR UPDATE USING (auth.uid()::text = author_id::text);

CREATE POLICY "Users can delete own comments" ON task_comments
  FOR DELETE USING (auth.uid()::text = author_id::text);
```

#### **2. Storage Bucket:**
```sql
-- Crear bucket para archivos de tareas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-files',
  'task-files',
  false,
  52428800, -- 50MB
  ARRAY['image/*', 'video/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/x-zip-compressed']
);

-- Políticas RLS para storage
CREATE POLICY "Users can upload task files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'task-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view task files" ON storage.objects
FOR SELECT USING (bucket_id = 'task-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update task files" ON storage.objects
FOR UPDATE USING (bucket_id = 'task-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete task files" ON storage.objects
FOR DELETE USING (bucket_id = 'task-files' AND auth.role() = 'authenticated');
```

---

## 📞 Soporte

Para consultas sobre la estructura o configuración:
1. Revisar esta documentación
2. Consultar logs en Supabase Dashboard
3. Verificar políticas de RLS en la sección "Authentication > Policies"

---

### 8. Migración: Ordenamiento de subtareas

Para persistir el orden de las subtareas, añade una columna `position` y rellénala con índices por tarea:

```sql
-- 1) Añadir columna position a task_subtasks
alter table public.task_subtasks
  add column if not exists position integer;

-- 2) Crear índice opcional para mejorar ordenación
create index if not exists idx_task_subtasks_task_id_position
  on public.task_subtasks(task_id, position);

-- 3) Backfill: asignar posiciones incrementales por cada task_id
with ranked as (
  select id,
         task_id,
         row_number() over (partition by task_id order by created_at asc, id asc) - 1 as rn
  from public.task_subtasks
)
update public.task_subtasks t
set position = r.rn
from ranked r
where r.id = t.id;

-- 4) Asegurar no nulos (opcional)
-- alter table public.task_subtasks alter column position set not null;

-- 5) Asegurar orden por defecto en lecturas (se sugiere en consultas)
-- select ... from task_subtasks where task_id = ? order by position asc, created_at asc;
```

---

### 9. Migración: Tablas de Suscripciones

Para crear las tablas de suscripciones y pagos, ejecuta el script completo en `subscriptions_table.sql`:

```sql
-- Ejecutar el archivo subscriptions_table.sql completo
-- Este script incluye:
-- - Creación de tablas subscriptions y subscription_payments
-- - Índices optimizados
-- - Políticas RLS
-- - Funciones útiles
-- - Datos de ejemplo
-- - Comentarios de documentación
```

**Nota:** El script está diseñado para ser ejecutado completo y maneja automáticamente:
- Creación de tablas si no existen
- Configuración de RLS
- Creación de índices
- Inserción de datos de ejemplo
- Documentación completa

---

### 10. Migración: Estructura de Access Credentials

#### **Nueva Estructura JSON:**
El campo `access_credentials` ahora utiliza una estructura JSON para separar username y password:

```json
{
  "username": "string (requerido)",
  "password": "string (opcional)"
}
```

#### **Actualización de Credenciales Existentes:**
Para actualizar todas las suscripciones existentes con credenciales aleatorias, ejecuta el script `update_access_credentials.sql`:

```sql
-- Ejecutar el archivo update_access_credentials.sql completo
-- Este script:
-- - Actualiza todas las suscripciones con access_credentials NULL
-- - Genera credenciales aleatorias basadas en el nombre del servicio
-- - Utiliza formato JSON con username y password separados
-- - Incluye verificaciones y conteos de actualización
```

**Ejemplos de credenciales generadas:**
- **Netflix**: `{"username": "user_a1b2c3d4", "password": "Netflix1a2b3c!"}`
- **Spotify**: `{"username": "spotify_1a2b3c", "password": "Spotify1a2b3c!"}`
- **Adobe**: `{"username": "adobe_a1b2c3d4", "password": "Adobe1a2b3c!"}`
- **Figma**: `{"username": "figma_a1b2c3d4", "password": "Figma1a2b3c!"}`

#### **Cambios en la Aplicación:**
- El modal de creación/edición ahora tiene campos separados para username y password
- El campo username es obligatorio, password es opcional
- La vista detallada muestra las credenciales por separado
- Se mantiene compatibilidad con el formato JSON en la base de datos

---

## 11. Sistema de Seguridad PIN para Credenciales

### Descripción General
Se ha implementado un sistema de seguridad basado en PIN para proteger el acceso a las credenciales de las suscripciones. Este sistema permite configurar un PIN de seguridad que debe ser ingresado para visualizar las credenciales de acceso.

### Componentes del Sistema

#### 11.1 Hook de Seguridad (`usePinSecurity`)
- **Archivo**: `src/hooks/usePinSecurity.ts`
- **Funcionalidades**:
  - Configurar PIN de seguridad
  - Verificar PIN ingresado
  - Gestionar estado de autenticación
  - Persistir PIN en localStorage
  - Limpiar PIN y estado de autenticación

#### 11.2 Modal de PIN (`PinModal`)
- **Archivo**: `src/components/PinModal.tsx`
- **Funcionalidades**:
  - Configurar nuevo PIN (mínimo 4 dígitos)
  - Verificar PIN existente
  - Validación de coincidencia de PINs
  - Manejo de errores y estados de carga
  - Interfaz intuitiva con iconos y mensajes claros

#### 11.3 Modal de Visualización de Credenciales (`CredentialViewModal`)
- **Archivo**: `src/components/CredentialViewModal.tsx`
- **Funcionalidades**:
  - Mostrar credenciales después de verificación PIN
  - Copiar credenciales al portapapeles
  - Toggle de visibilidad de contraseña
  - Botón para editar credenciales (solo visible si hay credenciales)

#### 11.4 Modal de Edición de Credenciales (`CredentialEditModal`)
- **Archivo**: `src/components/CredentialEditModal.tsx`
- **Funcionalidades**:
  - Editar username (obligatorio) y password (opcional)
  - Validación de campos
  - Copiar credenciales al portapapeles
  - Toggle de visibilidad de contraseña
  - Guardar cambios en la base de datos

### Flujos de Credenciales

#### 11.5 Creación de Suscripción
- **Ubicación**: `SubscriptionModal` (solo en modo creación)
- **Comportamiento**:
  - Los campos de credenciales (username y password) están disponibles
  - Username es obligatorio, password es opcional
  - Las credenciales se guardan junto con la suscripción
  - No requiere PIN para agregar credenciales durante la creación

#### 11.6 Edición de Suscripción
- **Ubicación**: `SubscriptionModal` (modo edición)
- **Comportamiento**:
  - Los campos de credenciales están **ocultos**
  - No se pueden editar credenciales desde el modal principal
  - Solo se pueden editar otros campos de la suscripción

#### 11.7 Visualización de Credenciales desde Cards
- **Ubicación**: `SubscriptionDashboard` → Cards de suscripciones
- **Comportamiento**:
  - Al hacer clic en el ícono de "Ver credenciales" se abre el `PinModal`
  - Si no hay PIN configurado, se solicita configurar uno
  - Si hay PIN configurado, se solicita ingresarlo
  - Tras verificación exitosa, se abre `CredentialViewModal` con las credenciales
  - Desde `CredentialViewModal` se puede copiar credenciales o editar (botón "Editar")
  - El botón "Editar" abre `CredentialEditModal` para modificar credenciales

#### 11.8 Visualización de Credenciales en Detalle
- **Ubicación**: `SubscriptionDetailModal` (vista detallada)
- **Comportamiento**:
  - Las credenciales se muestran inicialmente **censuradas**:
    - Username: parcialmente oculto (ej: "us***@email.com")
    - Password: completamente oculto ("••••••••••••••••")
  - Al hacer clic en el ícono de "Ver credenciales" se abre el `PinModal`
  - Tras verificación exitosa, las credenciales se **revelan en el mismo modal**
  - Aparece un botón "Editar" que abre `CredentialEditModal`
  - Se pueden copiar credenciales individuales al portapapeles

### Configuración del PIN

#### 11.9 Configuración en Settings
- **Ubicación**: `SettingsModal`
- **Funcionalidades**:
  - Configurar nuevo PIN de seguridad
  - Cambiar PIN existente
  - Eliminar PIN (desactiva la protección)
  - Validación de longitud mínima (4 dígitos)
  - Confirmación de PIN para evitar errores

### Seguridad y Persistencia

#### 11.10 Almacenamiento
- El PIN se almacena en `localStorage` del navegador
- Se utiliza encriptación básica para el almacenamiento
- El estado de autenticación se mantiene durante la sesión
- Se puede limpiar manualmente desde Settings

#### 11.11 Validaciones
- PIN mínimo de 4 dígitos
- Confirmación obligatoria al configurar
- Mensajes de error claros para el usuario
- Timeout de sesión (se puede implementar)

### Integración con Componentes Existentes

#### 11.12 Modificaciones Realizadas
- `SubscriptionDashboard`: Integración de modales de credenciales
- `SubscriptionDetailModal`: Sistema de censura y revelación
- `SettingsModal`: Configuración de PIN
- `SubscriptionModal`: Restricción de edición de credenciales
- `App.tsx`: Manejo de actualización de credenciales

#### 11.13 Props y Interfaces
- Se agregaron props para manejo de credenciales
- Interfaces actualizadas para incluir funciones de actualización
- Manejo de estados para modales de credenciales

### Uso del Sistema

#### 11.14 Primer Uso
1. Ir a Settings → Configurar PIN de Seguridad
2. Establecer PIN de 4+ dígitos
3. Confirmar PIN
4. El sistema está listo para proteger credenciales

#### 11.15 Visualización de Credenciales
1. Hacer clic en "Ver credenciales" en cualquier suscripción
2. Ingresar PIN de seguridad
3. Las credenciales se revelan en modal dedicado
4. Opciones disponibles: copiar, editar, cerrar

#### 11.16 Edición de Credenciales
1. Desde modal de visualización, hacer clic en "Editar"
2. Modificar username y/o password
3. Guardar cambios
4. Los cambios se reflejan inmediatamente en la base de datos

### Notas de Seguridad

#### 11.17 Limitaciones Actuales
- El PIN se almacena en localStorage (no es 100% seguro)
- No hay timeout automático de sesión
- No hay límite de intentos de PIN

#### 11.18 Mejoras Futuras Posibles
- Implementar timeout de sesión
- Límite de intentos de PIN
- Encriptación más robusta del PIN
- Integración con autenticación del sistema