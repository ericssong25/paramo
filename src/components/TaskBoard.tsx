import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
  onMarkForReview?: (task: Task) => void;
  onReturnTask?: (task: Task) => void;
  onConvertToContent?: (task: Task) => void;
  onArchiveTask?: (task: Task) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onStatusChange,
  onTaskClick,
  onCreateTask,
  onMarkForReview,
  onReturnTask,
  onConvertToContent,
  onArchiveTask,
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const statusColumns = [
    { id: 'todo' as TaskStatus, title: 'To Do', color: 'bg-gray-100' },
    { id: 'in-progress' as TaskStatus, title: 'In Progress', color: 'bg-blue-100' },
    { id: 'review' as TaskStatus, title: 'Review', color: 'bg-yellow-100' },
    { id: 'done' as TaskStatus, title: 'Done', color: 'bg-green-100' },
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    if (status === 'in-progress') {
      // Mostrar tanto 'in-progress' como 'corrections' en la misma columna
      return tasks.filter(task => task.status === 'in-progress' || task.status === 'corrections');
    }
    return tasks.filter(task => task.status === status);
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    console.log('🔄 Drag & Drop iniciado:', { taskId, newStatus });
    
    // Encontrar la tarea que se está arrastrando
    const draggedTask = tasks.find(task => task.id === taskId);
    if (!draggedTask) {
      console.log('❌ Tarea no encontrada:', taskId);
      return;
    }
    
    console.log('📋 Tarea encontrada:', { id: draggedTask.id, currentStatus: draggedTask.status, newStatus });
    
    // Verificar si el cambio de estado es válido según la lógica secuencial
    const isValidTransition = isValidStatusTransition(draggedTask.status, newStatus);
    
    console.log('✅ Transición válida:', isValidTransition);
    
    if (isValidTransition) {
      // Si es una transición a "review", usar onMarkForReview si está disponible
      if (newStatus === 'review' && onMarkForReview) {
        console.log('📤 Marcando para revisión');
        onMarkForReview(draggedTask);
      } else if (newStatus === 'in-progress' && draggedTask.status === 'review' && onReturnTask) {
        // Si es devolver de "review" a "in-progress" (que internamente se convierte en "corrections"), usar onReturnTask
        console.log('🔄 Devolviendo tarea para correcciones');
        onReturnTask(draggedTask);
      } else if (newStatus === 'in-progress' && draggedTask.status === 'corrections') {
        // Si es mover de "corrections" a "in-progress", cambiar el status
        console.log('📤 Moviendo de correcciones a in-progress');
        onStatusChange(taskId, 'in-progress');
      } else {
        // Para otras transiciones, usar onStatusChange
        console.log('📤 Cambiando estado normal');
        onStatusChange(taskId, newStatus);
      }
    } else {
      // Opcional: mostrar un mensaje de error o hacer un feedback visual
      console.log(`❌ Transición no válida: ${draggedTask.status} → ${newStatus}`);
    }
  };

    // Función para validar transiciones de estado
  const isValidStatusTransition = (currentStatus: TaskStatus, newStatus: TaskStatus): boolean => {
    // Definir las transiciones válidas
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      'todo': ['in-progress'],
      'in-progress': ['review'],
      'corrections': ['review'],
      'review': ['done', 'in-progress'], // Permitir devolver a in-progress (que se convierte en corrections)
      'done': [] // No se puede cambiar desde "done"
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

     // Función para determinar si una columna es válida para el drop
  const isColumnValidForDrop = (columnStatus: TaskStatus): boolean => {
    if (!draggedTask) return false;
    
    // Si la columna es 'in-progress', permitir drop desde 'corrections' también
    if (columnStatus === 'in-progress' && draggedTask.status === 'corrections') {
      return true;
    }
    
    return isValidStatusTransition(draggedTask.status, columnStatus);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <div 
              key={column.id} 
              className={`flex flex-col rounded-lg min-h-[600px] transition-all duration-200 ${
                draggedTask && isColumnValidForDrop(column.id)
                  ? 'bg-green-50 border-2 border-green-300 shadow-lg'
                  : draggedTask && !isColumnValidForDrop(column.id)
                  ? 'bg-red-50 border-2 border-red-300 opacity-50'
                  : 'bg-gray-50'
              }`}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragOver={handleDragOver}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${column.color.replace('bg-', 'bg-').replace('-100', '-400')}`} />
                  <h3 className="font-semibold text-gray-800">{column.title}</h3>
                  <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                  {draggedTask && isColumnValidForDrop(column.id) && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {draggedTask.status === 'review' && column.id === 'in-progress'
                        ? '✓ Devolver'
                        : '✓ Válido'
                      }
                    </span>
                  )}
                  {draggedTask && !isColumnValidForDrop(column.id) && (
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      ✗ Inválido
                    </span>
                  )}
                </div>
                
                {column.id === 'todo' && (
                  <button
                    onClick={onCreateTask}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                    title="Add new task"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Column Content */}
              <div className="flex-1 p-3 space-y-2">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onTaskClick={onTaskClick}
                    onMarkForReview={onMarkForReview}
                    onReturnTask={onReturnTask}
                    onConvertToContent={onConvertToContent}
                    onArchiveTask={onArchiveTask}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className={`flex items-center justify-center h-24 border-2 border-dashed rounded-lg transition-colors ${
                    draggedTask && isColumnValidForDrop(column.id)
                      ? 'border-green-300 bg-green-50 text-green-600'
                      : draggedTask && !isColumnValidForDrop(column.id)
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    <p className="text-sm">
                      {draggedTask && isColumnValidForDrop(column.id)
                        ? draggedTask.status === 'review' && column.id === 'in-progress'
                          ? 'Suelta aquí para devolver'
                          : 'Suelta aquí para mover'
                        : draggedTask && !isColumnValidForDrop(column.id)
                        ? 'Movimiento no válido'
                        : 'No tasks'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;