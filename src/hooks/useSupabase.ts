import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/supabase'
import { useSupabaseError } from './useSupabaseError'
import { SupabaseTask } from '../types'

// Tipos extraídos de la base de datos
type Profile = Database['public']['Tables']['profiles']['Row']
type Project = Database['public']['Tables']['projects']['Row']
// Removed unused Task alias
type ContentItem = Database['public']['Tables']['content_items']['Row']

// Hook para obtener todos los proyectos
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { error, handleError, clearError } = useSupabaseError()

  console.log('🔗 Hook useProjects: Verificando conexión con Supabase...');
  console.log('🔗 Supabase Auth:', supabase.auth.getSession());

  const fetchProjects = async () => {
    try {
      setLoading(true)
      clearError()
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        handleError(supabaseError)
        return
      }
      setProjects(data || [])
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (project: Database['public']['Tables']['projects']['Insert']) => {
    try {
      console.log('🔄 Hook: Iniciando creación de proyecto en Supabase...');
      console.log('📋 Datos del proyecto a insertar:', project);
      
      clearError()
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single()

      console.log('📡 Respuesta de Supabase:', { data, error: supabaseError });

      if (supabaseError) {
        console.error('❌ Error de Supabase al crear proyecto:', supabaseError);
        handleError(supabaseError)
        throw supabaseError
      }
      
      console.log('✅ Proyecto creado exitosamente en Supabase:', data);
      setProjects(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('❌ Error general al crear proyecto:', err);
      handleError(err)
      throw err
    }
  }

  const updateProject = async (id: string, updates: Database['public']['Tables']['projects']['Update']) => {
    try {
      clearError()
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) {
        handleError(supabaseError)
        throw supabaseError
      }
      setProjects(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      clearError()
      const { error: supabaseError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        handleError(supabaseError)
        throw supabaseError
      }
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // Realtime projects
  useEffect(() => {
    const channel = supabase
      .channel('realtime-projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        const evt = (payload as any).eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        const n: any = (payload as any).new
        const o: any = (payload as any).old
        if (evt === 'DELETE' && o?.id) {
          setProjects(prev => prev.filter(p => p.id !== o.id))
        } else if ((evt === 'INSERT' || evt === 'UPDATE') && n?.id) {
          setProjects(prev => {
            const exists = prev.some(p => p.id === n.id)
            return exists ? prev.map(p => (p.id === n.id ? n : p)) : [n, ...prev]
          })
        }
      })
      .subscribe()
    return () => { try { supabase.removeChannel(channel) } catch {} }
  }, [])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}

// Hook para obtener tareas
export const useTasks = () => {
  const [tasks, setTasks] = useState<SupabaseTask[]>([])
  const [loading, setLoading] = useState(true)
  const { error, handleError, clearError } = useSupabaseError()

  const fetchTasks = async () => {
    try {
      setLoading(true)
      clearError()
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_subtasks (
            id,
            title,
            completed,
            created_at,
            position
          )
        `)
        .order('created_at', { ascending: false })
        .order('position', { ascending: true, foreignTable: 'task_subtasks' })
        .order('created_at', { ascending: true, foreignTable: 'task_subtasks' })

      if (supabaseError) {
        handleError(supabaseError)
        return [] as SupabaseTask[]
      }
      setTasks((data as unknown as SupabaseTask[]) || [])
      return (data as unknown as SupabaseTask[]) || []
    } catch (err) {
      handleError(err)
      return [] as SupabaseTask[]
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (task: Database['public']['Tables']['tasks']['Insert']) => {
    try {
      clearError()
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .insert(task)
        .select(`
          *,
          task_subtasks (
            id,
            title,
            completed,
            created_at
          )
        `)
        .single()

      if (supabaseError) {
        handleError(supabaseError)
        throw supabaseError
      }
      setTasks(prev => [data as unknown as SupabaseTask, ...prev])
      return data
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const updateTask = async (id: string, updates: Database['public']['Tables']['tasks']['Update']) => {
    try {
      clearError()
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          task_subtasks (
            id,
            title,
            completed,
            created_at
          )
        `)
        .single()

      if (supabaseError) {
        handleError(supabaseError)
        throw supabaseError
      }
      setTasks(prev => prev.map(t => t.id === id ? (data as unknown as SupabaseTask) : t))
      return data
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      clearError()
      const { error: supabaseError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        handleError(supabaseError)
        throw supabaseError
      }
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const updateSubtaskPositions = async (orderedIds: string[]) => {
    try {
      clearError()
      // Update each row individually to avoid accidental inserts requiring NOT NULL columns
      const updates = orderedIds.map((id, index) =>
        supabase.from('task_subtasks').update({ position: index }).eq('id', id)
      )
      const results = await Promise.all(updates)
      const firstError = results.find(r => r.error)?.error
      if (firstError) {
        handleError(firstError)
        throw firstError
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const createSubtask = async (subtask: Database['public']['Tables']['task_subtasks']['Insert']) => {
    try {
      clearError()
      const { data, error: supabaseError } = await supabase
        .from('task_subtasks')
        .insert(subtask)
        .select()
        .single()
      if (supabaseError) {
        handleError(supabaseError)
        throw supabaseError
      }
      return data
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const updateSubtask = async (id: string, updates: Database['public']['Tables']['task_subtasks']['Update']) => {
    try {
      clearError()
      const { data, error: supabaseError } = await supabase
        .from('task_subtasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (supabaseError) {
        handleError(supabaseError)
        throw supabaseError
      }
      return data
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const deleteSubtask = async (id: string) => {
    try {
      clearError()
      const { error: supabaseError } = await supabase
        .from('task_subtasks')
        .delete()
        .eq('id', id)
      if (supabaseError) {
        handleError(supabaseError)
        throw supabaseError
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const getTasksByProject = (projectId: string) => {
    return tasks.filter(task => task.id && task.project_id === projectId)
  }

  const getTasksByAssignee = (assigneeId: string) => {
    return tasks.filter(task => task.assignee_id === assigneeId)
  }

  const setLocalTasks = (updater: (prev: SupabaseTask[]) => SupabaseTask[]) => {
    setTasks(prev => updater(prev))
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Realtime subscription for tasks and task_subtasks
  useEffect(() => {
    const hydrateTask = async (taskId: string) => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            task_subtasks (
              id,
              title,
              completed,
              created_at,
              position
            )
          `)
          .eq('id', taskId)
          .single()
        if (!error && data) {
          setTasks(prev => {
            const exists = prev.some(t => t.id === taskId)
            if (exists) {
              return prev.map(t => (t.id === taskId ? (data as unknown as SupabaseTask) : t))
            }
            return [data as unknown as SupabaseTask, ...prev]
          })
        }
      } catch (e) {
        // swallow
      }
    }

    const channel = supabase
      .channel('realtime-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        const eventType = (payload as any).eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        const newRow: any = (payload as any).new
        const oldRow: any = (payload as any).old
        if (eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== oldRow?.id))
        } else if (eventType === 'INSERT' || eventType === 'UPDATE') {
          hydrateTask(newRow?.id)
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_subtasks' }, (payload) => {
        const eventType = (payload as any).eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        const newRow: any = (payload as any).new
        const oldRow: any = (payload as any).old
        const taskId = newRow?.task_id || oldRow?.task_id
        if (!taskId) return

        setTasks(prev => prev.map(t => {
          if (t.id !== taskId) return t
          const subs = t.task_subtasks ? [...t.task_subtasks] : []
          if (eventType === 'INSERT' && newRow) {
            if (!subs.find(s => s.id === newRow.id)) subs.push({
              id: newRow.id,
              title: newRow.title,
              completed: newRow.completed,
              created_at: newRow.created_at,
              position: newRow.position ?? null,
            })
          } else if (eventType === 'UPDATE' && newRow) {
            for (let i = 0; i < subs.length; i++) {
              if (subs[i].id === newRow.id) {
                subs[i] = {
                  id: newRow.id,
                  title: newRow.title,
                  completed: newRow.completed,
                  created_at: newRow.created_at,
                  position: newRow.position ?? null,
                }
                break
              }
            }
          } else if (eventType === 'DELETE' && oldRow) {
            const idx = subs.findIndex(s => s.id === oldRow.id)
            if (idx !== -1) subs.splice(idx, 1)
          }
          // sort by position then created_at
          subs.sort((a, b) => {
            if (a.position != null && b.position != null) return a.position - b.position
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          })
          return { ...t, task_subtasks: subs }
        }))
      })
      .subscribe()

    return () => {
      try { supabase.removeChannel(channel) } catch { /* ignore */ }
    }
  }, [])

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateSubtaskPositions,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    getTasksByProject,
    getTasksByAssignee,
    setLocalTasks,
  }
}

// Hook para obtener contenido
export const useContentItems = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const { error, handleError, clearError } = useSupabaseError()

  const fetchContentItems = async () => {
    try {
      setLoading(true)
      clearError()
      const { data, error: supabaseError } = await supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        handleError(supabaseError)
        return
      }
      setContentItems(data || [])
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const createContentItem = async (contentItem: Database['public']['Tables']['content_items']['Insert']) => {
    try {
      clearError()
      const { data, error: supabaseError } = await supabase
        .from('content_items')
        .insert(contentItem)
        .select()
        .single()

      if (supabaseError) {
        handleError(supabaseError)
        throw supabaseError
      }
      setContentItems(prev => [data, ...prev])
      return data
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const updateContentItem = async (id: string, updates: Database['public']['Tables']['content_items']['Update']) => {
    try {
      clearError()
      const { data, error: supabaseError } = await supabase
        .from('content_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) {
        handleError(supabaseError)
        throw supabaseError
      }
      setContentItems(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const deleteContentItem = async (id: string) => {
    try {
      clearError()
      const { error: supabaseError } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        handleError(supabaseError)
        throw supabaseError
      }
      setContentItems(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const getContentItemsByProject = (projectId: string) => {
    return contentItems.filter(item => item.project_id === projectId)
  }

  useEffect(() => {
    fetchContentItems()
  }, [])

  // Realtime for content_items
  useEffect(() => {
    const channel = supabase
      .channel('realtime-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, (payload) => {
        const evt = (payload as any).eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        const n: any = (payload as any).new
        const o: any = (payload as any).old
        if (evt === 'DELETE' && o?.id) {
          setContentItems(prev => prev.filter(c => c.id !== o.id))
        } else if ((evt === 'INSERT' || evt === 'UPDATE') && n?.id) {
          setContentItems(prev => {
            const exists = prev.some(c => c.id === n.id)
            return exists ? prev.map(c => (c.id === n.id ? n : c)) : [n, ...prev]
          })
        }
      })
      .subscribe()
    return () => { try { supabase.removeChannel(channel) } catch {} }
  }, [])

  return {
    contentItems,
    loading,
    error,
    fetchContentItems,
    createContentItem,
    updateContentItem,
    deleteContentItem,
    getContentItemsByProject
  }
}

// Hook para obtener perfiles de usuario
export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const { error, handleError, clearError } = useSupabaseError()

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      clearError()
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        handleError(supabaseError)
        return
      }
      setProfiles(data || [])
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  // Realtime for profiles
  useEffect(() => {
    const channel = supabase
      .channel('realtime-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        const evt = (payload as any).eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        const n: any = (payload as any).new
        const o: any = (payload as any).old
        if (evt === 'DELETE' && o?.id) {
          setProfiles(prev => prev.filter(p => p.id !== o.id))
        } else if ((evt === 'INSERT' || evt === 'UPDATE') && n?.id) {
          setProfiles(prev => {
            const exists = prev.some(p => p.id === n.id)
            return exists ? prev.map(p => (p.id === n.id ? n : p)) : [n, ...prev]
          })
        }
      })
      .subscribe()
    return () => { try { supabase.removeChannel(channel) } catch {} }
  }, [])

  return {
    profiles,
    loading,
    error,
    fetchProfiles
  }
}

// Hook para comentarios de tareas
export const useComments = () => {
  type CommentRow = Database['public']['Tables']['task_comments']['Row']
  const [commentsByTask, setCommentsByTask] = useState<Record<string, CommentRow[]>>({})
  const { handleError, clearError } = useSupabaseError()

  const fetchCommentsForTask = async (taskId: string) => {
    try {
      clearError()
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })
      if (error) return
      setCommentsByTask(prev => ({ ...prev, [taskId]: data || [] }))
    } catch (e) {
      // swallow
    }
  }

  const addComment = async (taskId: string, authorId: string, content: string) => {
    try {
      clearError()
      const { data, error } = await supabase
        .from('task_comments')
        .insert({ task_id: taskId, author_id: authorId, content })
        .select()
        .single()
      if (error) throw error
      if (data) {
        setCommentsByTask(prev => ({
          ...prev,
          [taskId]: [...(prev[taskId] || []), data]
        }))
      }
      return data
    } catch (e) {
      handleError(e)
      throw e
    }
  }

  const updateComment = async (commentId: string, content: string) => {
    try {
      clearError()
      const { data, error } = await supabase
        .from('task_comments')
        .update({ content })
        .eq('id', commentId)
        .select()
        .single()
      if (error) throw error
      if (data) {
        const taskId = (data as CommentRow).task_id
        setCommentsByTask(prev => ({
          ...prev,
          [taskId]: (prev[taskId] || []).map(c => (c.id === commentId ? (data as CommentRow) : c))
        }))
      }
      return data
    } catch (e) {
      handleError(e)
      throw e
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      clearError()
      const { data, error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId)
        .select()
        .single()
      if (error) throw error
      if (data) {
        const taskId = (data as CommentRow).task_id
        setCommentsByTask(prev => ({
          ...prev,
          [taskId]: (prev[taskId] || []).filter(c => c.id !== commentId)
        }))
      }
    } catch (e) {
      handleError(e)
      throw e
    }
  }

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('realtime-task-comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_comments' }, (payload) => {
        const evt = (payload as any).eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        const n: any = (payload as any).new
        const o: any = (payload as any).old
        const taskId = n?.task_id || o?.task_id
        if (!taskId) return
        setCommentsByTask(prev => {
          const current = [...(prev[taskId] || [])]
          if (evt === 'INSERT' && n) {
            if (!current.find(c => c.id === n.id)) current.push(n)
          } else if (evt === 'UPDATE' && n) {
            for (let i = 0; i < current.length; i++) {
              if (current[i].id === n.id) { current[i] = n; break }
            }
          } else if (evt === 'DELETE' && o) {
            const idx = current.findIndex(c => c.id === o.id)
            if (idx !== -1) current.splice(idx, 1)
          }
          current.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          return { ...prev, [taskId]: current }
        })
      })
      .subscribe()
    return () => { try { supabase.removeChannel(channel) } catch {} }
  }, [])

  return { commentsByTask, fetchCommentsForTask, addComment, updateComment, deleteComment }
}

// Hook para preferencias de usuario
export const usePreferences = () => {
  type PreferenceRow = Database['public']['Tables']['user_preferences']['Row']
  type PreferenceInsert = Database['public']['Tables']['user_preferences']['Insert']
  type PreferenceUpdate = Database['public']['Tables']['user_preferences']['Update']

  const [preferencesByUser, setPreferencesByUser] = useState<Record<string, PreferenceRow>>({})
  const { handleError, clearError } = useSupabaseError()

  const fetchPreferencesForUser = async (userId: string) => {
    try {
      clearError()
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      if (error) return
      if (data) {
        setPreferencesByUser(prev => ({ ...prev, [userId]: data }))
      }
      return data || null
    } catch (e) {
      // swallow
      return null
    }
  }

  const upsertPreferences = async (userId: string, updates: PreferenceUpdate | PreferenceInsert) => {
    try {
      clearError()
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({ user_id: userId, ...(updates as any) }, { onConflict: 'user_id' })
        .select()
        .single()
      if (error) throw error
      if (data) {
        setPreferencesByUser(prev => ({ ...prev, [userId]: data }))
      }
      return data
    } catch (e) {
      handleError(e)
      throw e
    }
  }

  // Realtime para preferencias
  useEffect(() => {
    const channel = supabase
      .channel('realtime-user-preferences')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_preferences' }, (payload) => {
        const evt = (payload as any).eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        const n: any = (payload as any).new
        const o: any = (payload as any).old
        const userId = n?.user_id || o?.user_id
        if (!userId) return
        setPreferencesByUser(prev => {
          const copy = { ...prev }
          if (evt === 'DELETE') {
            delete copy[userId]
          } else if (evt === 'INSERT' || evt === 'UPDATE') {
            copy[userId] = n
          }
          return copy
        })
      })
      .subscribe()
    return () => { try { supabase.removeChannel(channel) } catch {} }
  }, [])

  return { preferencesByUser, fetchPreferencesForUser, upsertPreferences }
}

// Exportar el hook de suscripciones
export { useSubscriptions } from './useSubscriptions'