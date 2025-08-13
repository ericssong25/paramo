import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Flag, 
  
  Clock, 
  Plus,
  Check,
  Trash2,
  Tag,
  Edit,
  Play,
  Circle,
  AlertCircle,
  ArrowLeft,
  Timer,
  GripVertical,
  CheckCircle
} from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Task, TaskPriority, TaskStatus, User as UserType, Subtask } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useComments } from '../hooks/useSupabase';
import { formatRelativeTime } from '../utils/typeConverters';
import { Trash2 as TrashIcon, Edit as EditIcon, X as CloseIcon } from 'lucide-react';
import { useProfiles } from '../hooks/useSupabase';

// Componente para subtarea arrastrable
interface SortableSubtaskItemProps {
  subtask: Subtask;
  onToggle: () => void;
  onDelete: () => void;
}

const SortableSubtaskItem: React.FC<SortableSubtaskItemProps> = ({
  subtask,
  onToggle,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-3 rounded-lg border ${
        isDragging ? 'opacity-50 bg-gray-50' : 'bg-white'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          subtask.completed 
            ? 'bg-green-500 border-green-500 text-white' 
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {subtask.completed && <Check className="w-3 h-3" />}
      </button>
      
      <span className={`flex-1 text-sm ${
        subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'
      }`}>
        {subtask.title}
      </span>
      
      <button
        onClick={onDelete}
        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface TaskViewProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onReorderSubtasks: (taskId: string, subtaskIds: string[]) => void;
  users: UserType[];
  authorProfileId?: string;
  onChangeAssignee?: (taskId: string, assigneeId: string | null) => void;
}

const TaskView: React.FC<TaskViewProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onReorderSubtasks,
  users,
  authorProfileId,
  onChangeAssignee,
}) => {
  const [newSubtask, setNewSubtask] = useState('');
  const [localSubtaskIds, setLocalSubtaskIds] = useState<string[]>(task.subtasks.map(s => s.id));
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const assigneeRef = React.useRef<HTMLDivElement | null>(null);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  React.useEffect(() => {
    if (!assigneeOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!assigneeRef.current) return;
      if (!assigneeRef.current.contains(e.target as Node)) setAssigneeOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [assigneeOpen]);
  
  // Configurar sensores para DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // sincronizar si la tarea cambia (por ejemplo al reabrir)
  React.useEffect(() => {
    setLocalSubtaskIds(task.subtasks.map(s => s.id));
  }, [task.id, task.subtasks]);
  
  // si llegan subtareas nuevas que no están en localSubtaskIds (p.ej. temp -> real), añádelas
  React.useEffect(() => {
    const ids = task.subtasks.map(s => s.id);
    setLocalSubtaskIds(prev => {
      const merged = Array.from(new Set([...prev, ...ids]));
      return merged;
    });
  }, [task.subtasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const ids = localSubtaskIds;
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      const newIds = arrayMove(ids, oldIndex, newIndex);
      setLocalSubtaskIds(newIds); // actualización instantánea
      onReorderSubtasks(task.id, newIds); // persistimos sin bloquear UI
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(task.id);
      onClose(); // Cerrar el modal de vista de tarea
    }
  };

  if (!isOpen) return null;

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'review': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'todo': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'done': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Play className="w-4 h-4" />;
      case 'review': return <AlertCircle className="w-4 h-4" />;
      case 'todo': return <Circle className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const formatTimeTracked = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              <p className="text-sm text-gray-500">Task Details</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Status and Priority */}
            <div className="flex items-center space-x-4 mb-6">
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                <span className="capitalize">{task.status.replace('-', ' ')}</span>
              </div>
              
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                <Flag className="w-4 h-4" />
                <span className="capitalize">{task.priority}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {task.description || 'No description provided'}
              </p>
            </div>

            {/* Task Details Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Assignee */}
              <div className="relative">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Assignee</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative" ref={assigneeRef}>
                    <button
                      type="button"
                      onClick={() => setAssigneeOpen(v => !v)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm shadow-sm hover:bg-gray-50"
                    >
                      {task.assignee ? (
                        <img src={task.assignee.avatar} alt={task.assignee.name} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-gray-200 inline-block" />
                      )}
                      <span className="truncate max-w-[160px]">{task.assignee ? task.assignee.name : 'Unassigned'}</span>
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    {assigneeOpen && (
                      <div className="absolute z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
                        <div className="p-2 border-b">
                          <input value={assigneeSearch} onChange={(e) => setAssigneeSearch(e.target.value)} placeholder="Search member..." className="w-full border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <ul className="max-h-60 overflow-auto">
                          <li>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50" onClick={() => { onChangeAssignee && onChangeAssignee(task.id, null); setAssigneeOpen(false); }}>
                              <span className="w-6 h-6 rounded-full bg-gray-200 inline-block" />
                              Unassigned
                            </button>
                          </li>
                          {users.filter(u => u.name.toLowerCase().includes(assigneeSearch.toLowerCase())).map(u => (
                            <li key={u.id}>
                              <button className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${task.assignee?.id === u.id ? 'bg-blue-50 text-blue-700' : 'text-gray-800 hover:bg-gray-50'}`} onClick={() => { onChangeAssignee && onChangeAssignee(task.id, u.id); /* Optimistic UI: update local */ (task as any).assignee = { ...u }; setAssigneeOpen(false); }}>
                                <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                                <span className="truncate">{u.name}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Due Date</h3>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    {task.dueDate ? task.dueDate.toLocaleDateString() : 'No due date'}
                  </span>
                </div>
              </div>

              {/* Time Tracked */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Time Tracked</h3>
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{formatTimeTracked(task.timeTracked)}</span>
                </div>
              </div>

              {/* Created Date */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{task.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Status Actions */}
            <div className="flex space-x-2">
              {task.status !== 'todo' && (
                <button
                  onClick={() => onStatusChange(task.id, 'todo')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Circle className="w-4 h-4" />
                  <span>Mark as Todo</span>
                </button>
              )}
              
              {task.status !== 'in-progress' && (
                <button
                  onClick={() => onStatusChange(task.id, 'in-progress')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Mark as In Progress</span>
                </button>
              )}
              
              {task.status !== 'review' && (
                <button
                  onClick={() => onStatusChange(task.id, 'review')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Mark for Review</span>
                </button>
              )}
              
              {task.status !== 'done' && (
                <button
                  onClick={() => onStatusChange(task.id, 'done')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Done</span>
                </button>
              )}
            </div>

            {/* Comments Section */}
            <CommentsSection taskId={task.id} authorProfileId={authorProfileId} />
          </div>

          {/* Subtasks Panel */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Subtasks</h3>
              <div className="text-sm text-gray-500">
                {completedSubtasks}/{totalSubtasks}
              </div>
            </div>

            {/* Progress Bar */}
            {totalSubtasks > 0 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Subtasks List */}
            <div className="space-y-2 mb-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={localSubtaskIds}
                  strategy={verticalListSortingStrategy}
                >
                  {localSubtaskIds.map((id) => {
                    const subtask = task.subtasks.find(s => s.id === id);
                    if (!subtask) {
                      return null;
                    }
                    return (
                      <SortableSubtaskItem
                        key={subtask.id}
                        subtask={subtask}
                        onToggle={() => onToggleSubtask(task.id, subtask.id)}
                        onDelete={() => onDeleteSubtask(task.id, subtask.id)}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>

            {/* Add New Subtask */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Subtask</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Enter subtask title..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newSubtask.trim()) {
                      onAddSubtask(task.id, newSubtask);
                      setNewSubtask('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newSubtask.trim()) {
                      onAddSubtask(task.id, newSubtask);
                      setNewSubtask('');
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Tarea"
        message="¿Estás seguro de que quieres eliminar esta tarea? Esta acción eliminará permanentemente la tarea y todas sus subtareas."
        itemName={task.title}
      />
    </div>
  );
};

// Simple modal component for editing a comment
const EditCommentModal: React.FC<{ open: boolean; initialText: string; onClose: () => void; onSave: (text: string) => void; }> = ({ open, initialText, onClose, onSave }) => {
  const [text, setText] = useState(initialText);
  React.useEffect(() => { setText(initialText); }, [initialText, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-base font-semibold text-gray-900">Editar comentario</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><CloseIcon className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe tu comentario..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSave(text.trim());
              }
            }}
          />
        </div>
        <div className="p-4 border-t flex items-center justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
          <button onClick={() => onSave(text.trim())} className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Guardar</button>
        </div>
      </div>
    </div>
  );
};

// CommentsSection component
const CommentsSection: React.FC<{ taskId: string; authorProfileId?: string }> = ({ taskId, authorProfileId }) => {
  const { commentsByTask, fetchCommentsForTask, addComment, updateComment, deleteComment } = useComments();
  const { profiles } = useProfiles();
  const [comment, setComment] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  React.useEffect(() => {
    fetchCommentsForTask(taskId);
  }, [taskId]);

  const comments = commentsByTask[taskId] || [];

  const submit = async () => {
    if (!comment.trim()) return;
    const authorId = authorProfileId || 'anonymous-profile-id';
    await addComment(taskId, authorId, comment.trim());
    setComment('');
  };

  const resolveAuthor = (authorId: string) => {
    const p = profiles.find(p => p.id === authorId);
    return {
      name: p?.name || 'Usuario',
      avatar: p?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p?.name || 'U')}`,
    };
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Comentarios</h3>

      {/* Composer on top */}
      <div className="mb-4 flex items-start space-x-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe un comentario (Enter para enviar, Shift+Enter para salto de línea)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          onClick={submit}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm self-stretch"
        >
          Enviar
        </button>
      </div>

      {/* List newest first */}
      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-gray-500">Sin comentarios</p>
        )}
        {[...comments].reverse().map((c) => {
          const author = resolveAuthor(c.author_id);
          const isMine = c.author_id === authorProfileId;
          return (
            <div key={c.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg border w-full ${
                isMine ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`flex items-start ${isMine ? 'flex-row-reverse space-x-reverse' : ''} space-x-3`}>
                  <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className={`flex items-center ${isMine ? 'justify-end' : ''} space-x-2`}>
                      <span className="text-sm font-medium text-gray-900">{isMine ? 'Tú' : author.name}</span>
                      <span className="text-xs text-gray-500">{formatRelativeTime(new Date(c.created_at))}</span>
                    </div>
                    <p className={`text-sm text-gray-800 mt-2 whitespace-pre-wrap ${isMine ? 'text-right' : ''}`}>{c.content}</p>
                  </div>
                  {isMine && (
                    <div className="flex items-center space-x-1">
                      <button onClick={() => { setEditingId(c.id); setEditingText(c.content); setEditModalOpen(true); }} className="p-1 text-gray-400 hover:text-gray-600">
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteComment(c.id)} className="p-1 text-red-400 hover:text-red-600">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <EditCommentModal
        open={editModalOpen}
        initialText={editingText}
        onClose={() => setEditModalOpen(false)}
        onSave={async (text) => {
          if (!editingId || !text) { setEditModalOpen(false); return; }
          await updateComment(editingId, text);
          setEditModalOpen(false);
        }}
      />
    </div>
  );
};

export default TaskView;
