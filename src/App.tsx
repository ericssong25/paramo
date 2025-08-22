import { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskBoard from './components/TaskBoard';
import ProjectModal from './components/ProjectModal';
import TaskModal from './components/TaskModal';
import ProjectSelectionModal from './components/ProjectSelectionModal';
import TaskView from './components/TaskView';
import ProjectHub from './components/ProjectHub';
import Team from './components/Team';
import SubscriptionDashboard from './components/SubscriptionDashboard';
// import ApprovalCenter from './components/ApprovalCenter';
import LoginModal from './components/LoginModal';
import SettingsModal from './components/SettingsModal';
import NotificationsModal from './components/NotificationsModal';
import Snackbar from './components/Snackbar';
import { useProjects, useTasks, useProfiles, usePreferences, useSubscriptions, useComments, useSupabase } from './hooks/useSupabase';
import { useContent } from './hooks/useContent';
import { useStorage } from './hooks/useStorage';
import { useAuth } from './hooks/useAuth';
import { useTranslation } from './hooks/useTranslation';
import { convertSupabaseProjectToProject, convertSupabaseTaskToTask } from './utils/typeConverters';
import { formatDateForSupabase } from './utils/dateUtils';
import { Project, Task, ContentItem, User, TaskStatus, TaskFilter, Subscription, TaskFile } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import ContentCalendar from './components/ContentCalendar';
import FinancesDashboard from './components/FinancesDashboard';
import TransactionsList from './components/TransactionsList.tsx';
import TaskList from './components/TaskList';
import SupabaseErrorComponent from './components/SupabaseError';
import TaskReviewModal from './components/TaskReviewModal';
import TaskReturnModal from './components/TaskReturnModal';
import ConvertToContentModal from './components/ConvertToContentModal';
import ContentViewModal from './components/ContentViewModal';
import EditContentModal from './components/EditContentModal';
import DeleteContentConfirmationModal from './components/DeleteContentConfirmationModal';
import ArchivedTasksView from './components/ArchivedTasksView';
import { 
  mockUsers 
} from './data/mockData';
import BottomNav from './components/BottomNav';

function App() {
  // Hooks de Supabase
  const { projects: supabaseProjects, loading: projectsLoading, error: projectsError, createProject, updateProject } = useProjects();
  const { tasks: supabaseTasks, loading: tasksLoading, error: tasksError, createTask, updateTask, deleteTask, updateSubtaskPositions, createSubtask, updateSubtask, deleteSubtask, setLocalTasks } = useTasks();
  const { addComment } = useComments();
  const { getTaskStatusTranslation } = useTranslation();

  const { profiles: supabaseProfiles, loading: profilesLoading, error: profilesError, updateProfile } = useProfiles();
  const { fetchPreferencesForUser, upsertPreferences } = usePreferences();
  const { subscriptions, loading: subscriptionsLoading, error: subscriptionsError, createSubscription, updateSubscription, deleteSubscription } = useSubscriptions();
  const { deleteFilesByTask } = useStorage();
    const {
    contentItems: newContentItems,
    loading: newContentLoading,
    error: newContentError,
    convertTaskToContent,
    archiveTask,
    deleteContentItem,
    updateContentItem,
    markAsPublished
  } = useContent();

  // Hook de autenticación
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();

  // Estado de autenticación
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    isOpen: false,
    message: '',
    type: 'info'
  });
  const [subtaskOrderByTaskId, setSubtaskOrderByTaskId] = useState<Record<string, string[]>>({});
  
  const [users] = useLocalStorage<User[]>('pm_users', mockUsers);

  // const [clients] = useLocalStorage<Client[]>('pm_clients', mockClients);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectSelectionModalOpen, setIsProjectSelectionModalOpen] = useState(false);
  const [isTaskViewOpen, setIsTaskViewOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskReviewModalOpen, setIsTaskReviewModalOpen] = useState(false);
  const [taskForReview, setTaskForReview] = useState<Task | null>(null);
  const [isTaskReturnModalOpen, setIsTaskReturnModalOpen] = useState(false);
  const [taskForReturn, setTaskForReturn] = useState<Task | null>(null);
  const [isConvertToContentModalOpen, setIsConvertToContentModalOpen] = useState(false);
  const [taskForConversion, setTaskForConversion] = useState<Task | null>(null);
  const [isContentViewModalOpen, setIsContentViewModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isEditContentModalOpen, setIsEditContentModalOpen] = useState(false);
  const [isDeleteContentModalOpen, setIsDeleteContentModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<ContentItem | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TaskFilter>({});
  const [taskView, setTaskView] = useState<'board' | 'list'>('board');
  const [statusTab, setStatusTab] = useState<'todo' | 'in-progress' | 'review' | 'done'>('todo');

  // Cargar preferencias del usuario al iniciar sesión
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const prefs = await fetchPreferencesForUser(user.id);
      if (prefs?.task_view === 'list' || prefs?.task_view === 'board') {
        setTaskView(prefs.task_view);
      }
    })();
  }, [user?.id]);

  // Resetear vista cuando se cambia de proyecto
  useEffect(() => {
    if (selectedProjectId) {
      // Si hay un proyecto seleccionado, resetear a la vista de overview
      // Esto se maneja internamente en ProjectHub
    }
  }, [selectedProjectId]);

  const handleTaskViewChange = async (view: 'board' | 'list') => {
    setTaskView(view);
    if (user?.id) {
      try {
        await upsertPreferences(user.id, { user_id: user.id, task_view: view });
      } catch {
        // no-op
      }
    }
  };

  // Current user (in a real app, this would come from auth)
  // const currentUser = users[0];

  // Convert Supabase data to app format
  const tasks = useMemo(() => {
    const base = supabaseTasks.map(task => {
      const converted: any = convertSupabaseTaskToTask(task, supabaseProfiles);
      const prj = supabaseProjects.find(p => p.id === task.project_id);
      if (prj) {
        converted.projectName = prj.name;
        converted.projectColor = prj.color;
      }
      return converted as Task;
    });
    return base.map(t => {
      const order = subtaskOrderByTaskId[t.id];
      if (!order || order.length === 0 || !t.subtasks?.length) return t;
      const subtaskMap = new Map(t.subtasks.map(s => [s.id, s]));
      const ordered = order
        .map(id => subtaskMap.get(id))
        .filter(Boolean) as typeof t.subtasks;
      // agregar cualquier subtask nueva que no esté en order al final
      const remaining = t.subtasks.filter(s => !order.includes(s.id));
      return { ...t, subtasks: [...ordered, ...remaining] };
    });
  }, [supabaseTasks, supabaseProfiles, subtaskOrderByTaskId, supabaseProjects]);

  const projects = useMemo(() => {
    return supabaseProjects.map(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.status === 'done').length;

      const base = convertSupabaseProjectToProject(project);
      const leadProfile = supabaseProfiles.find(p => p.id === (project as any).project_lead_id);
      const projectLead = leadProfile
        ? { id: leadProfile.id, name: leadProfile.name, email: leadProfile.user_id, avatar: leadProfile.avatar || '', role: leadProfile.role }
        : undefined;

      return {
        ...base,
        projectLead,
        taskCount: projectTasks.length,
        completedTasks: completedTasks
      };
    });
  }, [supabaseProjects, tasks, supabaseProfiles]);

  const contentItems = useMemo(() => {
    return newContentItems;
  }, [newContentItems]);

  const selectableUsers = useMemo(() => {
    return supabaseProfiles
      .map(p => ({ id: p.id, name: p.name, email: p.user_id, avatar: p.avatar || '', role: p.role }))
  }, [supabaseProfiles]);

  // Find current project
  const currentProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) || null : null;

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Always exclude archived tasks from this view
    filtered = filtered.filter(task => task.status !== 'archived');

    // Filter by project
    if (selectedProjectId) {
      filtered = filtered.filter(task => task.projectId === selectedProjectId);
    }
    // Filter by multi-project selection when viewing all tasks
    if (!selectedProjectId && filter.project?.length) {
      const allowed = new Set(filter.project)
      filtered = filtered.filter(task => allowed.has(task.projectId))
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some((tag: any) => tag.toLowerCase().includes(query))
      );
    }

    // Apply additional filters
    if (filter.status?.length) {
      filtered = filtered.filter(task => filter.status!.includes(task.status));
    }

    if (filter.priority?.length) {
      filtered = filtered.filter(task => filter.priority!.includes(task.priority));
    }

    if (filter.assignee?.length) {
      filtered = filtered.filter(task => 
        task.assignee && filter.assignee!.includes(task.assignee.id)
      );
    }

    if (filter.overdue) {
      const now = new Date();
      filtered = filtered.filter(task => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'done'
      );
    }

    // Due date range
    if (filter.dueFrom) {
      const from = new Date(filter.dueFrom + 'T00:00:00');
      filtered = filtered.filter(task => task.dueDate ? new Date(task.dueDate) >= from : false);
    }
    if (filter.dueTo) {
      const to = new Date(filter.dueTo + 'T23:59:59');
      filtered = filtered.filter(task => task.dueDate ? new Date(task.dueDate) <= to : false);
    }

    // Sorting
    if (filter.sortBy) {
      const dir = filter.sortDir === 'desc' ? -1 : 1;
      const by = filter.sortBy;
      const priorityOrder: Record<string, number> = { low: 0, normal: 1, high: 2, urgent: 3 };
      const statusOrder: Record<string, number> = { 'todo': 0, 'in-progress': 1, 'review': 2, 'done': 3 };
      filtered = [...filtered].sort((a, b) => {
        let av: any = 0; let bv: any = 0;
        switch (by) {
          case 'dueDate':
            av = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
            bv = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
            break;
          case 'priority':
            av = priorityOrder[a.priority] ?? 0; bv = priorityOrder[b.priority] ?? 0; break;
          case 'status':
            av = statusOrder[a.status] ?? 0; bv = statusOrder[b.status] ?? 0; break;
          case 'createdAt':
            av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime(); break;
          case 'title':
            return dir * a.title.localeCompare(b.title);
        }
        return dir * (av - bv);
      });
    }

    return filtered;
  }, [tasks, selectedProjectId, searchQuery, filter]);

  const tabbedTasks = useMemo(() => {
    return filteredTasks.filter(task => task.status === statusTab);
  }, [filteredTasks, statusTab]);

  const statusCounts = useMemo(() => {
    const counts: Record<'todo' | 'in-progress' | 'review' | 'done', number> = {
      'todo': 0,
      'in-progress': 0,
      'review': 0,
      'done': 0,
    };
    for (const task of filteredTasks) {
      if (task.status in counts) counts[task.status as keyof typeof counts]++;
    }
    return counts;
  }, [filteredTasks]);

  const renderStatusTabs = () => (
    <div className="mb-3 md:mb-4 md:hidden">
      <div className="flex gap-2 overflow-auto no-scrollbar">
        {(['todo','in-progress','review','done'] as const).map(s => {
          const active = statusTab === s;
          return (
            <button
              key={s}
              onClick={() => setStatusTab(s)}
              className={`px-3 py-1.5 rounded-full text-sm border whitespace-nowrap ${active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
              {getTaskStatusTranslation(s)}
              <span className={`ml-2 inline-block text-xs rounded-full px-1.5 ${active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{statusCounts[s]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Task management functions
  const handleCreateTask = () => {
    // Si estamos en "All Tasks", mostrar modal de selección de proyecto
    if (!selectedProjectId) {
      setIsProjectSelectionModalOpen(true);
    } else {
      // Si ya hay un proyecto seleccionado, ir directo a crear tarea
      setSelectedTask(undefined);
      setIsTaskModalOpen(true);
    }
  };

  const handleProjectSelected = (projectId: string | null) => {
    setIsProjectSelectionModalOpen(false);
    setSelectedTask(undefined);
    setIsTaskModalOpen(true);
    // Guardar el proyecto seleccionado temporalmente para la tarea
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskViewOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };



  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      console.log('🔄 App: handleSaveTask iniciado');
      console.log('📅 Due Date recibido:', taskData.dueDate);
      console.log('📅 Due Date formateado para Supabase:', formatDateForSupabase(taskData.dueDate));
      
      if (selectedTask) {
        console.log('🔄 App: Actualizando tarea existente:', selectedTask.id);
        // Update existing task
        const updateData = {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          assignee_id: taskData.assignee?.id || null,
          due_date: formatDateForSupabase(taskData.dueDate),
          project_id: selectedProjectId || taskData.projectId || selectedTask.projectId,
          tags: taskData.tags,
        };
        console.log('📤 App: Datos a enviar a Supabase:', updateData);
        
        await updateTask(selectedTask.id, updateData as any);
        console.log('✅ App: Tarea actualizada exitosamente');
      } else {
        // Create new task
        await createTask({
          title: taskData.title!,
          description: taskData.description,
          status: taskData.status || 'todo',
          priority: taskData.priority || 'normal',
          assignee_id: taskData.assignee?.id || null,
          due_date: formatDateForSupabase(taskData.dueDate),
          project_id: taskData.projectId || selectedProjectId || projects[0]?.id,
          tags: taskData.tags || [],
        } as any);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Wrapper functions for ArchivedTasksView
  const handleUpdateTask = async (taskId: string, updates: any) => {
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTaskForArchived = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Profile management
  const currentUserProfile = useMemo(() => {
    if (!user?.id) return undefined;
    const profile = supabaseProfiles.find(profile => profile.user_id === user.id);
    return profile ? {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar || undefined
    } : undefined;
  }, [user?.id, supabaseProfiles]);

  const handleUpdateProfile = async (updates: { name: string; avatar?: string }) => {
    if (!currentUserProfile) {
      console.error('No user profile found');
      return;
    }

    try {
      await updateProfile(currentUserProfile.id, updates);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleMarkForReview = (task: Task) => {
    setTaskForReview(task);
    setIsTaskReviewModalOpen(true);
  };

  const handleReviewSubmit = async (taskId: string, files: TaskFile[], notes?: string) => {
    try {
      const updateData = {
        status: 'review' as const,
        completed_files: files,
        review_date: new Date().toISOString(),
        review_notes: notes || null,
      };
      
      await updateTask(taskId, updateData);
      setSnackbar({ 
        isOpen: true,
        message: `Tarea marcada para revisión${files.length > 0 ? ` con ${files.length} archivo${files.length > 1 ? 's' : ''}` : ''}`, 
        type: 'success' 
      });
    } catch (error) {
      setSnackbar({ isOpen: true, message: 'Error al marcar la tarea para revisión', type: 'error' });
      throw error;
    }
  };

  const handleReturnTask = (task: Task) => {
    setTaskForReturn(task);
    setIsTaskReturnModalOpen(true);
  };

  const handleReturnSubmit = async (comment?: string) => {
    if (!taskForReturn) return;
    
    try {
      console.log('🔄 Devolviendo tarea para correcciones:', taskForReturn.id);
      
      // Verificar si la tarea tiene archivos para eliminar
      const hasFiles = taskForReturn.completedFiles && taskForReturn.completedFiles.length > 0;
      
      if (hasFiles) {
        console.log('🗑️ Eliminando archivos de tarea devuelta para correcciones:', taskForReturn.id);
        await deleteFilesByTask(taskForReturn.id);
      }
      
      // Actualizar el estado de la tarea y limpiar archivos
      await updateTask(taskForReturn.id, { 
        status: 'corrections' as const,
        completed_files: null,
        review_notes: null
      } as any);
      
      // Si hay comentario, agregarlo a los comentarios de la tarea
      if (comment && comment.trim()) {
        const authorId = supabaseProfiles.find(p => p.user_id === user?.id)?.id || 'anonymous-profile-id';
        await addComment(taskForReturn.id, authorId, `🔄 **Tarea devuelta para correcciones**\n\n${comment.trim()}`);
      }
      
      setSnackbar({
        isOpen: true,
        message: comment && comment.trim() 
          ? 'Tarea devuelta a In Progress con observaciones'
          : 'Tarea devuelta a In Progress exitosamente',
        type: 'success'
      });
      
      // Cerrar modal y limpiar estado
      setIsTaskReturnModalOpen(false);
      setTaskForReturn(null);
    } catch (error) {
      console.error('❌ Error al devolver tarea:', error);
      setSnackbar({ isOpen: true, message: 'Error al devolver la tarea', type: 'error' });
      throw error;
    }
  };



  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      console.log('🔄 Cambiando estado de tarea:', taskId, 'a', newStatus);
      
      // Obtener la tarea actual para verificar si tiene archivos
      const currentTask = tasks.find(t => t.id === taskId);
      const hasFiles = currentTask?.completedFiles && currentTask.completedFiles.length > 0;
      
      // Si la tarea está pasando de "review" a "corrections" (devuelta para correcciones) y tiene archivos, eliminarlos
      if (currentTask?.status === 'review' && newStatus === 'corrections' && hasFiles) {
        console.log('🗑️ Eliminando archivos de tarea devuelta para correcciones:', taskId);
        await deleteFilesByTask(taskId);
        
        // Actualizar la tarea para limpiar los archivos
        await updateTask(taskId, { 
          status: newStatus,
          completed_files: null,
          review_notes: null
        } as any);
      } else {
        // Actualización normal sin eliminar archivos
        await updateTask(taskId, { status: newStatus } as any);
      }
      
      // Mostrar snackbar con el nuevo estado
      const statusMessages = {
        'todo': 'Tarea marcada como pendiente',
        'in-progress': 'Tarea marcada como en progreso',
        'corrections': 'Tarea marcada para correcciones',
        'review': 'Tarea marcada para revisión',
        'done': 'Tarea marcada como completada',
        'archived': 'Tarea archivada'
      };
      
      showSnackbar(statusMessages[newStatus] || 'Estado actualizado', 'success');
      
      // Cerrar el modal de vista de tarea
      setIsTaskViewOpen(false);
      
    } catch (error) {
      console.error('❌ Error al cambiar estado de tarea:', error);
      showSnackbar('Error al actualizar estado de tarea', 'error');
    }
  };

  // Funciones para convertir tareas a contenido
  const handleConvertToContent = (task: Task) => {
    setTaskForConversion(task);
    setIsConvertToContentModalOpen(true);
  };

  const handleArchiveTask = async (task: Task) => {
    try {
      await archiveTask(task.id);
      showSnackbar('Tarea archivada exitosamente', 'success');
    } catch (error) {
      console.error('Error archiving task:', error);
      showSnackbar('Error al archivar tarea', 'error');
    }
  };

  const handleConvertSubmit = async (taskId: string, contentData: {
    content_type: ContentItem['content_type'];
    platforms: ContentItem['platforms'];
    categories: string[];
    copy_text?: string;
    publish_date?: Date;
  }) => {
    try {
      await convertTaskToContent(taskId, contentData);
      showSnackbar('Tarea convertida a contenido exitosamente', 'success');
      setIsConvertToContentModalOpen(false);
      setTaskForConversion(null);
    } catch (error) {
      console.error('Error converting task to content:', error);
      showSnackbar('Error al convertir tarea a contenido', 'error');
    }
  };

  // Funciones para manejar contenido
  const handleViewContent = (content: ContentItem) => {
    setSelectedContent(content);
    setIsContentViewModalOpen(true);
  };

  const handleEditContent = (content: ContentItem) => {
    setSelectedContent(content);
    setIsEditContentModalOpen(true);
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      await deleteContentItem(contentId);
      showSnackbar('Contenido eliminado exitosamente', 'success');
      
      // Cerrar el modal del contenido después de eliminar
      setIsContentViewModalOpen(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('Error deleting content:', error);
      showSnackbar('Error al eliminar contenido', 'error');
    }
  };

  const handleShowDeleteConfirmation = (content: ContentItem) => {
    setContentToDelete(content);
    setIsDeleteContentModalOpen(true);
  };

  const handleSaveContent = async (contentId: string, contentData: {
    content_type: ContentItem['content_type'];
    platforms: ContentItem['platforms'];
    categories: ContentItem['categories'];
    copy_text?: string;
    publish_date?: Date;
    title?: string;
    description?: string;
    status?: ContentItem['status'];
  }) => {
    try {
      await updateContentItem(contentId, contentData);
      showSnackbar('Contenido actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error updating content:', error);
      showSnackbar('Error al actualizar contenido', 'error');
    }
  };

  const handleMarkAsPublished = async (contentId: string) => {
    try {
      await markAsPublished(contentId);
      showSnackbar('Contenido marcado como publicado exitosamente', 'success');
    } catch (error) {
      console.error('Error marking content as published:', error);
      showSnackbar('Error al marcar como publicado', 'error');
    }
  };

  const handleDownloadContentFile = async (file: TaskFile) => {
    try {
      const { supabase } = useSupabase();
      
      if (!file.path) {
        showSnackbar('Error: Ruta del archivo no encontrada', 'error');
        return;
      }
      
      // Descargar el archivo directamente usando el método de TaskView
      const { data, error } = await supabase.storage
        .from('task-files')
        .download(file.path);
      
      if (error) {
        console.error('Error downloading file:', error);
        showSnackbar('Error al descargar archivo', 'error');
        return;
      }
      
      // Crear URL del blob y descargar
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSnackbar('Descarga iniciada', 'success');
    } catch (error) {
      console.error('Error downloading content file:', error);
      showSnackbar('Error al descargar archivo', 'error');
    }
  };

  const handleDownloadAllContentFiles = async (files: TaskFile[]) => {
    if (!files || files.length === 0) return;
    
    try {
      for (const file of files) {
        await handleDownloadContentFile(file);
        // Pequeña pausa entre descargas para evitar problemas del navegador
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      showSnackbar('Descarga de todos los archivos completada', 'success');
    } catch (error) {
      console.error('Error downloading all content files:', error);
      showSnackbar('Error al descargar todos los archivos', 'error');
    }
  };

  // Funciones para Subtareas
  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    try {
      // 1. Actualizar UI optimistamente
      const currentTask = tasks.find(t => t.id === taskId);
      const subtask = currentTask?.subtasks.find(s => s.id === subtaskId);
      if (!subtask) return;

      const newCompleted = !subtask.completed;
      
      // Actualizar selectedTask si coincide
      setSelectedTask(prev => {
        if (!prev || prev.id !== taskId) return prev;
        return {
          ...prev,
          subtasks: prev.subtasks.map(s => 
            s.id === subtaskId ? { ...s, completed: newCompleted } : s
          )
        };
      });

      // Actualizar supabaseTasks inmutablemente para forzar re-render inmediato
      setLocalTasks(prev => prev.map(t => {
        if (t.id !== taskId) return t
        const subs = t.task_subtasks ? t.task_subtasks.map(s => s.id === subtaskId ? { ...s, completed: newCompleted } : s) : []
        return { ...t, task_subtasks: subs }
      }))

      // 2. Persistir en background
      await updateSubtask(subtaskId, { completed: newCompleted });
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleAddSubtask = async (taskId: string, title: string) => {
    try {
      const current = tasks.find(t => t.id === taskId);
      const position = current ? current.subtasks.length : 0;
      const tempId = `temp-${Date.now()}`;
      const newSubtask = { 
        id: tempId, 
        title, 
        completed: false, 
        createdAt: new Date(), 
        position 
      };

      // 1. Actualizar UI optimistamente
      setSelectedTask(prev => {
        if (!prev || prev.id !== taskId) return prev;
        return {
          ...prev,
          subtasks: [...prev.subtasks, newSubtask]
        };
      });

      // Actualizar supabaseTasks inmutablemente (optimista)
      setLocalTasks(prev => prev.map(t => {
        if (t.id !== taskId) return t
        const existing = t.task_subtasks ? [...t.task_subtasks] : []
        return { ...t, task_subtasks: [...existing, { id: tempId, title, completed: false, created_at: new Date().toISOString(), position }] }
      }))

      // 2. Persistir en background
      const savedSubtask = await createSubtask({ 
        task_id: taskId, 
        title, 
        completed: false, 
        position 
      });

      // 3. Actualizar IDs localmente (temp -> real)
      if (savedSubtask) {
        setSelectedTask(prev => {
          if (!prev || prev.id !== taskId) return prev;
          return {
            ...prev,
            subtasks: prev.subtasks.map(s => 
              s.id === tempId ? { ...s, id: savedSubtask.id } : s
            )
          };
        });

        // Actualizar ID en supabaseTasks de forma inmutable
        setLocalTasks(prev => prev.map(t => {
          if (t.id !== taskId) return t
          const subs = (t.task_subtasks || []).map(s => s.id === tempId ? { ...s, id: savedSubtask.id } : s)
          return { ...t, task_subtasks: subs }
        }))
      }

      showSnackbar('Subtarea agregada', 'success');
    } catch (error) {
      console.error('Error adding subtask:', error);
      showSnackbar('Error al agregar subtarea', 'error');
    }
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      // 1. Actualizar UI optimistamente
      setSelectedTask(prev => {
        if (!prev || prev.id !== taskId) return prev;
        return { 
          ...prev, 
          subtasks: prev.subtasks.filter(s => s.id !== subtaskId) 
        };
      });

      // Actualizar supabaseTasks inmutablemente
      setLocalTasks(prev => prev.map(t => {
        if (t.id !== taskId) return t
        const subs = (t.task_subtasks || []).filter(s => s.id !== subtaskId)
        return { ...t, task_subtasks: subs }
      }))

      // 2. Persistir en background
      await deleteSubtask(subtaskId);
    } catch (error) {
      console.error('Error deleting subtask:', error);
      showSnackbar('Error al eliminar subtarea', 'error');
    }
  };

  const handleReorderSubtasks = (taskId: string, subtaskIds: string[]) => {
    try {
      setSubtaskOrderByTaskId(prev => ({ ...prev, [taskId]: subtaskIds }));
      // Persist in Supabase in background; no need to await to keep UI snappy
      updateSubtaskPositions(subtaskIds).catch(err => console.error('Persist reorder error:', err));
    } catch (error) {
      console.error('Error reordering subtasks:', error);
    }
  };

  // Funciones de autenticación
  const handleLoginSuccess = () => {
    console.log('✅ Login exitoso, usuario autenticado');
    setShowLoginModal(false);
  };

  const handleShowLogin = () => {
    setShowLoginModal(true);
  };

  const handleLogout = async () => {
    try {
      console.log('🔄 Iniciando proceso de logout...');
      
      // Cerrar modales abiertos
      setShowSettingsModal(false);
      setShowNotificationsModal(false);
      setShowLoginModal(false);
      
      // Limpiar estado de la aplicación
      setSelectedProjectId(null);
      setActiveView('tasks');
      setSelectedTask(undefined);
      setSnackbar({ isOpen: false, message: '', type: 'info' });
      
      await signOut();
      console.log('✅ Logout exitoso');
      
      // Mostrar mensaje de confirmación
      showSnackbar('Sesión cerrada exitosamente', 'success');
      
    } catch (error) {
      console.error('❌ Error en logout:', error);
      showSnackbar('Error al cerrar sesión', 'error');
    }
  };

  // Funciones para SettingsModal
  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
  };

  // Funciones para NotificationsModal
  const handleOpenNotifications = () => {
    setShowNotificationsModal(true);
  };

  const handleCloseNotifications = () => {
    setShowNotificationsModal(false);
  };

  // Funciones para Snackbar
  const showSnackbar = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbar({
      isOpen: true,
      message,
      type
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, isOpen: false }));
  };

  const handleCreateProject = () => {
    setSelectedProject(undefined);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const handleBackToOverview = () => {
    setSelectedProjectId(null);
    setActiveView('tasks');
  };

  const handleNavigateToContentCalendar = () => {
    setSelectedProjectId(null);
    setActiveView('content');
  };

  const handleSaveProject = async (projectData: Partial<Project>) => {
    try {
      console.log('🔄 Iniciando guardado de proyecto...');
      console.log('📋 Datos del proyecto recibidos:', projectData);
      
      if (selectedProject) {
        console.log('✏️ Actualizando proyecto existente:', selectedProject.id);
        // Update existing project
        await updateProject(selectedProject.id, {
          name: projectData.name,
          description: projectData.description,
          color: projectData.color,
          type: projectData.type,
          status: projectData.status,
          client: projectData.client,
          project_lead_id: projectData.projectLead?.id || null,
          objective: projectData.objective,
          scope: projectData.scope,
          final_due_date: formatDateForSupabase(projectData.finalDueDate),
          service_cycle: projectData.serviceCycle,
          reporting_day: projectData.reportingDay,
          monthly_deliverables: projectData.monthlyDeliverables,
          drive_link: projectData.driveLink,
        });
        console.log('✅ Proyecto actualizado exitosamente');
      } else {
        console.log('🆕 Creando nuevo proyecto...');
        console.log('📝 Datos a enviar a Supabase:', {
          name: projectData.name!,
          description: projectData.description,
          color: projectData.color || '#3B82F6',
          type: projectData.type!,
          status: projectData.status || 'planning',
          client: projectData.client,
          project_lead_id: projectData.projectLead?.id || null,
          objective: projectData.objective,
          scope: projectData.scope,
          final_due_date: formatDateForSupabase(projectData.finalDueDate),
          service_cycle: projectData.serviceCycle,
          reporting_day: projectData.reportingDay,
          monthly_deliverables: projectData.monthlyDeliverables,
          drive_link: projectData.driveLink,
        });
        
        // Create new project
        const newProject = await createProject({
          name: projectData.name!,
          description: projectData.description,
          color: projectData.color || '#3B82F6',
          type: projectData.type!,
          status: projectData.status || 'planning',
          client: projectData.client,
          project_lead_id: projectData.projectLead?.id || null,
          objective: projectData.objective,
          scope: projectData.scope,
          final_due_date: formatDateForSupabase(projectData.finalDueDate),
          service_cycle: projectData.serviceCycle,
          reporting_day: projectData.reportingDay,
          monthly_deliverables: projectData.monthlyDeliverables,
          drive_link: projectData.driveLink,
        });
        
        console.log('✅ Proyecto creado exitosamente:', newProject);
        setIsProjectModalOpen(false);
        setSelectedProject(undefined);
      }
    } catch (error) {
      console.error('❌ Error al guardar proyecto:', error);
      console.error('🔍 Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
    }
  };

  const handleCreateContent = () => {
    console.log('Create content');
  };



  const handleConvertTaskToContent = (task: Task) => {
    console.log('Convert task to content:', task);
  };

  const handleChangeAssignee = async (taskId: string, assigneeId: string | null) => {
    try {
      await updateTask(taskId, { assignee_id: assigneeId });
    } catch (e) {
      console.error('Error updating assignee', e);
      showSnackbar('Error al cambiar asignado', 'error');
    }
  };

  // approvals removed

  // Funciones para manejar suscripciones
  const handleAddSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createSubscription(subscriptionData);
      showSnackbar('Suscripción creada exitosamente', 'success');
    } catch (error) {
      console.error('Error adding subscription:', error);
      showSnackbar('Error al crear suscripción', 'error');
    }
  };

  const handleEditSubscription = async (id: string, updates: Partial<Subscription>) => {
    try {
      await updateSubscription(id, updates);
      showSnackbar('Suscripción actualizada exitosamente', 'success');
    } catch (error) {
      console.error('Error updating subscription:', error);
      showSnackbar('Error al actualizar suscripción', 'error');
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    try {
      await deleteSubscription(subscriptionId);
      showSnackbar('Suscripción eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting subscription:', error);
      showSnackbar('Error al eliminar suscripción', 'error');
    }
  };

  const handleViewSubscription = (subscription: Subscription) => {
    // TODO: Implementar vista detallada de suscripción
    console.log('View subscription:', subscription);
  };

  const handleUpdateCredentials = async (subscriptionId: string, credentials: { username: string; password?: string }) => {
    try {
      await updateSubscription(subscriptionId, {
        accessCredentials: credentials
      });
      showSnackbar('Credenciales actualizadas correctamente', 'success');
    } catch (error) {
      console.error('Error updating credentials:', error);
      showSnackbar('Error al actualizar credenciales', 'error');
    }
  };

  // Loading states
  const isLoading = projectsLoading || tasksLoading || newContentLoading || profilesLoading || subscriptionsLoading || authLoading;

  // Error states
  const hasError = projectsError || tasksError || newContentError || profilesError || subscriptionsError;

  // Si está cargando la autenticación, mostrar loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar pantalla de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#12173b] flex flex-col items-center">
        <div className="flex-1 flex items-center justify-center">
          <img 
            src="/branding/login1.svg" 
            alt="Páramo" 
            className="mx-auto w-96 h-64 object-contain opacity-0 animate-fade-in-scale" 
          />
        </div>
        <div className="mb-16">
          <button
            onClick={handleShowLogin}
            className="bg-white text-[#12173b] px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            Iniciar Sesión
          </button>
        </div>
        
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      );
    }

    // Si hay un proyecto seleccionado y estamos en vista de tareas, mostrar ProjectHub
    if (selectedProjectId && currentProject && activeView === 'tasks') {
      return (
        <ProjectHub
          project={currentProject}
          tasks={filteredTasks}
          contentItems={contentItems}
          users={selectableUsers}
          onTaskClick={handleViewTask}
          onEditTask={handleEditTask}
          onCreateTask={handleCreateTask}
          onCreateContent={handleCreateContent}
          onViewContent={handleViewContent}
          onEditProject={handleEditProject}
          onBackToOverview={handleBackToOverview}
          onNavigateToContentCalendar={handleNavigateToContentCalendar}
          onMarkAsPublished={handleMarkAsPublished}
        />
      );
    }

    // Si no hay proyecto seleccionado, mostrar las vistas normales
    switch (activeView) {
      case 'content':
        return (
                      <ContentCalendar
              contentItems={contentItems}
              tasks={tasks}
              onCreateContent={handleCreateContent}
              onViewContent={handleViewContent}
              onConvertTaskToContent={handleConvertTaskToContent}
              onViewTask={handleViewTask}
              onMarkAsPublished={handleMarkAsPublished}
            />
        );
      case 'subscriptions':
        return (
          <SubscriptionDashboard
            subscriptions={subscriptions}
            loading={subscriptionsLoading}
            profiles={supabaseProfiles.map(profile => ({
              id: profile.id,
              name: profile.name,
              email: profile.user_id, // Usar user_id como email temporal
              avatar: profile.avatar || undefined,
              role: profile.role
            }))}
            projects={supabaseProjects.map(project => ({
              id: project.id,
              name: project.name,
              description: project.description || undefined
            }))}
            onAddSubscription={handleAddSubscription}
            onEditSubscription={handleEditSubscription}
            onDeleteSubscription={handleDeleteSubscription}
            onViewSubscription={handleViewSubscription}
            onUpdateCredentials={handleUpdateCredentials}
          />
        );
      case 'finances':
        return (
          <FinancesDashboard
            openingBalance={0}
            baseCurrency={Intl.NumberFormat().resolvedOptions().currency || 'USD'}
            transactions={[]}
          />
        );
      case 'finances-transactions':
        return (
          <TransactionsList />
        );
      // approvals removed
      case 'team':
        return <Team />;
      case 'archived':
        return (
          <ArchivedTasksView 
            tasks={tasks}
            projects={projects}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTaskForArchived}
            isLoading={tasksLoading}
            error={tasksError}
          />
        );
      default:
        return taskView === 'list' ? (
          <>
            {renderStatusTabs()}
            <TaskList
              tasks={tabbedTasks}
              onTaskClick={handleViewTask}
            />
          </>
        ) : (
          <TaskBoard
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onTaskClick={handleViewTask}
            onCreateTask={handleCreateTask}
            onMarkForReview={handleMarkForReview}
            onReturnTask={handleReturnTask}
            onConvertToContent={handleConvertToContent}
            onArchiveTask={handleArchiveTask}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block">
      <Sidebar
        projects={projects}
        currentUser={users[0]}
        authenticatedUser={user}
        selectedProject={selectedProjectId}
        activeView={activeView}
        onSelectProject={setSelectedProjectId}
        onViewChange={setActiveView}
        onCreateProject={handleCreateProject}
        onOpenSettings={handleOpenSettings}
        onOpenNotifications={handleOpenNotifications}
        profileName={supabaseProfiles.find(p => p.user_id === user?.id)?.name}
        userAvatar={currentUserProfile?.avatar}
      />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Solo mostrar cuando no hay proyecto seleccionado */}
        {!selectedProjectId && activeView === 'tasks' && (
          <Header
            selectedProject={currentProject}
            filter={filter}
            onFilterChange={setFilter}
            onCreateTask={handleCreateTask}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            taskView={taskView}
            onTaskViewChange={handleTaskViewChange}
            assignees={supabaseProfiles}
            projects={projects}
          />
        )}

        {/* Error Display */}
        {hasError && (
          <div className="p-4">
            {projectsError && (
              <SupabaseErrorComponent 
                error={projectsError} 
                onClose={() => {}} 
                className="mb-2"
              />
            )}
            {tasksError && (
              <SupabaseErrorComponent 
                error={tasksError} 
                onClose={() => {}} 
                className="mb-2"
              />
            )}
            {newContentError && (
              <SupabaseErrorComponent 
                error={newContentError} 
                onClose={() => {}} 
                className="mb-2"
              />
            )}
            {subscriptionsError && (
              <SupabaseErrorComponent 
                error={subscriptionsError} 
                onClose={() => {}} 
                className="mb-2"
              />
            )}
            {profilesError && (
              <SupabaseErrorComponent 
                error={profilesError} 
                onClose={() => {}} 
                className="mb-2"
              />
            )}
          </div>
        )}

        {/* Vista principal: en móvil forzar lista */}
        <div className="flex-1 overflow-auto">
          <div className="md:hidden">
            {activeView === 'tasks' ? (
              <div className="p-3">
                {renderStatusTabs()}
                <TaskList tasks={tabbedTasks} onTaskClick={handleViewTask} />
              </div>
            ) : (
              renderMainContent()
            )}
          </div>
          <div className="hidden md:block">
            {/* Secciones con header consistente no necesitan padding, incluyendo ProjectHub */}
            {(activeView === 'subscriptions' || activeView === 'finances-transactions' || activeView === 'team' || activeView === 'archived' || (selectedProjectId && currentProject && activeView === 'tasks')) ? (
              renderMainContent()
            ) : (
              <div className="p-6">
                {renderMainContent()}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Navigation (mobile) */}
      <BottomNav
        activeView={activeView}
        onViewChange={setActiveView}
        onCreateTask={handleCreateTask}
      />

      {/* Project Selection Modal */}
      <ProjectSelectionModal
        isOpen={isProjectSelectionModalOpen}
        onClose={() => setIsProjectSelectionModalOpen(false)}
        onSelectProject={handleProjectSelected}
        projects={projects}
      />

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(undefined);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        users={selectableUsers}
        projectId={selectedProjectId || projects[0]?.id}
      />

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setSelectedProject(undefined);
        }}
        onSave={handleSaveProject}
        users={selectableUsers}
      />

      {/* Task View Modal */}
      {selectedTask && (
        <TaskView
          task={tasks.find(t => t.id === selectedTask.id) || selectedTask}
          isOpen={isTaskViewOpen}
          onClose={() => setIsTaskViewOpen(false)}
          onEdit={() => { setIsTaskViewOpen(false); handleEditTask(selectedTask); }}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onToggleSubtask={handleToggleSubtask}
          onAddSubtask={handleAddSubtask}
          onDeleteSubtask={handleDeleteSubtask}
          onReorderSubtasks={handleReorderSubtasks}
          users={selectableUsers}
          onChangeAssignee={handleChangeAssignee}
          authorProfileId={supabaseProfiles.find(p => p.user_id === user?.id)?.id}
                      onMarkForReview={handleMarkForReview}
            onReturnTask={handleReturnTask}
          />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={handleCloseSettings}
        user={user}
        onLogout={handleLogout}
        currentProfile={currentUserProfile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={handleCloseNotifications}
      />

              {/* Task Review Modal */}
        {taskForReview && (
          <TaskReviewModal
            isOpen={isTaskReviewModalOpen}
            onClose={() => {
              setIsTaskReviewModalOpen(false);
              setTaskForReview(null);
            }}
            task={taskForReview}
            onMarkForReview={handleReviewSubmit}
          />
        )}

        {/* Task Return Modal */}
        {taskForReturn && (
          <TaskReturnModal
            isOpen={isTaskReturnModalOpen}
            onClose={() => {
              setIsTaskReturnModalOpen(false);
              setTaskForReturn(null);
            }}
            taskTitle={taskForReturn.title}
            onConfirm={handleReturnSubmit}
          />
        )}

        {/* Convert to Content Modal */}
        {taskForConversion && (
          <ConvertToContentModal
            isOpen={isConvertToContentModalOpen}
            onClose={() => {
              setIsConvertToContentModalOpen(false);
              setTaskForConversion(null);
            }}
            task={taskForConversion}
            onConvert={handleConvertSubmit}
          />
        )}

        {/* Content View Modal */}
                    {selectedContent && (
              <ContentViewModal
                isOpen={isContentViewModalOpen}
                onClose={() => {
                  setIsContentViewModalOpen(false);
                  setSelectedContent(null);
                }}
                content={selectedContent}
                                     onEdit={handleEditContent}
                     onDelete={handleShowDeleteConfirmation}
                     onDownloadFile={handleDownloadContentFile}
                     onDownloadAllFiles={handleDownloadAllContentFiles}
                     onMarkAsPublished={handleMarkAsPublished}
              />
            )}

        {/* Edit Content Modal */}
        {selectedContent && (
          <EditContentModal
            isOpen={isEditContentModalOpen}
            onClose={() => {
              setIsEditContentModalOpen(false);
              setSelectedContent(null);
            }}
            content={selectedContent}
            onSave={handleSaveContent}
          />
        )}

        {/* Delete Content Confirmation Modal */}
        {contentToDelete && (
          <DeleteContentConfirmationModal
            isOpen={isDeleteContentModalOpen}
            onClose={() => {
              setIsDeleteContentModalOpen(false);
              setContentToDelete(null);
            }}
            content={contentToDelete}
            onConfirm={handleDeleteContent}
          />
        )}

      {/* Snackbar */}
      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        type={snackbar.type}
        onClose={hideSnackbar}
      />
    </div>
  );
}

export default App;