# 🌍 Sistema de Traducciones

Este sistema permite cambiar el idioma de la aplicación entre **Español** e **Inglés** de manera dinámica.

## 📁 Estructura de Archivos

```
src/i18n/
├── translations.ts    # Archivo principal de traducciones
└── README.md         # Esta documentación

src/hooks/
└── useTranslation.ts # Hook personalizado para manejar traducciones
```

## 🚀 Cómo Usar

### 1. Importar el Hook

```tsx
import { useTranslation } from '../hooks/useTranslation';

function MiComponente() {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  
  // Usar traducciones
  return <h1>{t('common.save')}</h1>;
}
```

### 2. Funciones Disponibles

#### `t(key: string)`
Traduce una clave específica:
```tsx
t('tasks.title')           // "Tareas" o "Tasks"
t('common.save')           // "Guardar" o "Save"
t('settings.language')     // "Idioma" o "Language"
```

#### `currentLanguage`
Obtiene el idioma actual:
```tsx
const { currentLanguage } = useTranslation();
console.log(currentLanguage); // 'es' o 'en'
```

#### `changeLanguage(language, reloadPage?)`
Cambia el idioma:
```tsx
const { changeLanguage } = useTranslation();
changeLanguage('en'); // Cambia a inglés instantáneamente
changeLanguage('es'); // Cambia a español instantáneamente
changeLanguage('en', true); // Cambia a inglés y recarga la página
```

#### `getTaskStatusTranslation(status)`
Traduce estados de tareas:
```tsx
const { getTaskStatusTranslation } = useTranslation();
getTaskStatusTranslation('todo');        // "Por Hacer" o "To Do"
getTaskStatusTranslation('in-progress'); // "En Progreso" o "In Progress"
```

#### `getPriorityTranslation(priority)`
Traduce prioridades:
```tsx
const { getPriorityTranslation } = useTranslation();
getPriorityTranslation('high');   // "Alta" o "High"
getPriorityTranslation('urgent'); // "Urgente" o "Urgent"
```

### 3. Claves de Traducción Disponibles

#### Comunes (`common`)
- `save`, `cancel`, `delete`, `edit`, `create`, `update`
- `close`, `loading`, `error`, `success`, `confirm`
- `back`, `next`, `previous`, `search`, `filter`, `sort`, `reload`

#### Navegación (`navigation`)
- `dashboard`, `projects`, `tasks`, `calendar`
- `settings`, `profile`, `logout`
- `allTasks`, `contentCalendar`, `subscriptions`, `approvals`
- `search`, `analytics`, `team`

#### Tareas (`tasks`)
- `title`, `newTask`, `editTask`, `deleteTask`
- `taskTitle`, `description`, `priority`, `status`
- `assignee`, `dueDate`, `tags`, `addTag`
- `startTask`, `markForReview`, `completeTask`, `returnTask`
- `taskStatus.todo`, `taskStatus.inProgress`, `taskStatus.review`, `taskStatus.done`
- `priorityLevels.low`, `priorityLevels.normal`, `priorityLevels.high`, `priorityLevels.urgent`
- `unassigned`, `noTasksFound`, `taskCount`
- **Board view**: `board`, `list`, `searchTasks`
- **Task actions**: `startTask`, `reviewTask`, `convertTask`, `archiveTask`
- **Date formats**: `today`, `tomorrow`
- **Empty states**: `noTasksInColumn`
- **Filter options**: `filter`, `sort`, `clearAll`, `reset`, `apply`
- **Filter labels**: `overdue`, `overdueOnly`, `dueFrom`, `dueTo`, `sortBy`, `direction`
- **Sort options**: `default`, `created`, `title`
- **Status labels**: `corrections`, `inProgress`, `inReview`
- **Priority labels**: `urgent`
- **Column headers**: `toDo`, `review`, `done`

#### Proyectos (`projects`)
- `title`, `newProject`, `editProject`, `deleteProject`
- `projectName`, `projectDescription`, `projectColor`, `projectIcon`
- `noProjects`, `createFirstProject`

#### Configuración (`settings`)
- `title`, `appearance`, `language`, `notifications`
- `privacy`, `security`, `pinSecurity`
- `pinConfigured`, `pinNotConfigured`
- `configure`, `change`, `remove`
- `newPin`, `confirmPin`, `savePin`
- `pinError`, `pinMismatch`, `user`

#### Dashboard (`dashboard`)
- `title`, `welcome`, `recentTasks`, `upcomingDeadlines`
- `projectOverview`, `taskStats`, `completedToday`
- `inProgress`, `pending`

#### Calendario (`calendar`)
- `title`, `today`, `week`, `month`, `year`
- `noEvents`, `addEvent`

