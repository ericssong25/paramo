import { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskBoard from './components/TaskBoard';
import ProjectModal from './components/ProjectModal';
import TaskModal from './components/TaskModal';
import TaskView from './components/TaskView';
import ProjectHub from './components/ProjectHub';
import CampaignDashboard from './components/CampaignDashboard';
import ApprovalCenter from './components/ApprovalCenter';
import LoginModal from './components/LoginModal';
import SettingsModal from './components/SettingsModal';
import NotificationsModal from './components/NotificationsModal';
import Snackbar from './components/Snackbar';
import { useProjects, useTasks, useContentItems, useProfiles } from './hooks/useSupabase';
import { useAuth } from './hooks/useAuth';
import { convertSupabaseProjectToProject, convertSupabaseTaskToTask, convertSupabaseContentItemToContentItem } from './utils/typeConverters';
import { Project, Task, ContentItem, User, TaskStatus, Campaign, Client, Approval, TaskFilter } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import ContentCalendar from './components/ContentCalendar';
import SupabaseErrorComponent from './components/SupabaseError';
import { 
  mockUsers, 
  mockCampaigns, 
  mockClients, 
  mockApprovals 
} from './data/mockData';

function App() {
  // Hooks de Supabase
  const { projects: supabaseProjects, loading: projectsLoading, error: projectsError, createProject, updateProject } = useProjects();
  const { tasks: supabaseTasks, loading: tasksLoading, error: tasksError, createTask, updateTask, deleteTask, updateSubtaskPositions, createSubtask, updateSubtask, deleteSubtask } = useTasks();
  const { contentItems: supabaseContentItems, loading: contentLoading, error: contentError } = useContentItems();
  const { profiles: supabaseProfiles, loading: profilesLoading, error: profilesError } = useProfiles();

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
  const [campaigns] = useLocalStorage<Campaign[]>('pm_campaigns', mockCampaigns);
  const [clients] = useLocalStorage<Client[]>('pm_clients', mockClients);
  const [approvals, setApprovals] = useLocalStorage<Approval[]>('pm_approvals', mockApprovals);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskViewOpen, setIsTaskViewOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TaskFilter>({});

  // Current user (in a real app, this would come from auth)
  // const currentUser = users[0];

  // Convert Supabase data to app format
  const tasks = useMemo(() => {
    const base = supabaseTasks.map(task => convertSupabaseTaskToTask(task, supabaseProfiles));
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
  }, [supabaseTasks, supabaseProfiles, subtaskOrderByTaskId]);

  const projects = useMemo(() => {
    return supabaseProjects.map(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.status === 'done').length;
      
      return {
        ...convertSupabaseProjectToProject(project),
        taskCount: projectTasks.length,
        completedTasks: completedTasks
      };
    });
  }, [supabaseProjects, tasks]);

  const contentItems = useMemo(() => {
    return supabaseContentItems.map(item => convertSupabaseContentItemToContentItem(item, supabaseProfiles));
  }, [supabaseContentItems, supabaseProfiles]);

  // Find current project
  const currentProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) || null : null;

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by project
    if (selectedProjectId) {
      filtered = filtered.filter(task => task.projectId === selectedProjectId);
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

    return filtered;
  }, [tasks, selectedProjectId, searchQuery, filter]);

  // Task management functions
  const handleCreateTask = () => {
    setSelectedTask(undefined);
    setIsTaskModalOpen(true);
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
      if (selectedTask) {
        // Update existing task
        await updateTask(selectedTask.id, {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          assignee_id: taskData.assignee?.id || null,
          due_date: taskData.dueDate?.toISOString().split('T')[0],
          project_id: selectedProjectId || taskData.projectId || selectedTask.projectId,
          tags: taskData.tags,
        });
      } else {
        // Create new task
        await createTask({
          title: taskData.title!,
          description: taskData.description,
          status: taskData.status || 'todo',
          priority: taskData.priority || 'normal',
          assignee_id: taskData.assignee?.id || null,
          due_date: taskData.dueDate?.toISOString().split('T')[0],
          project_id: taskData.projectId || selectedProjectId || projects[0]?.id,
          tags: taskData.tags || [],
        });
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

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      console.log('🔄 Cambiando estado de tarea:', taskId, 'a', newStatus);
      
      await updateTask(taskId, { status: newStatus });
      
      // Mostrar snackbar con el nuevo estado
      const statusMessages = {
        'todo': 'Tarea marcada como pendiente',
        'in-progress': 'Tarea marcada como en progreso',
        'review': 'Tarea marcada para revisión',
        'done': 'Tarea marcada como completada'
      };
      
      showSnackbar(statusMessages[newStatus] || 'Estado actualizado', 'success');
      
      // Cerrar el modal de vista de tarea
      setIsTaskViewOpen(false);
      
    } catch (error) {
      console.error('❌ Error al cambiar estado de tarea:', error);
      showSnackbar('Error al actualizar estado de tarea', 'error');
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

      // Actualizar supabaseTasks localmente
      supabaseTasks.forEach(t => {
        if (t.id === taskId && t.task_subtasks) {
          const subtask = t.task_subtasks.find(s => s.id === subtaskId);
          if (subtask) {
            subtask.completed = newCompleted;
          }
        }
      });

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

      // Actualizar supabaseTasks localmente
      supabaseTasks.forEach(t => {
        if (t.id === taskId) {
          if (!t.task_subtasks) t.task_subtasks = [];
          t.task_subtasks.push({
            id: tempId,
            title,
            completed: false,
            created_at: new Date().toISOString(),
            position
          });
        }
      });

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

        // Actualizar ID en supabaseTasks
        supabaseTasks.forEach(t => {
          if (t.id === taskId && t.task_subtasks) {
            const subtask = t.task_subtasks.find(s => s.id === tempId);
            if (subtask) {
              subtask.id = savedSubtask.id;
            }
          }
        });
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

      // Actualizar supabaseTasks localmente
      supabaseTasks.forEach(t => {
        if (t.id === taskId && t.task_subtasks) {
          t.task_subtasks = t.task_subtasks.filter(s => s.id !== subtaskId);
        }
      });

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
          final_due_date: projectData.finalDueDate?.toISOString().split('T')[0],
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
          final_due_date: projectData.finalDueDate?.toISOString().split('T')[0],
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
          final_due_date: projectData.finalDueDate?.toISOString().split('T')[0],
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

  const handleEditContent = (content: ContentItem) => {
    console.log('Edit content:', content);
  };

  const handleConvertTaskToContent = (task: Task) => {
    console.log('Convert task to content:', task);
  };

  const handleApprovalAction = (approvalId: string, action: 'approve' | 'reject', feedback?: string) => {
    setApprovals(prev => prev.map(approval => 
      approval.id === approvalId 
        ? { 
            ...approval, 
            status: action === 'approve' ? 'approved' : 'changes-requested',
            feedback: feedback || approval.feedback,
            respondedAt: new Date()
          } as Approval
        : approval
    ));
  };

  // Loading states
  const isLoading = projectsLoading || tasksLoading || contentLoading || profilesLoading || authLoading;

  // Error states
  const hasError = projectsError || tasksError || contentError || profilesError;

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

    // Si hay un proyecto seleccionado, mostrar ProjectHub
    if (selectedProjectId && currentProject) {
      return (
        <ProjectHub
          project={currentProject}
          tasks={filteredTasks}
          contentItems={contentItems}
          users={users}
          onTaskClick={handleViewTask}
          onEditTask={handleEditTask}
          onCreateTask={handleCreateTask}
          onCreateContent={handleCreateContent}
          onEditContent={handleEditContent}
          onEditProject={handleEditProject}
          onBackToOverview={handleBackToOverview}
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
            onEditContent={handleEditContent}
            onConvertTaskToContent={handleConvertTaskToContent}
          />
        );
      case 'campaigns':
        return (
          <CampaignDashboard
            campaigns={campaigns}
            contentItems={contentItems}
          />
        );
      case 'approvals':
        return (
          <ApprovalCenter
            approvals={approvals}
            contentItems={contentItems}
            clients={clients}
            users={users}
            onApprovalAction={handleApprovalAction}
          />
        );
      default:
        return (
          <TaskBoard
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onTaskClick={handleViewTask}
            onCreateTask={handleCreateTask}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
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
      />

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
            user={user}
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
            {contentError && (
              <SupabaseErrorComponent 
                error={contentError} 
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

        {/* Main Content Area */}
        <div className={`flex-1 overflow-auto ${selectedProjectId ? '' : 'p-6'}`}>
          {renderMainContent()}
        </div>
      </div>

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
        users={users}
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
        users={users}
      />

      {/* Task View Modal */}
      {selectedTask && (
        <TaskView
          task={selectedTask}
          isOpen={isTaskViewOpen}
          onClose={() => setIsTaskViewOpen(false)}
          onEdit={() => handleEditTask(selectedTask)}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onToggleSubtask={handleToggleSubtask}
          onAddSubtask={handleAddSubtask}
          onDeleteSubtask={handleDeleteSubtask}
          onReorderSubtasks={handleReorderSubtasks}
          users={users}
          authorProfileId={supabaseProfiles.find(p => p.user_id === user?.id)?.id}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={handleCloseSettings}
        user={user}
        onLogout={handleLogout}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={handleCloseNotifications}
      />

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