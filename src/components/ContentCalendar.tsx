import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { ContentItem, Task } from '../types';

interface ContentCalendarProps {
  contentItems: ContentItem[];
  tasks: Task[];
  onCreateContent: () => void;
  onEditContent: (content: ContentItem) => void;
  onConvertTaskToContent: (task: Task) => void;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({
  contentItems,
  tasks,
  onCreateContent,
  onEditContent,
  onConvertTaskToContent,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'facebook': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'twitter': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'linkedin': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'youtube': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getDaysInWeek = (date: Date) => {
    const current = new Date(date);
    const week = [];
    current.setDate(current.getDate() - current.getDay());
    
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return week;
  };

  const getContentForDate = (date: Date | null) => {
    if (!date) return [];
    
    return contentItems.filter(item => {
      const itemDate = item.scheduledDate || item.publishedDate;
      if (!itemDate) return false;
      
      return (
        itemDate.getDate() === date.getDate() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      return (
        task.dueDate.getDate() === date.getDate() &&
        task.dueDate.getMonth() === date.getMonth() &&
        task.dueDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const days = viewMode === 'month' ? getDaysInMonth(currentDate) : getDaysInWeek(currentDate);
  const displayText = viewMode === 'month' 
    ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : `${getDaysInWeek(currentDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${getDaysInWeek(currentDate)[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Content Calendar</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  viewMode === 'month' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Week
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-lg font-medium text-gray-900 min-w-[180px] text-center">
                {displayText}
              </span>
              <button
                onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={onCreateContent}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Content</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {days.map((day, index) => {
            const dayContent = getContentForDate(day);
            const dayTasks = getTasksForDate(day);
            const isToday = day && 
              day.getDate() === new Date().getDate() &&
              day.getMonth() === new Date().getMonth() &&
              day.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={index}
                className={`bg-white p-2 min-h-[120px] ${
                  day ? 'hover:bg-gray-50' : 'bg-gray-50'
                } transition-colors`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                      {isToday && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full inline-block ml-1" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {/* Content Items */}
                      {dayContent.slice(0, 2).map(content => (
                        <div
                          key={content.id}
                          onClick={() => onEditContent(content)}
                          className={`p-1 rounded text-xs border cursor-pointer hover:shadow-sm transition-all ${getPlatformColor(content.platform)}`}
                        >
                          <div className="flex items-center space-x-1">
                            {getPlatformIcon(content.platform)}
                            {getStatusIcon(content.status)}
                          </div>
                          <div className="truncate mt-1 font-medium">
                            {content.title}
                          </div>
                          {content.scheduledDate && (
                            <div className="text-xs opacity-75">
                              {content.scheduledDate.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Tasks */}
                      {dayTasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className={`p-1 rounded text-xs border ${
                            task.status === 'done' 
                              ? 'bg-green-50 border-green-200 cursor-pointer hover:bg-green-100' 
                              : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                          } transition-all`}
                          onClick={() => task.status === 'done' && onConvertTaskToContent(task)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              {task.status === 'done' ? (
                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                              ) : (
                                <XCircle className="w-3 h-3 text-gray-400" />
                              )}
                              <span className="text-xs font-medium">Task</span>
                            </div>
                            {task.status === 'done' && (
                              <button className="text-xs text-blue-600 hover:text-blue-800">
                                +Content
                              </button>
                            )}
                          </div>
                          <div className="truncate mt-1 font-medium">
                            {task.title}
                          </div>
                          <div className="text-xs opacity-75">
                            {task.priority}
                          </div>
                        </div>
                      ))}
                      
                      {/* Show more indicators */}
                      {(dayContent.length > 2 || dayTasks.length > 2) && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{Math.max(dayContent.length - 2, dayTasks.length - 2)} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContentCalendar;