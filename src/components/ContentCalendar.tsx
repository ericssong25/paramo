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
  XCircle,
  ExternalLink,
  Filter,
  Image,
  CheckSquare
} from 'lucide-react';
import { ContentItem, Task } from '../types';
import DayViewModal from './DayViewModal';

interface ContentCalendarProps {
  contentItems: ContentItem[];
  tasks: Task[];
  onCreateContent: () => void;
  onViewContent: (content: ContentItem) => void;
  onConvertTaskToContent: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onMarkAsPublished?: (contentId: string) => void;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({
  contentItems,
  tasks,
  onCreateContent,
  onViewContent,
  onConvertTaskToContent,
  onViewTask,
  onMarkAsPublished,
}) => {

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [filterMode, setFilterMode] = useState<'all' | 'content' | 'tasks'>('all');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDayViewOpen, setIsDayViewOpen] = useState(false);

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
      case 'draft': return <Edit className="w-3 h-3 text-gray-600" />;
      case 'archived': return <XCircle className="w-3 h-3 text-red-600" />;
      default: return <Edit className="w-3 h-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'archived': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'scheduled': return 'Programado';
      case 'draft': return 'Borrador';
      case 'archived': return 'Archivado';
      default: return status;
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
    if (!date || filterMode === 'tasks') return [];
    
