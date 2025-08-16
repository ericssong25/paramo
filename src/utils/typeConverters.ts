import { User, Project, Task, ContentItem, TaskComment } from '../types';
import { SupabaseProfile, SupabaseProject, SupabaseTask, SupabaseContentItem, SupabaseTaskComment } from '../types';
import { parseSupabaseDate, formatDateForSupabase } from './dateUtils';

// Re-exportar las funciones de fecha para mantener compatibilidad
export { formatDateForSupabase } from './dateUtils';

// Convertir perfil de Supabase a User
export const convertSupabaseProfileToUser = (profile: SupabaseProfile | undefined): User | undefined => {
  if (!profile) return undefined;
  
  return {
    id: profile.id,
    name: profile.name,
    email: profile.user_id, // Usar user_id como email temporalmente
    avatar: profile.avatar || '',
    role: profile.role
  };
};

// Convertir proyecto de Supabase a Project
export const convertSupabaseProjectToProject = (project: SupabaseProject): Project => ({
  id: project.id,
  name: project.name,
  description: project.description || '',
  color: project.color,
  createdAt: new Date(project.created_at),
  updatedAt: new Date(project.updated_at),
  members: [], // TODO: Implementar miembros del proyecto
  taskCount: 0, // Se calculará dinámicamente en App.tsx
  completedTasks: 0, // Se calculará dinámicamente en App.tsx
  type: project.type,
  status: project.status,
  client: project.client || '',
  projectLead: undefined, // TODO: Implementar líder del proyecto
  objective: project.objective || '',
  scope: project.scope || [],
  milestones: [], // TODO: Implementar milestones
  finalDueDate: parseSupabaseDate(project.final_due_date),
  serviceCycle: project.service_cycle || undefined,
  reportingDay: project.reporting_day || 0,
  monthlyDeliverables: project.monthly_deliverables || [],
  driveLink: project.drive_link || '',
});

// Convertir tarea de Supabase a Task
export const convertSupabaseTaskToTask = (task: SupabaseTask, profiles: SupabaseProfile[]): Task => {
  const convertedTask = {
    id: task.id,
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    assignee: task.assignee_id 
      ? convertSupabaseProfileToUser(profiles.find(p => p.id === task.assignee_id))
      : undefined,
    dueDate: parseSupabaseDate(task.due_date),
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at),
    projectId: task.project_id,
    timeTracked: task.time_tracked,
    tags: task.tags || [],
    subtasks: task.task_subtasks?.map(subtask => ({
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
      createdAt: new Date(subtask.created_at),
      position: subtask.position ?? undefined,
    })) || [],
    completedFiles: task.completed_files || [],
    reviewDate: task.review_date ? new Date(task.review_date) : undefined,
    reviewNotes: task.review_notes || undefined,
  };
  
  return convertedTask;
};

// Convertir contenido de Supabase a ContentItem
export const convertSupabaseContentItemToContentItem = (
  item: SupabaseContentItem, 
  profiles: SupabaseProfile[]
): ContentItem => ({
  id: item.id,
  title: item.title,
  description: item.description || '',
  type: item.type,
  platform: item.platform,
  status: item.status,
  scheduledDate: item.scheduled_date ? new Date(item.scheduled_date) : undefined,
  publishedDate: item.published_date ? new Date(item.published_date) : undefined,
  assignee: item.assignee_id 
    ? convertSupabaseProfileToUser(profiles.find(p => p.id === item.assignee_id))
    : undefined,
  projectId: item.project_id,
  content: item.content || '',
  mediaUrls: item.media_urls || [],
  hashtags: item.hashtags || [],
  mentions: item.mentions || [],
  engagementMetrics: item.engagement_metrics || {},
  createdAt: new Date(item.created_at),
  updatedAt: new Date(item.updated_at),
});

// Comentarios
export const convertSupabaseCommentToComment = (c: SupabaseTaskComment): TaskComment => ({
  id: c.id,
  taskId: c.task_id,
  authorId: c.author_id,
  content: c.content,
  createdAt: new Date(c.created_at)
});

export const formatRelativeTime = (date: Date): string => {
  const now = new Date().getTime();
  const diffMs = now - date.getTime();
  const secs = Math.floor(diffMs / 1000);
  if (secs < 1) return 'ahora';
  if (secs < 60) return `hace ${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return date.toLocaleDateString();
};
