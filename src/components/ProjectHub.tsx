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
  X,
  User as UserIcon,
  DollarSign,
  CalendarDays,
  Settings,
  FileText,
  Briefcase,
  TrendingUp,
  Globe
} from 'lucide-react';
import { Project, User, Task, ContentItem } from '../types';
import ContentCalendar from './ContentCalendar';
import ConsistentHeader from './ConsistentHeader';

// Funciones para manejar formato de fecha dd/mm/yyyy
const formatDateForDisplay = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDateFromDisplay = (dateString: string): Date | null => {
  const cleanString = dateString.replace(/\D/g, '');
  if (cleanString === '') return null;
  if (cleanString.length < 8) return null;
  
  const day = parseInt(cleanString.substring(0, 2), 10);
  const month = parseInt(cleanString.substring(2, 4), 10) - 1;
  const year = parseInt(cleanString.substring(4, 8), 10);
  
  if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
    return null;
  }
  
  const date = new Date(year, month, day);
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null;
  }
  
  return date;
};

const formatDateInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers === '') return '';
  const limitedNumbers = numbers.substring(0, 8);
  
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 4) {
    return `${limitedNumbers.substring(0, 2)}/${limitedNumbers.substring(2)}`;
  } else {
    return `${limitedNumbers.substring(0, 2)}/${limitedNumbers.substring(2, 4)}/${limitedNumbers.substring(4)}`;
  }
};

