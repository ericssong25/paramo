import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Users, 
  Target, 
  Clock, 
  Link, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  ExternalLink,
  Plus,
  Edit,
  Search,
  Flag,
  Image
} from 'lucide-react';
import { Project, User, Task, ContentItem } from '../types';
import ContentCalendar from './ContentCalendar';

interface ProjectHubProps {
  project: Project;
  tasks: Task[];
  contentItems: ContentItem[];
  users: User[];
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onCreateTask: () => void;
  onCreateContent: () => void;
  onViewContent: (content: ContentItem) => void;
  onEditProject: (project: Project) => void;
  onBackToOverview: () => void;
  onNavigateToContentCalendar: () => void;
  onMarkAsPublished?: (contentId: string) => void;
}

const ProjectHub: React.FC<ProjectHubProps> = ({
  project,
  tasks,
  contentItems,
  users,
  onTaskClick,
  onEditTask,
  onCreateTask,
  onCreateContent,
  onViewContent,
  onEditProject,
  onBackToOverview,
  onNavigateToContentCalendar,
  onMarkAsPublished,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'calendar'>('overview');
  const [taskFilters, setTaskFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    dueDate: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Resetear pestaña activa cuando cambia el proyecto
  useEffect(() => {
    setActiveTab('overview');
    // Hacer scroll al principio cuando cambia el proyecto
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [project.id]);

  const projectTasks = tasks.filter(task => task.projectId === project.id);
  const projectContentItems = contentItems.filter(item => item.project_id === project.id);
  

  const completedTasks = projectTasks.filter(task => task.status === 'done');
  const progressPercentage = projectTasks.length > 0 
    ? Math.round((completedTasks.length / projectTasks.length) * 100) 
    : 0;

  // Filter and search functions
  const filteredTasks = projectTasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = taskFilters.status === 'all' || task.status === taskFilters.status;
    const matchesPriority = taskFilters.priority === 'all' || task.priority === taskFilters.priority;
    const matchesAssignee = taskFilters.assignee === 'all' || 
      (task.assignee && task.assignee.id === taskFilters.assignee);
    const matchesDueDate = taskFilters.dueDate === 'all' || 
      (task.dueDate && taskFilters.dueDate === 'overdue' && task.dueDate < new Date()) ||
      (task.dueDate && taskFilters.dueDate === 'today' && task.dueDate.toDateString() === new Date().toDateString()) ||
      (task.dueDate && taskFilters.dueDate === 'upcoming' && task.dueDate > new Date() && task.dueDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesDueDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'corrections': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'review': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'todo': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Circle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'paused': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'recurring-active': return <CheckCircle className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'Planificación';
      case 'in-progress': return 'En Curso';
      case 'paused': return 'Pausado';
      case 'completed': return 'Completado';
      case 'recurring-active': return 'Recurrente Activo';
      default: return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

    return (
    <div ref={containerRef} className="h-full flex flex-col overflow-auto">
      {/* Header del Proyecto - Siempre comprimido */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <div>
                <h1 className="font-bold text-gray-900 text-lg">
                  {project.name}
                </h1>
                <p className="text-sm text-gray-600">{project.client}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackToOverview}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Volver
              </button>
              <button
                onClick={() => onEditProject(project)}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Siempre visibles */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen / Plan
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tareas
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Calendario
            </button>
          </nav>
        </div>
      </div>

             {/* Contenido de las Tabs */}
       <div className="flex-1">
         {activeTab === 'overview' ? (
           <div className="p-6 space-y-6">
             {/* Información Rápida */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="bg-white rounded-lg border border-gray-200 p-4">
                 <div className="flex items-center text-gray-600 mb-2">
                   <Users className="w-4 h-4 mr-2" />
                   <span className="text-sm font-medium">Cliente</span>
                 </div>
                 <p className="text-gray-900 font-semibold">{project.client}</p>
               </div>

               <div className="bg-white rounded-lg border border-gray-200 p-4">
                 <div className="flex items-center text-gray-600 mb-2">
                   <Target className="w-4 h-4 mr-2" />
                   <span className="text-sm font-medium">Estado</span>
                 </div>
                 <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                   {getStatusIcon(project.status)}
                   <span className="ml-1">{getStatusText(project.status)}</span>
                 </div>
               </div>

               <div className="bg-white rounded-lg border border-gray-200 p-4">
                 <div className="flex items-center text-gray-600 mb-2">
                   <Clock className="w-4 h-4 mr-2" />
                   <span className="text-sm font-medium">Progreso</span>
                 </div>
                 <div className="flex items-center">
                   <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                     <div 
                       className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                       style={{ width: `${progressPercentage}%` }}
                     />
                   </div>
                   <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
                 </div>
               </div>

               <div className="bg-white rounded-lg border border-gray-200 p-4">
                 <div className="flex items-center text-gray-600 mb-2">
                   <Calendar className="w-4 h-4 mr-2" />
                   <span className="text-sm font-medium">Tareas</span>
                 </div>
                 <p className="text-gray-900 font-semibold">
                   {completedTasks.length}/{projectTasks.length} completadas
                 </p>
               </div>
             </div>

             {/* Descripción del Proyecto */}
             <div className="bg-white rounded-lg border border-gray-200 p-6">
               <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción del Proyecto</h2>
               <p className="text-gray-700 leading-relaxed">{project.description}</p>
             </div>

             {/* Información General */}
             <div className="bg-white rounded-lg border border-gray-200 p-6">
               <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Líder del Proyecto</label>
                   <div className="flex items-center space-x-3">
                     {project.projectLead ? (
                       <>
                         <img 
                           src={project.projectLead.avatar} 
                           alt={project.projectLead.name}
                           className="w-8 h-8 rounded-full"
                         />
                         <span className="text-gray-900">{project.projectLead.name}</span>
                       </>
                     ) : (
                       <span className="text-gray-500">No asignado</span>
                     )}
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Proyecto</label>
                   <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                     project.type === 'finite' 
                       ? 'bg-blue-100 text-blue-800' 
                       : 'bg-purple-100 text-purple-800'
                   }`}>
                     {project.type === 'finite' ? 'Proyecto Finito' : 'Servicio Recurrente'}
                   </span>
                 </div>

                 {project.type === 'finite' && project.finalDueDate && (
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Entrega Final</label>
                     <span className="text-gray-900">{formatDate(project.finalDueDate)}</span>
                   </div>
                 )}

                 {project.type === 'recurring' && (
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Ciclo de Servicio</label>
                     <span className="text-gray-900 capitalize">{project.serviceCycle}</span>
                   </div>
                 )}
               </div>
             </div>

            {/* Objetivo Principal */}
            {project.objective && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Objetivo Principal</h2>
                <p className="text-gray-700 leading-relaxed">{project.objective}</p>
              </div>
            )}

            {/* Alcance y Entregables */}
            {project.scope && project.scope.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Alcance y Entregables</h2>
                <ul className="space-y-2">
                  {project.scope.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Entregables Mensuales (para proyectos recurrentes) */}
            {project.type === 'recurring' && project.monthlyDeliverables && project.monthlyDeliverables.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Entregables Mensuales</h2>
                <ul className="space-y-2">
                  {project.monthlyDeliverables.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hitos y Fechas Clave */}
            {project.milestones && project.milestones.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Hitos y Fechas Clave</h2>
                <div className="space-y-4">
                  {project.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                          {milestone.description && (
                            <p className="text-sm text-gray-600">{milestone.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">{formatDate(milestone.dueDate)}</span>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          milestone.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {milestone.completed ? 'Completado' : 'Pendiente'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integración con Documentación */}
            {project.driveLink && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentación</h2>
                <a
                  href={project.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Ver Documentos en Google Drive
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            )}
          </div>
        ) : activeTab === 'tasks' ? (
          <div className="p-6">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar tareas..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <div className="relative">
                    <Circle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={taskFilters.status}
                      onChange={(e) => setTaskFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="todo">Pendiente</option>
                      <option value="in-progress">En Progreso</option>
                      <option value="corrections">Correcciones</option>
                      <option value="review">En Revisión</option>
                      <option value="done">Completado</option>
                    </select>
                  </div>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <div className="relative">
                    <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={taskFilters.priority}
                      onChange={(e) => setTaskFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas las prioridades</option>
                      <option value="urgent">Urgente</option>
                      <option value="high">Alta</option>
                      <option value="normal">Normal</option>
                      <option value="low">Baja</option>
                    </select>
                  </div>
                </div>

                {/* Assignee Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asignado</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={taskFilters.assignee}
                      onChange={(e) => setTaskFilters(prev => ({ ...prev, assignee: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los usuarios</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={taskFilters.dueDate}
                      onChange={(e) => setTaskFilters(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas las fechas</option>
                      <option value="overdue">Vencidas</option>
                      <option value="today">Hoy</option>
                      <option value="upcoming">Próximos 7 días</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Results Counter and New Task Button */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Mostrando {filteredTasks.length} de {projectTasks.length} tareas
                {searchQuery && ` que coinciden con "${searchQuery}"`}
              </p>
              <button
                onClick={onCreateTask}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Tarea
              </button>
            </div>
            
            {/* Task List without subtasks */}
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onTaskClick(task)}>
                  {/* Task Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status === 'corrections' ? 'Correcciones' : task.status.replace('-', ' ')}
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.assignee && (
                        <img 
                          src={task.assignee.avatar} 
                          alt={task.assignee.name}
                          className="w-6 h-6 rounded-full object-cover"
                          title={task.assignee.name}
                        />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Task Content */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {task.dueDate && (
                        <span>Vence: {task.dueDate.toLocaleDateString()}</span>
                      )}
                      {task.timeTracked > 0 && (
                        <span>Tiempo: {Math.floor(task.timeTracked / 60)}h {task.timeTracked % 60}m</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
                                   ) : (
            <div className="p-6">
                            <ContentCalendar
                contentItems={projectContentItems}
                tasks={projectTasks}
                onCreateContent={onCreateContent}
                onViewContent={onViewContent}
                onConvertTaskToContent={(task) => {
                  console.log('Convertir tarea a contenido desde ProjectHub:', task);
                  // TODO: Implementar conversión de tarea a contenido en ProjectHub
                  // Por ahora, solo mostrar un mensaje
                  alert('Funcionalidad de conversión de tarea a contenido no implementada en ProjectHub');
                }}
                onViewTask={onTaskClick}
                onMarkAsPublished={onMarkAsPublished}
              />
           </div>
         )}
      </div>
    </div>
  );
};

export default ProjectHub;