    return contentItems.filter(item => {
      const itemDate = item.publish_date;
      if (!itemDate) return false;
      
      // Convertir la fecha del contenido a la zona horaria local para comparación correcta
      const localItemDate = new Date(itemDate.getTime() + (itemDate.getTimezoneOffset() * 60000));
      
      return (
        localItemDate.getDate() === date.getDate() &&
        localItemDate.getMonth() === date.getMonth() &&
        localItemDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date || filterMode === 'content') return [];
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      return (
        task.dueDate.getDate() === date.getDate() &&
        task.dueDate.getMonth() === date.getMonth() &&
        task.dueDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    setIsDayViewOpen(true);
  };

  const handleCloseDayView = () => {
    setIsDayViewOpen(false);
    setSelectedDay(null);
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

  const navigateList = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 28); // 4 weeks
      } else {
        newDate.setDate(prev.getDate() + 28); // 4 weeks
      }
      return newDate;
    });
  };

  const days = viewMode === 'month' ? getDaysInMonth(currentDate) : getDaysInWeek(currentDate);
  
  // Calculate totals for the current view
  const getTotalItems = () => {
    let totalContent = 0;
    let totalTasks = 0;
    
    days.forEach(day => {
      if (day) {
        totalContent += getContentForDate(day).length;
        totalTasks += getTasksForDate(day).length;
      }
    });
    
    return { totalContent, totalTasks };
  };
  
  const getDisplayText = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const weekDays = getDaysInWeek(currentDate);
      return `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      // List view - show 4 weeks range
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 27); // 4 weeks - 1 day
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900">Content Calendar</h2>
              {filterMode !== 'all' && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  filterMode === 'content' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {filterMode === 'content' ? 'Content Only' : 'Tasks Only'}
                </span>
              )}
              {(() => {
                const { totalContent, totalTasks } = getTotalItems();
                if (filterMode === 'all' && (totalContent > 0 || totalTasks > 0)) {
                  return (
                    <span className="text-sm text-gray-500">
                      ({totalContent} content, {totalTasks} tasks)
                    </span>
                  );
                } else if (filterMode === 'content' && totalContent > 0) {
                  return (
                    <span className="text-sm text-purple-600">
                      ({totalContent} items)
                    </span>
                  );
                } else if (filterMode === 'tasks' && totalTasks > 0) {
                  return (
                    <span className="text-sm text-orange-600">
                      ({totalTasks} items)
                    </span>
                  );
                }
                return null;
              })()}
            </div>
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
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                List
              </button>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center space-x-1 ${
                  filterMode === 'all' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>All</span>
              </button>
              <button
                onClick={() => setFilterMode('content')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center space-x-1 ${
                  filterMode === 'content' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Image className="w-3 h-3" />
                <span>Content</span>
              </button>
              <button
                onClick={() => setFilterMode('tasks')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center space-x-1 ${
                  filterMode === 'tasks' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CheckSquare className="w-3 h-3" />
                <span>Tasks</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (viewMode === 'month') {
                    navigateMonth('prev');
                  } else if (viewMode === 'week') {
                    navigateWeek('prev');
                  } else {
                    navigateList('prev');
                  }
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-lg font-medium text-gray-900 min-w-[180px] text-center">
                {getDisplayText()}
              </span>
              <button
                onClick={() => {
                  if (viewMode === 'month') {
                    navigateMonth('next');
                  } else if (viewMode === 'week') {
                    navigateWeek('next');
                  } else {
                    navigateList('next');
                  }
                }}
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

      {/* Calendar Grid / List */}
      <div className="p-6">
        {viewMode === 'list' ? (
          <div className="bg-white">
            {(() => {
              // compute 4 weeks starting from current week's start
              const start = new Date(currentDate); start.setDate(start.getDate() - start.getDay());
              const weeks = Array.from({ length: 4 }).map((_, wi) => {
                const weekStart = new Date(start); weekStart.setDate(start.getDate() + wi * 7);
                const days = Array.from({ length: 7 }).map((__, di) => {
                  const d = new Date(weekStart); d.setDate(weekStart.getDate() + di); return d;
                });
                return { weekStart, days };
              });
              return (
                <div className="space-y-6">
                  {weeks.map(({ weekStart, days }, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-gray-50 border-b text-sm text-gray-600">
                        Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <ul className="divide-y">
                        {days.map((d, di) => {
                          const dayContent = getContentForDate(d)
                          const dayTasks = getTasksForDate(d)
                          const allEntries = [
                            ...dayContent.map(c => ({ type: 'content' as const, c })),
                            ...dayTasks.map(t => ({ type: 'task' as const, t })),
                          ]
                          const entries = allEntries.slice(0, 2)
                          if (entries.length === 0) {
                            return (
                              <li key={di} className="flex items-start gap-4 p-3">
                                <div className="w-32 shrink-0 text-sm text-gray-500">
                                  <div className="font-medium">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                  <div>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                  <span className="text-sm text-gray-400">No items</span>
                                  <button
                                    onClick={() => handleDayClick(d)}
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                  >
                                    View Day
                                  </button>
                                </div>
                              </li>
                            )
                          }
                          return (
                            <li key={di} className="flex items-start gap-4 p-3">
                              <div className="w-32 shrink-0 text-sm text-gray-500">
                                <div className="font-medium">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                <div>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                              </div>
                              <div className="flex-1 space-y-2">
                                {entries.map((e, i) => e.type === 'content' ? (
                                  <div key={`c-${i}`} className={`p-2 rounded border hover:shadow-sm transition ${getPlatformColor(e.c.platforms[0] || 'default')}`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 flex-1" onClick={() => onViewContent(e.c)} style={{ cursor: 'pointer' }}>
                                        {getPlatformIcon(e.c.platforms[0] || 'default')}
                                        <span className="font-medium truncate">{e.c.title}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-xs opacity-75">
                                          {e.c.publish_date?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                        </div>
                                        {onMarkAsPublished && e.c.status !== 'published' && (
                                          <button
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              onMarkAsPublished(e.c.id);
                                            }}
                                            className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
                                            title="Marcar como publicado"
                                          >
                                            Publicar
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                      <div className="flex items-center gap-1">
                                        {getStatusIcon(e.c.status)}
                                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(e.c.status)}`}>
                                          {getStatusLabel(e.c.status)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    key={`t-${i}`} 
                                    onClick={() => onViewTask(e.t)}
                                    className={`p-2 rounded border cursor-pointer hover:shadow-sm transition ${
                                      e.t.status==='done' ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium truncate">{e.t.title}</span>
                                      <span className="text-xs capitalize opacity-75">{e.t.priority}</span>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => handleDayClick(d)}
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    View All ({allEntries.length})
                                  </button>
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        ) : (
          <>
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
                  day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                } transition-colors`}
                onClick={() => day && handleDayClick(day)}
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
                          {/* Combined Items (max 2 total) */}
                          {(() => {
                            const allItems = [
                              ...dayContent.map(c => ({ type: 'content' as const, item: c })),
                              ...dayTasks.map(t => ({ type: 'task' as const, item: t }))
                            ].slice(0, 2);
                            
                            return allItems.map((item, index) => 
                              item.type === 'content' ? (
                                <div
                                  key={item.item.id}
                                  className={`p-1 rounded text-xs border hover:shadow-sm transition-all cursor-pointer ${getPlatformColor(item.item.platforms[0] || 'default')}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewContent(item.item);
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1 flex-1">
                                      {getPlatformIcon(item.item.platforms[0] || 'default')}
                                      {getStatusIcon(item.item.status)}
                                    </div>
                                    {onMarkAsPublished && item.item.status !== 'published' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onMarkAsPublished(item.item.id);
                                        }}
                                        className="px-1 py-0.5 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
                                        title="Publicar"
                                      >
                                        ✓
                                      </button>
                                    )}
                                  </div>
                                  <div className="truncate mt-1 font-medium">
                                    {item.item.title}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    {item.item.publish_date && (
                                      <div className="text-xs opacity-75">
                                        {item.item.publish_date.toLocaleTimeString('en-US', { 
                                          hour: 'numeric', 
                                          minute: '2-digit' 
                                        })}
                                      </div>
                                    )}
                                    <div className="text-xs opacity-75">
                                      {getStatusLabel(item.item.status)}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  key={item.item.id}
                                  className={`p-1 rounded text-xs border cursor-pointer hover:shadow-sm transition-all ${
                                    item.item.status === 'done' 
                                      ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewTask(item.item);
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1">
                                      {item.item.status === 'done' ? (
                                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                                      ) : (
                                        <XCircle className="w-3 h-3 text-gray-400" />
                                      )}
                                      <span className="text-xs font-medium">Task</span>
                                    </div>
                                  </div>
                                  <div className="truncate mt-1 font-medium">
                                    {item.item.title}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {item.item.priority}
                                  </div>
                                </div>
                              )
                            );
                          })()}
                          
                          {/* Show more indicators */}
                          {(dayContent.length + dayTasks.length > 2) && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{dayContent.length + dayTasks.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Day View Modal */}
      {selectedDay && (
        <DayViewModal
          isOpen={isDayViewOpen}
          onClose={handleCloseDayView}
          date={selectedDay}
          tasks={getTasksForDate(selectedDay)}
          contentItems={getContentForDate(selectedDay)}
          onViewTask={onViewTask}
                      onViewContent={onViewContent}
          onConvertTaskToContent={onConvertTaskToContent}
        />
      )}
    </div>
  );
};

export default ContentCalendar;