export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'member' | 'viewer';
}

export type ProjectType = 'finite' | 'recurring';
export type ProjectStatus = 'planning' | 'in-progress' | 'paused' | 'completed' | 'recurring-active';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  members: User[];
  taskCount: number;
  completedTasks: number;
  
  // Nueva estructura
  type: ProjectType;
  status: ProjectStatus;
  client?: string;
  projectLead?: User;
  
  // Para proyectos finitos
  objective?: string;
  scope?: any[]; // JSONB en Supabase
  milestones?: Milestone[];
  finalDueDate?: Date;
  
  // Para proyectos recurrentes  
  serviceCycle?: 'monthly' | 'weekly' | 'quarterly';
  reportingDay?: number; // Día del mes para reportes
  monthlyDeliverables?: any[]; // JSONB en Supabase
  
  // Integración con documentación
  driveLink?: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  description?: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: User;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  timeTracked: number; // in minutes
  tags: any[]; // JSONB en Supabase
  subtasks: Subtask[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  position?: number;
}

export type ContentType = 'post' | 'story' | 'video' | 'article' | 'campaign';
export type ContentPlatform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'blog';
export type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  platform: ContentPlatform;
  status: ContentStatus;
  scheduledDate?: Date;
  publishedDate?: Date;
  content: string;
  mediaUrls: any[]; // JSONB en Supabase
  hashtags: any[]; // JSONB en Supabase
  mentions: any[]; // JSONB en Supabase
  engagementMetrics?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  createdAt: Date;
  updatedAt: Date;
  assignee?: User;
  projectId: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'awareness' | 'engagement' | 'conversion' | 'retention';
  status: 'planning' | 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate: Date;
  budget?: number;
  platforms: string[];
  targetAudience: string;
  kpis: string[];
  contentItems: string[]; // Content item IDs
  metrics?: {
    reach: number;
    impressions: number;
    engagement: number;
    conversions: number;
    roi: number;
  };
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  avatar: string;
  role: string;
  projects: string[]; // Project IDs
  lastActivity: Date;
  communicationPreference: 'email' | 'slack' | 'teams' | 'phone';
}

export interface Approval {
  id: string;
  itemId: string; // Content or task ID
  itemType: 'content' | 'task' | 'campaign';
  status: 'pending' | 'approved' | 'rejected' | 'changes-requested';
  approver: User | Client;
  feedback?: string;
  requestedAt: Date;
  respondedAt?: Date;
  projectId: string;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee?: string[];
  project?: string[];
  overdue?: boolean;
  // Nuevos filtros
  dueFrom?: string; // 'YYYY-MM-DD'
  dueTo?: string;   // 'YYYY-MM-DD'
  sortBy?: 'dueDate' | 'priority' | 'status' | 'createdAt' | 'title';
  sortDir?: 'asc' | 'desc';
  contentType?: string[];
  platform?: string[];
  campaign?: string[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

// Tipos para Supabase
export interface SupabaseProfile {
  id: string;
  user_id: string;
  name: string;
  avatar: string | null;
  role: 'admin' | 'member' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface SupabaseProject {
  id: string;
  name: string;
  description: string | null;
  color: string;
  type: 'finite' | 'recurring';
  status: 'planning' | 'in-progress' | 'paused' | 'completed' | 'recurring-active';
  client: string | null;
  project_lead_id: string | null;
  objective: string | null;
  scope: any | null;
  final_due_date: string | null;
  service_cycle: 'monthly' | 'weekly' | 'quarterly' | null;
  reporting_day: number | null;
  monthly_deliverables: any | null;
  drive_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseTask {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignee_id: string | null;
  due_date: string | null;
  project_id: string;
  time_tracked: number;
  tags: any | null;
  created_at: string;
  updated_at: string;
  task_subtasks?: {
    id: string;
    title: string;
    completed: boolean;
    created_at: string;
    position: number | null;
  }[];
}

export interface SupabaseContentItem {
  id: string;
  title: string;
  description: string | null;
  type: 'post' | 'story' | 'video' | 'article' | 'campaign';
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'blog';
  status: 'draft' | 'review' | 'approved' | 'scheduled' | 'published';
  scheduled_date: string | null;
  published_date: string | null;
  assignee_id: string | null;
  project_id: string;
  content: string | null;
  media_urls: any | null;
  hashtags: any | null;
  mentions: any | null;
  engagement_metrics: any | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseTaskComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
}