# 📊 Documentación de Supabase - Paramo

## 🏗️ Estructura de Base de Datos

### **Tablas Principales**

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

#### **5. `tasks` - Tareas**
Tareas asignables a usuarios con diferentes estados.

```sql
tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assignee_id UUID REFERENCES profiles(id),
  due_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  time_tracked INTEGER DEFAULT 0,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**Campos:**
- `id`: Identificador único de la tarea
- `title`: Título de la tarea
- `description`: Descripción de la tarea
- `status`: Estado de la tarea (todo, in-progress, review, done)
- `priority`: Prioridad (low, normal, high, urgent)
- `assignee_id`: Referencia al usuario asignado
- `due_date`: Fecha de vencimiento
- `project_id`: Referencia al proyecto
- `time_tracked`: Tiempo registrado en minutos
- `tags`: Array JSON de etiquetas
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

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

#### **7. `content_items` - Contenido**
Contenido de marketing y redes sociales.

```sql
content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('post', 'story', 'video', 'article', 'campaign')),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'blog')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'scheduled', 'published')),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  published_date TIMESTAMP WITH TIME ZONE,
  assignee_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT,
  media_urls JSONB,
  hashtags JSONB,
  mentions JSONB,
  engagement_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**Campos:**
- `id`: Identificador único del contenido
- `title`: Título del contenido
- `description`: Descripción del contenido
- `type`: Tipo de contenido (post, story, video, article, campaign)
- `platform`: Plataforma (instagram, facebook, twitter, linkedin, tiktok, youtube, blog)
- `status`: Estado del contenido (draft, review, approved, scheduled, published)
- `scheduled_date`: Fecha programada de publicación
- `published_date`: Fecha de publicación real
- `assignee_id`: Referencia al usuario asignado
- `project_id`: Referencia al proyecto
- `content`: Contenido del post
- `media_urls`: Array JSON de URLs de medios
- `hashtags`: Array JSON de hashtags
- `mentions`: Array JSON de menciones
- `engagement_metrics`: Objeto JSON con métricas (likes, comments, shares, views)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

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

---

## 📈 Índices Optimizados

### **Tareas:**
- `idx_tasks_project_id`: Filtrado por proyecto
- `idx_tasks_assignee_id`: Filtrado por usuario asignado
- `idx_tasks_status`: Filtrado por estado
- `idx_tasks_due_date`: Filtrado por fecha de vencimiento

### **Contenido:**
- `idx_content_items_project_id`: Filtrado por proyecto
- `idx_content_items_assignee_id`: Filtrado por usuario asignado
- `idx_content_items_status`: Filtrado por estado
- `idx_content_items_scheduled_date`: Filtrado por fecha programada

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

---

## 🔄 Triggers Automáticos

### **`update_updated_at_column()`**
Función que actualiza automáticamente el campo `updated_at` cuando se modifica un registro.

**Aplicado a:**
- ✅ `profiles`
- ✅ `projects`
- ✅ `tasks`
- ✅ `content_items`

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
- `useContentItems()`: CRUD de contenido
- `useProfiles()`: Gestión de usuarios

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
- `review`: En revisión
- `done`: Completada

### **Tipos de Proyectos:**
- `finite`: Proyecto con fecha de fin
- `recurring`: Servicio recurrente

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