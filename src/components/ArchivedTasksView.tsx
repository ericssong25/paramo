import React, { useState, useEffect } from 'react';
import { Task, User, Project } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { Trash2, Clock, AlertTriangle, RefreshCw, Archive } from 'lucide-react';
import ConsistentHeader from './ConsistentHeader';

interface ArchivedTasksViewProps {
  tasks: Task[];
  projects: Project[];
  onUpdateTask: (taskId: string, updates: any) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  isLoading?: boolean;
  error?: any;
}

const ArchivedTasksView: React.FC<ArchivedTasksViewProps> = ({ 
  tasks, 
  projects, 
  onUpdateTask, 
  onDeleteTask, 
  isLoading = false, 
  error = null 
}) => {
  const { t } = useTranslation();
  
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string>('');

  // Filtrar solo tareas archivadas
  useEffect(() => {
    const filtered = tasks.filter(task => task.status === 'archived');
    setArchivedTasks(filtered);
  }, [tasks]);

  // Función para calcular días desde que fue archivada
  const getDaysSinceArchived = (task: Task): number => {
    const archivedDate = task.archivedAt || new Date(task.updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - archivedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Función para limpiar tareas archivadas por más de 30 días
  const cleanupOldArchivedTasks = async () => {
    setIsCleaningUp(true);
    setCleanupMessage('');
    
    try {
      const tasksToDelete = archivedTasks.filter(task => getDaysSinceArchived(task) > 30);
      
      if (tasksToDelete.length === 0) {
        setCleanupMessage('No hay tareas para eliminar automáticamente');
        return;
      }

      // Eliminar tareas una por una
      for (const task of tasksToDelete) {
        await onDeleteTask(task.id);
      }

      setCleanupMessage(`${tasksToDelete.length} tareas eliminadas automáticamente`);
      
      // Actualizar la lista local
      setArchivedTasks(prev => prev.filter(task => getDaysSinceArchived(task) <= 30));
      
    } catch (error) {
      setCleanupMessage('Error al eliminar tareas automáticamente');
    } finally {
      setIsCleaningUp(false);
    }
  };

  // Función para restaurar una tarea
  const restoreTask = async (taskId: string) => {
    try {
      await onUpdateTask(taskId, { status: 'todo' } as any);
    } catch (error) {
      // no-op
    }
  };

  // Función para eliminar una tarea manualmente
  const deleteArchivedTask = async (taskId: string) => {
    try {
      await onDeleteTask(taskId);
    } catch (error) {
      // no-op
    }
  };

  // Obtener nombre del proyecto
  const getProjectName = (projectId: string): string => {
    if (!projectId) return 'Sin proyecto';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Sin proyecto';
  };

  // Obtener nombre del usuario (usando el assignee ya convertido)
  const getUserName = (assignee: User | undefined): string => {
    return assignee?.name || 'Usuario desconocido';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando tareas archivadas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error al cargar tareas archivadas</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ConsistentHeader
        title={t('navigation.archivedTasks')}
        showSearch={false}
        showCreateButton={false}
      >
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {archivedTasks.length} {archivedTasks.length === 1 ? 'tarea archivada' : 'tareas archivadas'}
          </div>
          
          <button
            onClick={cleanupOldArchivedTasks}
            disabled={isCleaningUp}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCleaningUp ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Limpiar automáticamente</span>
          </button>
        </div>
      </ConsistentHeader>

      <div className="flex-1 overflow-auto p-6">

        {/* Mensaje de limpieza */}
        {cleanupMessage && (
          <div className={`mt-4 p-3 rounded-lg ${
            cleanupMessage.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {cleanupMessage}
          </div>
        )}

        {/* Información sobre eliminación automática */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Eliminación automática</h3>
              <p className="text-sm text-amber-700 mt-1">
                Las tareas archivadas se eliminarán automáticamente después de 30 días. 
                Puedes usar el botón "Limpiar automáticamente" para eliminar manualmente las tareas que ya cumplen este plazo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de tareas archivadas */}
      {archivedTasks.length === 0 ? (
        <div className="text-center py-12">
          <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas archivadas</h3>
          <p className="text-gray-500">Las tareas que archives aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {archivedTasks.map((task) => {
            const daysSinceArchived = getDaysSinceArchived(task);
            const isOldTask = daysSinceArchived > 30;
            
            return (
              <div
                key={task.id}
                className={`p-4 border rounded-lg ${
                  isOldTask 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      {isOldTask && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          Eliminar pronto
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          Archivada hace {daysSinceArchived} {daysSinceArchived === 1 ? 'día' : 'días'}
                        </span>
                      </div>
                      
                      <span>•</span>
                      
                      <span>Proyecto: {getProjectName(task.projectId)}</span>
                      
                      {task.assignee && (
                        <>
                          <span>•</span>
                          <span>Asignado: {getUserName(task.assignee)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => restoreTask(task.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Restaurar
                    </button>
                    
                    <button
                      onClick={() => deleteArchivedTask(task.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ArchivedTasksView;
