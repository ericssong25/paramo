import React from 'react';
import { 
  Plus, 
  Users, 
  Settings,
  Home,
  CreditCard,
  Image,
  TrendingUp,
  Bell,
  Archive
} from 'lucide-react';
import { Project, User } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useTranslation } from '../hooks/useTranslation';

interface SidebarProps {
  projects: Project[];
  currentUser: User;
  authenticatedUser: SupabaseUser | null;
  selectedProject: string | null;
  activeView: string;
  onSelectProject: (projectId: string | null) => void;
  onViewChange: (view: string) => void;
  onCreateProject: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  profileName?: string; // nombre proveniente de profiles.name
  userAvatar?: string; // avatar del usuario
}

const Sidebar: React.FC<SidebarProps> = ({
  projects,
  currentUser,
  authenticatedUser,
  selectedProject,
  activeView,
  onSelectProject,
  onViewChange,
  onCreateProject,
  onOpenSettings,
  onOpenNotifications,
  profileName,
  userAvatar,
}) => {
  const { t } = useTranslation();
  const isFinancesSection = activeView === 'finances' || activeView === 'finances-transactions';
  // Truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Priorizar nombre desde profiles.name; luego metadata de auth; luego email/local; por último mock currentUser
  const displayName = profileName
    || authenticatedUser?.user_metadata?.name
    || authenticatedUser?.email?.split('@')[0]
    || currentUser.name;

  const initials = (displayName || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join('');

  // Placeholder de avatar basado en iniciales con paleta
  const AvatarPlaceholder = (
    <div className="w-10 h-10 rounded-full bg-primary text-white border border-muted/40 flex items-center justify-center select-none">
      <span className="font-extrabold tracking-wide text-[13px]">{initials}</span>
    </div>
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border border-muted/40"
              />
            ) : (
              AvatarPlaceholder
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary truncate">
                {displayName}
              </p>
              <p className="text-xs text-muted truncate">
                {truncateText(authenticatedUser?.email || '', 25)}
              </p>
            </div>
          </div>
          
          {/* Notifications */}
          <button 
            onClick={onOpenNotifications}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          <button
            onClick={() => {
              onSelectProject(null);
              onViewChange('tasks');
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeView === 'tasks'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">{t('navigation.allTasks')}</span>
          </button>

          <button 
            onClick={() => {
              onSelectProject(null);
              onViewChange('content');
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeView === 'content'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Image className="w-4 h-4" />
            <span className="text-sm font-medium">{t('navigation.contentCalendar')}</span>
          </button>

          <button 
            onClick={() => onViewChange('subscriptions')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeView === 'subscriptions'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">{t('navigation.subscriptions')}</span>
          </button>

          {/* approvals and global search removed */}

          <div>
            <button 
              onClick={() => onViewChange('finances')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                isFinancesSection
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-3">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">{t('navigation.finances')}</span>
              </span>
            </button>
            {isFinancesSection && (
              <div className="mt-1 pl-8 space-y-1">
                <button
                  onClick={() => onViewChange('finances-transactions')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    activeView === 'finances-transactions' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Transacciones
                </button>
              </div>
            )}
          </div>

          {/* analytics removed */}

          <button 
            onClick={() => { onSelectProject(null); onViewChange('team'); }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeView === 'team' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{t('navigation.team')}</span>
          </button>

          <button
            onClick={() => {
              onSelectProject(null);
              onViewChange('archived');
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeView === 'archived'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span className="text-sm font-medium">{t('navigation.archivedTasks')}</span>
          </button>
        </nav>

        {/* Projects Section */}
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t('projects.title')}
            </h3>
            <button
              onClick={onCreateProject}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => { onSelectProject(project.id); onViewChange('tasks'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors group ${
                  selectedProject === project.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <p className="text-xs text-gray-500">
                    {project.completedTasks}/{project.taskCount} {t('tasks.taskCount')}
                  </p>
                </div>
                <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-current transition-all duration-300"
                    style={{ 
                      width: `${(project.completedTasks / project.taskCount) * 100}%`,
                      backgroundColor: project.color
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50 text-left transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">{t('navigation.settings')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;