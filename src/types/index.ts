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

export type TaskStatus = 'todo' | 'in-progress' | 'corrections' | 'review' | 'done' | 'archived';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface TaskFile {
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
  uploaded_by: string;
  path?: string; // Ruta del archivo en Supabase Storage
  file?: File; // Referencia al archivo original (para archivos locales)
}

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
  completedFiles?: TaskFile[];
  reviewDate?: Date;
  reviewNotes?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  position?: number;
}

// Tipos para el nuevo sistema de contenido
export type ContentType = 'reel' | 'carousel' | 'story' | 'static' | 'video' | 'image';
export type ContentPlatform = 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  publish_date?: Date;
  content_type: ContentType;
  platforms: ContentPlatform[];
  categories: string[];
  copy_text?: string;
  media_files: TaskFile[];
  project_id: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  status: ContentStatus;
}

// Tipos para Supabase
export interface SupabaseContentItem {
  id: string;
  title: string;
  description?: string;
  publish_date?: string; // DATE en Supabase
  content_type: ContentType;
  platforms: ContentPlatform[];
  categories: string[];
  copy_text?: string;
  media_files: any; // JSONB en Supabase
  project_id: string;
  created_by?: string;
  created_at: string; // TIMESTAMP en Supabase
  updated_at: string; // TIMESTAMP en Supabase
  status: ContentStatus;
}



export type SubscriptionType = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired' | 'pending';

export interface Subscription {
  id: string;
  serviceName: string;
  subscriptionType: SubscriptionType;
  currency: string;
  status: SubscriptionStatus;
  lastRenewalDate: Date;
  nextDueDate: Date;
  paymentMethod: string;
  responsible: User;
  notes?: string;
  alerts: boolean;
  managementUrl?: string;
  accessCredentials?: {
    username: string;
    password?: string;
  };
  cost: number;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  transactionId?: string;
  notes?: string;
  createdAt: Date;
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
  itemType: 'content' | 'task';
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
  status: 'todo' | 'in-progress' | 'corrections' | 'review' | 'done';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignee_id: string | null;
  due_date: string | null;
  project_id: string;
  time_tracked: number;
  tags: any | null;
  completed_files: any | null;
  review_date: string | null;
  review_notes: string | null;
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
  type: 'post' | 'story' | 'video' | 'article';
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

export interface SupabaseSubscription {
  id: string;
  service_name: string;
  subscription_type: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  currency: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'pending';
  last_renewal_date: string;
  next_due_date: string;
  payment_method: string;
  responsible_id: string | null;
  notes: string | null;
  alerts: boolean;
  management_url: string | null;
  access_credentials: any | null; // JSON: {username: string, password?: string}
  cost: number;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseSubscriptionPayment {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method: string;
  status: 'completed' | 'pending' | 'failed';
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface SupabaseTaskComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
}