#### Modales (`modals`)
- `confirmDelete`, `confirmDeleteTask`, `confirmDeleteProject`
- `taskDeleted`, `projectDeleted`, `taskCreated`, `taskUpdated`
- `projectCreated`, `projectUpdated`

#### Errores (`errors`)
- `somethingWentWrong`, `networkError`, `unauthorized`
- `forbidden`, `notFound`, `validationError`
- `requiredField`, `invalidEmail`, `passwordTooShort`

## 🔧 Configuración

### Detección Automática de Idioma
El sistema detecta automáticamente el idioma del navegador al cargar la aplicación.

### Persistencia
El idioma seleccionado se guarda en `localStorage` y se mantiene entre sesiones.

### Cambio de Idioma
Los usuarios pueden cambiar el idioma desde:
**Configuración → Idioma → Español/English**

El sistema ofrece dos opciones:
1. **Cambio instantáneo**: La interfaz se actualiza inmediatamente sin recargar
2. **Cambio con recarga**: Opción para recargar la página si es necesario

## 📝 Agregar Nuevas Traducciones

### 1. Agregar al archivo `translations.ts`:

```tsx
export const translations = {
  en: {
    // ... traducciones existentes
    nuevaSeccion: {
      nuevaClave: 'New Translation',
      otraClave: 'Another Translation'
    }
  },
  es: {
    // ... traducciones existentes
    nuevaSeccion: {
      nuevaClave: 'Nueva Traducción',
      otraClave: 'Otra Traducción'
    }
  }
};
```

### 2. Usar en el componente:

```tsx
const { t } = useTranslation();
return <div>{t('nuevaSeccion.nuevaClave')}</div>;
```

## 🎯 Ejemplos de Uso

### Componente con Traducciones
```tsx
import { useTranslation } from '../hooks/useTranslation';

function TaskCard({ task }) {
  const { t, getTaskStatusTranslation, getPriorityTranslation } = useTranslation();
  
  return (
    <div>
      <h3>{task.title}</h3>
      <p>{t('tasks.status')}: {getTaskStatusTranslation(task.status)}</p>
      <p>{t('tasks.priority')}: {getPriorityTranslation(task.priority)}</p>
      <button>{t('common.edit')}</button>
    </div>
  );
}
```

### Cambio de Idioma
```tsx
import { useTranslation } from '../hooks/useTranslation';

function LanguageSelector() {
  const { currentLanguage, changeLanguage } = useTranslation();
  
  return (
    <div>
      <button 
        onClick={() => changeLanguage('es')}
        className={currentLanguage === 'es' ? 'active' : ''}
      >
        Español
      </button>
      <button 
        onClick={() => changeLanguage('en')}
        className={currentLanguage === 'en' ? 'active' : ''}
      >
        English
      </button>
    </div>
  );
}
```

## 🔄 Actualización Automática

### Cambio Instantáneo
Cuando cambias el idioma, todos los componentes que usan el hook `useTranslation` se actualizan automáticamente sin necesidad de recargar la página.

### Sistema de Eventos
El sistema utiliza eventos personalizados para notificar cambios de idioma a todos los componentes:
- **Evento personalizado**: `app-language-change`
- **Evento de almacenamiento**: `storage` para componentes que no usan el hook directamente

### Hook Adicional
Para componentes que necesitan reaccionar a cambios de idioma pero no usan traducciones:
```tsx
import { useLanguageChange } from '../hooks/useLanguageChange';

function MyComponent() {
  const { currentLanguage, isEnglish, isSpanish } = useLanguageChange();
  
  return <div>Current language: {currentLanguage}</div>;
}
```

## 🎨 Integración con UI

El sistema está integrado en:
- ✅ **SettingsModal**: Selector de idioma
- ✅ **TaskModal**: Formularios de tareas
- ✅ **Sidebar**: Navegación completa
- ✅ **TaskList**: Lista de tareas
- ✅ **Header**: Barra superior con filtros y búsqueda
- ✅ **TaskBoard**: Tablero Kanban con columnas
- ✅ **TaskCard**: Tarjetas de tareas individuales
- ✅ **ArchivedTasksView**: Vista de tareas archivadas
- ✅ **App.tsx**: Componente principal
- 🔄 **Otros componentes**: En progreso

## 🚀 Próximos Pasos

1. **Traducir más componentes**: Extender a todos los componentes de la aplicación
2. **Traducciones dinámicas**: Cargar traducciones desde API
3. **Más idiomas**: Agregar soporte para otros idiomas
4. **Pluralización**: Manejar plurales correctamente
5. **Formateo de fechas**: Traducir formatos de fecha según el idioma
