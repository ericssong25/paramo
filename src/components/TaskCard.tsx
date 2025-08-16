import React from 'react';
import { 
  Clock, 
  MessageSquare, 
  Paperclip, 
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
  Flag,
  Play,
  Eye,
  Check
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { isDateOverdue } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onMarkForReview?: (task: Task) => void;
  onReturnTask?: (task: Task) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onStatusChange, 
  onTaskClick,
  onMarkForReview,
  onReturnTask,
  isDragging = false,
  onDragStart,
  onDragEnd
}) => {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-3 h-3" />;
      default: return <Flag className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'corrections': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'review': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'todo': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-3 h-3" />;
      case 'in-progress': return <Play className="w-3 h-3" />;
      case 'corrections': return <AlertTriangle className="w-3 h-3" />;
      case 'review': return <Eye className="w-3 h-3" />;
      case 'todo': return <Circle className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const isOverdue = isDateOverdue(task.dueDate) && task.status !== 'done';
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;

  const formatDueDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTimeTracked = (minutes: number) => {
    if (minutes === 0) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-2' : ''
      } ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}
      onClick={() => onTaskClick(task)}
      draggable
      onDragStart={onDragStart || ((e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      })}
      onDragEnd={onDragEnd}
    >
      {/* Priority, Status and Assignee */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {getPriorityIcon(task.priority)}
            <span className="capitalize">{task.priority}</span>
          </div>
          
          {/* Status indicator */}
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
            {getStatusIcon(task.status)}
            <span className="capitalize">
              {task.status === 'corrections' ? 'Correcciones' : 
               task.status === 'in-progress' ? 'En progreso' :
               task.status === 'review' ? 'En revisión' :
               task.status}
            </span>
          </div>
        </div>
        
        {task.assignee && (
          <img 
            src={task.assignee.avatar} 
            alt={task.assignee.name}
            className="w-5 h-5 rounded-full object-cover border border-white shadow-sm"
            title={task.assignee.name}
          />
        )}
      </div>

      {/* Task Title */}
      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm">
        {task.title}
      </h3>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Subtasks Progress */}
      {task.subtasks.length > 0 && (
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {completedSubtasks}/{task.subtasks.length}
          </span>
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-xs text-gray-500 font-medium">
              +{task.tags.length - 2} more
            </span>
          )}
        </div>
      )}

      {/* Due Date and Time Tracked */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {task.dueDate && (
            <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
              <Calendar className="w-3 h-3" />
              <span className={isOverdue ? 'font-medium' : ''}>
                {formatDueDate(new Date(task.dueDate))}
              </span>
            </div>
          )}
          
          {task.timeTracked > 0 && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimeTracked(task.timeTracked)}</span>
            </div>
          )}
        </div>

        {/* Task actions */}
        <div className="flex items-center space-x-1">
          {task.subtasks.length > 0 && (
            <div className="flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{task.subtasks.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-1">
          {task.status === 'todo' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(task.id, 'in-progress');
              }}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              <Play className="w-3 h-3" />
              <span>Iniciar</span>
            </button>
          )}

          {(task.status === 'in-progress' || task.status === 'corrections') && onMarkForReview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkForReview(task);
              }}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
            >
              <Eye className="w-3 h-3" />
              <span>Revisar</span>
            </button>
          )}

          {task.status === 'review' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onReturnTask) {
                    onReturnTask(task);
                  } else {
                    onStatusChange(task.id, 'in-progress');
                  }
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>Devolver</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, 'done');
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                <Check className="w-3 h-3" />
                <span>Completar</span>
              </button>
            </>
          )}

          {/* Show files indicator if task has completed files */}
          {task.completedFiles && task.completedFiles.length > 0 && (
            <div className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
              <Paperclip className="w-3 h-3" />
              <span>{task.completedFiles.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;