import React from 'react';
import { Plus } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onStatusChange,
  onTaskClick,
  onCreateTask,
}) => {
  const statusColumns = [
    { id: 'todo' as TaskStatus, title: 'To Do', color: 'bg-gray-100' },
    { id: 'in-progress' as TaskStatus, title: 'In Progress', color: 'bg-blue-100' },
    { id: 'review' as TaskStatus, title: 'Review', color: 'bg-yellow-100' },
    { id: 'done' as TaskStatus, title: 'Done', color: 'bg-green-100' },
  ];

  const getTasksByStatus = (status: TaskStatus) => 
    tasks.filter(task => task.status === status);

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onStatusChange(taskId, newStatus);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <div 
              key={column.id} 
              className="flex flex-col bg-gray-50 rounded-lg min-h-[600px]"
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
                  />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm">No tasks</p>
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