const createDateFromISO = (isoString: string): Date => {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

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
  onUpdateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
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
  onUpdateProject,
  // onBackToOverview,
  // onNavigateToContentCalendar,
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
  const [isPaymentDayModalOpen, setIsPaymentDayModalOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);

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
    <div ref={containerRef} className="h-full flex flex-col">
      {/* Header del Proyecto usando ConsistentHeader */}
      <ConsistentHeader
        title={
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <div>
              <span className="font-bold text-gray-900 text-lg">
                {project.name}
              </span>
              <p className="text-sm text-gray-600">{project.client}</p>
            </div>
          </div>
        }
        showSearch={false}
        showCreateButton={false}
      >
        <button
          onClick={onCreateTask}
          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Tarea
        </button>
        <button
          onClick={() => onEditProject(project)}
          className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </button>
      </ConsistentHeader>

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
       <div className="flex-1 overflow-auto">
         {activeTab === 'overview' ? (
           <div className="p-6 space-y-6">
             {/* Información Rápida - Rediseñada */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               
               {/* Cliente */}
               <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                 <div className="flex items-center justify-between mb-4">
                   <div className="p-3 bg-blue-500 rounded-xl">
                     <Users className="w-6 h-6 text-white" />
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Cliente</p>
                   </div>
                 </div>
                 <h3 className="text-xl font-bold text-blue-900 truncate">{project.client}</h3>
               </div>

               {/* Estado */}
               <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                 <div className="flex items-center justify-between mb-4">
                   <div className="p-3 bg-purple-500 rounded-xl">
                     <Target className="w-6 h-6 text-white" />
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Estado</p>
                   </div>
                 </div>
                 <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold ${getStatusColor(project.status)}`}>
                   {getStatusIcon(project.status)}
                   <span className="ml-2">{getStatusText(project.status)}</span>
                 </div>
               </div>

               {/* Progreso */}
               <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                 <div className="flex items-center justify-between mb-4">
                   <div className="p-3 bg-green-500 rounded-xl">
                     <TrendingUp className="w-6 h-6 text-white" />
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Progreso</p>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <span className="text-2xl font-bold text-green-900">{progressPercentage}%</span>
                   </div>
                   <div className="w-full bg-green-200 rounded-full h-3">
                     <div 
                       className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                       style={{ width: `${progressPercentage}%` }}
                     />
                   </div>
                 </div>
               </div>

               {/* Tareas */}
               <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                 <div className="flex items-center justify-between mb-4">
                   <div className="p-3 bg-orange-500 rounded-xl">
                     <Calendar className="w-6 h-6 text-white" />
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Tareas</p>
                   </div>
                 </div>
                 <div className="space-y-1">
                   <p className="text-2xl font-bold text-orange-900">
                     {completedTasks.length}/{projectTasks.length}
                   </p>
                   <p className="text-sm font-medium text-orange-700">completadas</p>
                 </div>
               </div>
             </div>

             {/* Descripción del Proyecto - Rediseñada */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 border-b border-gray-100">
                 <div className="flex items-center space-x-3">
                   <div className="p-2 bg-indigo-100 rounded-lg">
                     <FileText className="w-5 h-5 text-indigo-600" />
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-gray-900">Descripción del Proyecto</h2>
                     <p className="text-sm text-gray-600">Información general y contexto</p>
                   </div>
                 </div>
               </div>
               <div className="p-6">
                 <p className="text-gray-700 leading-relaxed text-lg">{project.description}</p>
               </div>
             </div>

             {/* Información General - Rediseñada */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
               {/* Header con gradiente */}
               <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                 <div className="flex items-center space-x-3">
                   <div className="p-2 bg-blue-100 rounded-lg">
                     <Settings className="w-5 h-5 text-blue-600" />
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-gray-900">Información del Proyecto</h2>
                     <p className="text-sm text-gray-600">Configuración y detalles principales</p>
                   </div>
                 </div>
               </div>
               
               {/* Contenido con grid mejorado */}
               <div className="p-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   
                   {/* Líder del Proyecto */}
                   <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                     <div className="flex items-center space-x-3 mb-3">
                       <div className="p-2 bg-blue-500 rounded-lg">
                         <UserIcon className="w-4 h-4 text-white" />
                       </div>
                       <h3 className="font-semibold text-blue-900">Líder del Proyecto</h3>
                     </div>
                     {project.projectLead ? (
                       <div className="flex items-center space-x-3">
                         <img 
                           src={project.projectLead.avatar} 
                           alt={project.projectLead.name}
                           className="w-12 h-12 rounded-full border-2 border-blue-300"
                         />
                         <div>
                           <p className="font-medium text-gray-900">{project.projectLead.name}</p>
                           <p className="text-sm text-blue-700">Responsable principal</p>
                         </div>
                       </div>
                     ) : (
                       <div className="flex items-center space-x-3">
                         <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                           <UserIcon className="w-6 h-6 text-gray-400" />
                         </div>
                         <div>
                           <p className="text-gray-500 font-medium">No asignado</p>
                           <p className="text-sm text-gray-400">Sin líder designado</p>
                         </div>
                       </div>
                     )}
                   </div>

                   {/* Tipo de Proyecto */}
                   <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                     <div className="flex items-center space-x-3 mb-3">
                       <div className="p-2 bg-purple-500 rounded-lg">
                         <Briefcase className="w-4 h-4 text-white" />
                       </div>
                       <h3 className="font-semibold text-purple-900">Tipo de Proyecto</h3>
                     </div>
                     <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                       project.type === 'finite' 
                         ? 'bg-blue-500 text-white' 
                         : 'bg-purple-500 text-white'
                     }`}>
                       {project.type === 'finite' ? 'Proyecto Finito' : 'Servicio Recurrente'}
                     </div>
                   </div>

                   {/* Día de Pago (solo para recurrentes) */}
                   {project.type === 'recurring' && (
                     <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                       <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center space-x-3">
                           <div className="p-2 bg-green-500 rounded-lg">
                             <DollarSign className="w-4 h-4 text-white" />
                           </div>
                           <h3 className="font-semibold text-green-900">Día de Pago</h3>
                         </div>
                         <button
                           onClick={() => setIsPaymentDayModalOpen(true)}
                           className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-200 rounded-lg transition-all duration-200"
                           title="Editar día de pago"
                         >
                           <Edit className="w-4 h-4" />
                         </button>
                       </div>
                       <div className="flex items-center space-x-2">
                         <CalendarDays className="w-5 h-5 text-green-600" />
                         <span className="text-lg font-bold text-green-900">
                           {project.reportingDay || 1} de cada mes
                         </span>
                       </div>
                     </div>
                   )}

                   {/* Estrategia (editable) */}
                   <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 border border-cyan-200">
                     <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center space-x-3">
                         <div className="p-2 bg-cyan-500 rounded-lg">
                           <Globe className="w-4 h-4 text-white" />
                         </div>
                         <h3 className="font-semibold text-cyan-900">Estrategia</h3>
                       </div>
                       <button
                         onClick={() => setIsStrategyModalOpen(true)}
                         className="p-1.5 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-200 rounded-lg transition-all duration-200"
                         title="Editar estrategia"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                     </div>
                     {project.strategy ? (
                       <a
                         href={project.strategy}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center space-x-2 text-cyan-700 hover:text-cyan-900 font-medium transition-colors duration-200"
                       >
                         <span className="truncate">Ver estrategia</span>
                         <ExternalLink className="w-4 h-4 flex-shrink-0" />
                       </a>
                     ) : (
                       <p className="text-cyan-700 font-medium">Sin enlace configurado</p>
                     )}
                   </div>

                   {/* Finalización de Estrategia (solo para recurrentes) */}
                   {project.type === 'recurring' && project.calendarEnds && (
                     <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                       <div className="flex items-center space-x-3 mb-3">
                         <div className="p-2 bg-orange-500 rounded-lg">
                           <TrendingUp className="w-4 h-4 text-white" />
                         </div>
                         <h3 className="font-semibold text-orange-900">Finalización de Estrategia</h3>
                       </div>
                       <div className="flex items-center space-x-2">
                         <Calendar className="w-5 h-5 text-orange-600" />
                         <span className="text-lg font-bold text-orange-900">
                           {project.calendarEnds.toLocaleDateString('es-ES', {
                             day: 'numeric',
                             month: 'long',
                             year: 'numeric'
                           })}
                         </span>
                       </div>
                     </div>
                   )}

                   {/* Ciclo de Servicio (solo para recurrentes) */}
                   {project.type === 'recurring' && (
                     <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                       <div className="flex items-center space-x-3 mb-3">
                         <div className="p-2 bg-indigo-500 rounded-lg">
                           <Clock className="w-4 h-4 text-white" />
                         </div>
                         <h3 className="font-semibold text-indigo-900">Ciclo de Servicio</h3>
                       </div>
                       <div className="flex items-center space-x-2">
                         <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                         <span className="text-lg font-bold text-indigo-900 capitalize">
                           {project.serviceCycle}
                         </span>
                       </div>
                     </div>
                   )}

                   {/* Fecha de Entrega Final (solo para finitos) */}
                   {project.type === 'finite' && project.finalDueDate && (
                     <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                       <div className="flex items-center space-x-3 mb-3">
                         <div className="p-2 bg-red-500 rounded-lg">
                           <Target className="w-4 h-4 text-white" />
                         </div>
                         <h3 className="font-semibold text-red-900">Entrega Final</h3>
                       </div>
                       <div className="flex items-center space-x-2">
                         <Calendar className="w-5 h-5 text-red-600" />
                         <span className="text-lg font-bold text-red-900">{formatDate(project.finalDueDate)}</span>
                       </div>
                     </div>
                   )}

                   {/* Último Pago (solo para recurrentes) */}
                   {project.type === 'recurring' && project.lastPaymentDate && (
                     <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                       <div className="flex items-center space-x-3 mb-3">
                         <div className="p-2 bg-emerald-500 rounded-lg">
                           <CheckCircle className="w-4 h-4 text-white" />
                         </div>
                         <h3 className="font-semibold text-emerald-900">Último Pago</h3>
                       </div>
                       <div className="flex items-center space-x-2">
                         <Calendar className="w-5 h-5 text-emerald-600" />
                         <span className="text-lg font-bold text-emerald-900">{formatDate(project.lastPaymentDate)}</span>
                       </div>
                     </div>
                   )}

                 </div>
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
            
            {/* Results Counter */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Mostrando {filteredTasks.length} de {projectTasks.length} tareas
                {searchQuery && ` que coinciden con "${searchQuery}"`}
              </p>
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
                          className="w-8 h-8 rounded-full object-cover"
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

      {/* Modal para editar día de pago */}
      {isPaymentDayModalOpen && (
        <PaymentDayModal
          isOpen={isPaymentDayModalOpen}
          onClose={() => setIsPaymentDayModalOpen(false)}
          currentDay={project.reportingDay || 1}
          onSave={async (newDay: number) => {
            try {
              await onUpdateProject(project.id, { reportingDay: newDay });
              setIsPaymentDayModalOpen(false);
            } catch (error) {
              console.error('Error updating payment day:', error);
            }
          }}
        />
      )}

      {/* Modal para editar estrategia */}
      {isStrategyModalOpen && (
        <StrategyModal
          isOpen={isStrategyModalOpen}
          onClose={() => setIsStrategyModalOpen(false)}
          currentStrategy={project.strategy || ''}
          currentCalendarEnds={project.calendarEnds}
          onSave={async (strategy: string, calendarEnds?: Date) => {
            try {
              await onUpdateProject(project.id, { 
                strategy: strategy || undefined,
                calendarEnds: calendarEnds || undefined
              });
              setIsStrategyModalOpen(false);
            } catch (error) {
              console.error('Error updating strategy:', error);
            }
          }}
        />
      )}
    </div>
  );
};

// Modal simple para editar el día de pago
interface PaymentDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number;
  onSave: (day: number) => Promise<void>;
}

const PaymentDayModal: React.FC<PaymentDayModalProps> = ({
  isOpen,
  onClose,
  currentDay,
  onSave
}) => {
  const [day, setDay] = useState<string>(currentDay.toString());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDay(currentDay.toString());
    }
  }, [isOpen, currentDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si el campo está vacío, usar 1 como valor por defecto
    const dayValue = day.trim() === '' ? 1 : parseInt(day, 10);
    
    if (dayValue < 1 || dayValue > 31) return;

    setIsLoading(true);
    try {
      await onSave(dayValue);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Editar Día de Pago</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Día del mes para el pago
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1"
            />
            <p className="text-sm text-gray-500 mt-2">
              El cliente pagará el día {day.trim() === '' ? '1' : day} de cada mes
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading || (day.trim() !== '' && (parseInt(day, 10) < 1 || parseInt(day, 10) > 31))}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para editar estrategia y fecha de finalización
interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStrategy: string;
  currentCalendarEnds?: Date;
  onSave: (strategy: string, calendarEnds?: Date) => Promise<void>;
}

