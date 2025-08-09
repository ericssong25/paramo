import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Calendar, 
  Flag, 
  User, 
  Clock, 
  Plus,
  Check,
  Trash2,
  Tag
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, User as UserType, Subtask } from '../types';

interface TaskModalProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
  users: UserType[];
  projectId: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  users,
  projectId,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal' as TaskPriority,
    status: 'todo' as TaskStatus,
    assigneeId: '',
    dueDate: '',
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assigneeId: task.assignee?.id || '',
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
        tags: [...task.tags],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'normal',
        status: 'todo',
        assigneeId: '',
        dueDate: '',
        tags: [],
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assignee = formData.assigneeId ? users.find(u => u.id === formData.assigneeId) : undefined;
    
    const taskData: Partial<Task> = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      assignee,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      tags: formData.tags,
      projectId,
    };

    onSave(taskData);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  // Custom Assignee select with search
  function AssigneeSelect({ users, value, onChange }: { users: UserType[]; value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false)
    const [q, setQ] = useState('')
    const anchorRef = React.useRef<HTMLButtonElement | null>(null)
    const [menuStyle, setMenuStyle] = useState<{left:number; top:number; width:number}>({left:0, top:0, width:0})

    const selected = users.find(u => u.id === value)
    const filtered = users.filter(u => u.name.toLowerCase().includes(q.toLowerCase()))

    const updatePosition = () => {
      const el = anchorRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setMenuStyle({ left: r.left + window.scrollX, top: r.bottom + window.scrollY + 8, width: r.width })
    }

    React.useEffect(() => {
      if (!open) return
      updatePosition()
      const onDoc = (e: MouseEvent) => {
        const el = anchorRef.current
        if (!el) return
        if (!el.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      const onResize = () => updatePosition()
      document.addEventListener('mousedown', onDoc)
      window.addEventListener('resize', onResize)
      window.addEventListener('scroll', onResize, true)
      return () => {
        document.removeEventListener('mousedown', onDoc)
        window.removeEventListener('resize', onResize)
        window.removeEventListener('scroll', onResize, true)
      }
    }, [open])

    const dropdown = (
      <div
        className="z-[70] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
        style={{ position: 'fixed', left: menuStyle.left, top: menuStyle.top, width: menuStyle.width }}
      >
        <div className="p-2 border-b bg-white"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search member..." className="w-full border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
        <ul className="max-h-60 overflow-auto">
          <li><button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50" onClick={() => { onChange(''); setOpen(false) }}><span className="w-6 h-6 rounded-full bg-gray-200 inline-block"/>Unassigned</button></li>
          {filtered.map(u => (
            <li key={u.id}><button className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${u.id===value?'bg-blue-50 text-blue-700':'text-gray-800 hover:bg-gray-50'}`} onClick={() => { onChange(u.id); setOpen(false) }}><img src={u.avatar} className="w-6 h-6 rounded-full object-cover"/><span className="truncate">{u.name}</span></button></li>
          ))}
        </ul>
      </div>
    )

    return (
      <div className="relative">
        <button ref={anchorRef} type="button" onClick={() => setOpen(v => !v)} className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm">
          {selected ? <img src={selected.avatar} className="w-6 h-6 rounded-full object-cover"/> : <span className="w-6 h-6 rounded-full bg-gray-200 inline-block"/>}
          <span className="truncate">{selected ? selected.name : 'Unassigned'}</span>
          <svg className="ml-auto w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        {open ? createPortal(dropdown, document.body) : null}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {task ? 'Edit Task' : 'Create New Task'}
              </h3>
              <div className="flex items-center space-x-2">
                {task && onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(task.id);
                      onClose();
                    }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task description..."
                />
              </div>

              {/* Priority, Status, Assignee, Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Flag className="w-4 h-4 inline mr-1" />
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Assignee
                  </label>
                  <AssigneeSelect users={users} value={formData.assigneeId} onChange={(val) => setFormData(prev => ({ ...prev, assigneeId: val }))} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;