import React from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Plus,
  SortAsc
} from 'lucide-react';
import { Project, TaskFilter } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  selectedProject: Project | null;
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  onCreateTask: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user?: SupabaseUser | null;
}

const Header: React.FC<HeaderProps> = ({
  selectedProject,
  filter,
  onFilterChange,
  onCreateTask,
  searchQuery,
  onSearchChange,
  user,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Project Title */}
          <div className="flex items-center space-x-3">
            {selectedProject && (
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedProject.color }}
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedProject ? selectedProject.name : 'All Tasks'}
            </h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filter Controls */}
          <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
          </button>

          <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <SortAsc className="w-4 h-4" />
            <span className="text-sm font-medium">Sort</span>
          </button>

          <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Assignee</span>
          </button>

          <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Due Date</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            {/* Notifications */}
            {/* New Task Button */}
            <button
              onClick={onCreateTask}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;