import React from 'react'
import { Task } from '../types'
import { Flag } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

const statusBadge: Record<Task['status'], string> = {
  'todo': 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-blue-50 text-blue-700',
  'review': 'bg-amber-50 text-amber-700',
  'done': 'bg-emerald-50 text-emerald-700',
}

// Prioridad con los mismos colores usados en el preview/card
const priorityColor: Record<Task['priority'], string> = {
  'low': 'text-gray-600',
  'normal': 'text-blue-600',
  'high': 'text-orange-600',
  'urgent': 'text-red-600'
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const LabelIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 16"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    {/* Etiqueta horizontal rellena con esquinas redondeadas y punta */}
    <path d="M4 0h11c.7 0 1.4.3 1.8.9L24 8l-7.2 7.1c-.4.6-1.1.9-1.8.9H4C1.8 16 0 14.2 0 12V4C0 1.8 1.8 0 4 0Z" />
  </svg>
)

const Tooltip: React.FC<{ text: string; className?: string; children: React.ReactNode }> = ({ text, className = '', children }) => (
  <span className={`relative inline-flex items-center group ${className}`}>
    {children}
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
      {text}
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
    </span>
  </span>
)

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="grid grid-cols-12 px-4 py-3 text-xs font-semibold text-gray-500 border-b">
        <div className="col-span-6">Task</div>
        <div className="col-span-2">Assignee</div>
        <div className="col-span-2">Due</div>
        <div className="col-span-2">Status</div>
      </div>
      <ul className="divide-y">
        {tasks.map(task => (
          <li
            key={task.id}
            className="grid grid-cols-12 px-4 py-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => onTaskClick(task)}
          >
            <div className="col-span-6 flex items-center gap-2">
              <Tooltip text={capitalize(task.priority)}>
                <Flag className={`w-4 h-4 ${priorityColor[task.priority]}`} fill="currentColor" />
              </Tooltip>
              <span className="text-sm text-gray-900 line-clamp-1">{task.title}</span>
            </div>
            <div className="col-span-2 text-sm text-gray-600">
              {task.assignee ? task.assignee.name : '-'}
            </div>
            <div className="col-span-2 text-sm text-gray-600">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
            </div>
            <div className="col-span-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusBadge[task.status]}`}>
                {task.status.replace('-', ' ')}
              </span>
            </div>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="px-4 py-6 text-sm text-gray-500">No tasks found.</li>
        )}
      </ul>
    </div>
  )
}

export default TaskList