const StrategyModal: React.FC<StrategyModalProps> = ({
  isOpen,
  onClose,
  currentStrategy,
  currentCalendarEnds,
  onSave
}) => {
  const [strategy, setStrategy] = useState<string>(currentStrategy);
  const [calendarEnds, setCalendarEnds] = useState<string>(
    currentCalendarEnds ? formatDateForDisplay(currentCalendarEnds) : ''
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStrategy(currentStrategy);
      setCalendarEnds(currentCalendarEnds ? formatDateForDisplay(currentCalendarEnds) : '');
    }
  }, [isOpen, currentStrategy, currentCalendarEnds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const calendarEndsDate = calendarEnds.trim() ? parseDateFromDisplay(calendarEnds) : undefined;
      await onSave(strategy.trim(), calendarEndsDate || undefined);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Editar Estrategia</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enlace a la estrategia
            </label>
            <input
              type="url"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
            <p className="text-sm text-gray-500 mt-1">
              URL del documento o enlace de la estrategia
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Finalización de estrategia
            </label>
            <div className="relative">
              <input
                type="text"
                value={calendarEnds}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  const formattedValue = formatDateInput(rawValue);
                  setCalendarEnds(formattedValue);
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value && value.length === 10) {
                    const date = parseDateFromDisplay(value);
                    if (!date) {
                      setCalendarEnds('');
                    }
                  }
                }}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="dd/mm/aaaa"
                maxLength={10}
              />
              <button
                type="button"
                onClick={(e) => {
                  const buttonRect = e.currentTarget.getBoundingClientRect();
                  const tempInput = document.createElement('input');
                  tempInput.type = 'date';
                  tempInput.style.position = 'fixed';
                  tempInput.style.top = `${buttonRect.bottom + 5}px`;
                  tempInput.style.left = `${buttonRect.left}px`;
                  tempInput.style.zIndex = '9999';
                  tempInput.style.opacity = '0';
                  tempInput.style.pointerEvents = 'none';
                  
                  if (calendarEnds && calendarEnds.length === 10) {
                    const date = parseDateFromDisplay(calendarEnds);
                    if (date) {
                      const year = date.getFullYear();
                      const month = (date.getMonth() + 1).toString().padStart(2, '0');
                      const day = date.getDate().toString().padStart(2, '0');
                      tempInput.value = `${year}-${month}-${day}`;
                    }
                  }
                  
                  document.body.appendChild(tempInput);
                  
                  const handleChange = (event: any) => {
                    if (event.target.value) {
                      const date = createDateFromISO(event.target.value);
                      setCalendarEnds(formatDateForDisplay(date));
                    } else {
                      setCalendarEnds('');
                    }
                    document.body.removeChild(tempInput);
                  };
                  
                  const handleClickOutside = () => {
                    document.body.removeChild(tempInput);
                    document.removeEventListener('click', handleClickOutside);
                  };
                  
                  tempInput.addEventListener('change', handleChange);
                  document.addEventListener('click', handleClickOutside);
                  
                  setTimeout(() => {
                    tempInput.focus();
                    tempInput.showPicker ? tempInput.showPicker() : tempInput.click();
                  }, 10);
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Seleccionar fecha"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Formato: dd/mm/aaaa (se formatea automáticamente)
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectHub;
