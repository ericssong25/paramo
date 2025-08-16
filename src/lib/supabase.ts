import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hznvcktueznfvpulkmby.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bnZja3R1ZXpuZnZwdWxrbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI5NzQsImV4cCI6MjA3MDE0ODk3NH0.XcbkBFtBTRanC-CoYsFhtSJeZMKmx9-fwVm9rQW7m7w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para las tablas de Supabase
export interface Database {
  public: {
    Tables: {
      user_preferences: {
        Row: {
          id: string
          user_id: string
          task_view: 'board' | 'list'
          theme: 'light' | 'dark' | 'system'
          language: 'en' | 'es'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_view?: 'board' | 'list'
          theme?: 'light' | 'dark' | 'system'
          language?: 'en' | 'es'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_view?: 'board' | 'list'
          theme?: 'light' | 'dark' | 'system'
          language?: 'en' | 'es'
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          avatar: string | null
          role: 'admin' | 'member' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          avatar?: string | null
          role?: 'admin' | 'member' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          avatar?: string | null
          role?: 'admin' | 'member' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          type: 'finite' | 'recurring'
          status: 'planning' | 'in-progress' | 'paused' | 'completed' | 'recurring-active'
          client: string | null
          project_lead_id: string | null
          objective: string | null
          scope: any | null
          final_due_date: string | null
          service_cycle: 'monthly' | 'weekly' | 'quarterly' | null
          reporting_day: number | null
          monthly_deliverables: any | null
          drive_link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          type: 'finite' | 'recurring'
          status?: 'planning' | 'in-progress' | 'paused' | 'completed' | 'recurring-active'
          client?: string | null
          project_lead_id?: string | null
          objective?: string | null
          scope?: any | null
          final_due_date?: string | null
          service_cycle?: 'monthly' | 'weekly' | 'quarterly' | null
          reporting_day?: number | null
          monthly_deliverables?: any | null
          drive_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          type?: 'finite' | 'recurring'
          status?: 'planning' | 'in-progress' | 'paused' | 'completed' | 'recurring-active'
          client?: string | null
          project_lead_id?: string | null
          objective?: string | null
          scope?: any | null
          final_due_date?: string | null
          service_cycle?: 'monthly' | 'weekly' | 'quarterly' | null
          reporting_day?: number | null
          monthly_deliverables?: any | null
          drive_link?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in-progress' | 'corrections' | 'review' | 'done'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          assignee_id: string | null
          due_date: string | null
          project_id: string
          time_tracked: number
          tags: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'corrections' | 'review' | 'done'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          assignee_id?: string | null
          due_date?: string | null
          project_id: string
          time_tracked?: number
          tags?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'corrections' | 'review' | 'done'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          assignee_id?: string | null
          due_date?: string | null
          project_id?: string
          time_tracked?: number
          tags?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      content_items: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'post' | 'story' | 'video' | 'article'
          platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'blog'
          status: 'draft' | 'review' | 'approved' | 'scheduled' | 'published'
          scheduled_date: string | null
          published_date: string | null
          assignee_id: string | null
          project_id: string
          content: string | null
          media_urls: any | null
          hashtags: any | null
          mentions: any | null
          engagement_metrics: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: 'post' | 'story' | 'video' | 'article'
          platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'blog'
          status?: 'draft' | 'review' | 'approved' | 'scheduled' | 'published'
          scheduled_date?: string | null
          published_date?: string | null
          assignee_id?: string | null
          project_id: string
          content?: string | null
          media_urls?: any | null
          hashtags?: any | null
          mentions?: any | null
          engagement_metrics?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: 'post' | 'story' | 'video' | 'article'
          platform?: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'blog'
          status?: 'draft' | 'review' | 'approved' | 'scheduled' | 'published'
          scheduled_date?: string | null
          published_date?: string | null
          assignee_id?: string | null
          project_id?: string
          content?: string | null
          media_urls?: any | null
          hashtags?: any | null
          mentions?: any | null
          engagement_metrics?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      task_subtasks: {
        Row: {
          id: string
          task_id: string
          title: string
          completed: boolean
          created_at: string
          position: number | null
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          completed?: boolean
          created_at?: string
          position?: number | null
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          completed?: boolean
          created_at?: string
          position?: number | null
        }
      }
             task_comments: {
         Row: {
           id: string
           task_id: string
           author_id: string
           content: string
           created_at: string
         }
         Insert: {
           id?: string
           task_id: string
           author_id: string
           content: string
           created_at?: string
         }
         Update: {
           id?: string
           task_id?: string
           author_id?: string
           content?: string
           created_at?: string
         }
       }
       subscriptions: {
         Row: {
           id: string
           service_name: string
           subscription_type: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'
           currency: string
           status: 'active' | 'paused' | 'cancelled' | 'expired' | 'pending'
           last_renewal_date: string
           next_due_date: string
           payment_method: string
           responsible_id: string | null
           notes: string | null
           alerts: boolean
           management_url: string | null
           access_credentials: string | null
           cost: number
           project_id: string | null
           created_at: string
           updated_at: string
         }
         Insert: {
           id?: string
           service_name: string
           subscription_type: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'
           currency?: string
           status?: 'active' | 'paused' | 'cancelled' | 'expired' | 'pending'
           last_renewal_date: string
           next_due_date: string
           payment_method: string
           responsible_id?: string | null
           notes?: string | null
           alerts?: boolean
           management_url?: string | null
           access_credentials?: string | null
           cost: number
           project_id?: string | null
           created_at?: string
           updated_at?: string
         }
         Update: {
           id?: string
           service_name?: string
           subscription_type?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'
           currency?: string
           status?: 'active' | 'paused' | 'cancelled' | 'expired' | 'pending'
           last_renewal_date?: string
           next_due_date?: string
           payment_method?: string
           responsible_id?: string | null
           notes?: string | null
           alerts?: boolean
           management_url?: string | null
           access_credentials?: string | null
           cost?: number
           project_id?: string | null
           created_at?: string
           updated_at?: string
         }
       }
       subscription_payments: {
         Row: {
           id: string
           subscription_id: string
           payment_date: string
           amount: number
           currency: string
           payment_method: string
           transaction_id: string | null
           notes: string | null
           created_at: string
         }
         Insert: {
           id?: string
           subscription_id: string
           payment_date: string
           amount: number
           currency?: string
           payment_method: string
           transaction_id?: string | null
           notes?: string | null
           created_at?: string
         }
         Update: {
           id?: string
           subscription_id?: string
           payment_date?: string
           amount?: number
           currency?: string
           payment_method?: string
           transaction_id?: string | null
           notes?: string | null
           created_at?: string
         }
       }
    }
  }
}
