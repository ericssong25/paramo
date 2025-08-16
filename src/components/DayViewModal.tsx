import React from 'react';
import { X, Calendar, Clock, CheckCircle, Eye, Edit } from 'lucide-react';
import { Task, ContentItem } from '../types';

interface DayViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  tasks: Task[];
  contentItems: ContentItem[];
  onViewTask: (task: Task) => void;
  onViewContent: (content: ContentItem) => void;
  onConvertTaskToContent: (task: Task) => void;
}

const DayViewModal: React.FC<DayViewModalProps> = ({
  isOpen,
  onClose,
  date,
  tasks,
  contentItems,
  onViewTask,
  onViewContent,
  onConvertTaskToContent,
}) => {
  if (!isOpen) return null;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <div className="w-4 h-4 bg-pink-500 rounded" />;
      case 'facebook': return <div className="w-4 h-4 bg-blue-500 rounded" />;
      case 'twitter': return <div className="w-4 h-4 bg-sky-500 rounded" />;
      case 'linkedin': return <div className="w-4 h-4 bg-indigo-500 rounded" />;
      case 'youtube': return <div className="w-4 h-4 bg-red-500 rounded" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'scheduled': return <Clock className="w-3 h-3 text-blue-600" />;
      case 'review': return <Eye className="w-3 h-3 text-yellow-600" />;
      default: return <Edit className="w-3 h-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {formatDate(date)}
              </h2>
              <p className="text-sm text-gray-600">
                {tasks.length + contentItems.length} items total
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Content Items */}
            {contentItems.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                  Content ({contentItems.length})
                </h3>
                <div className="space-y-3">
                  {contentItems.map((content) => (
                    <div
                      key={content.id}
                      onClick={() => onViewContent(content)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex items-center space-x-2">
                            {getPlatformIcon(content.platform)}
                            {getStatusIcon(content.status)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {content.title}
                            </h4>
                            {content.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {content.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="capitalize">{content.platform}</span>
                              <span className="capitalize">{content.status}</span>
                              {content.scheduledDate && (
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTime(content.scheduledDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {tasks.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Tasks ({tasks.length})
                </h3>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onViewTask(task)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                              {task.status.replace('-', ' ')}
                            </div>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </div>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {task.assignee && (
                              <div className="flex items-center space-x-1">
                                <img 
                                  src={task.assignee.avatar} 
                                  alt={task.assignee.name}
                                  className="w-4 h-4 rounded-full"
                                />
                                <span>{task.assignee.name}</span>
                              </div>
                            )}
                            {task.dueDate && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Due: {task.dueDate.toLocaleDateString()}
                              </span>
                            )}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <span>{task.subtasks.length} subtasks</span>
                            )}
                          </div>
                        </div>
                        {task.status === 'done' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onConvertTaskToContent(task);
                            }}
                            className="ml-4 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            +Content
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {tasks.length === 0 && contentItems.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No items scheduled
                </h3>
                <p className="text-gray-600">
                  No tasks or content items are scheduled for this day.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayViewModal;
