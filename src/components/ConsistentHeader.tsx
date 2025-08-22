import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface ConsistentHeaderProps {
  title: string | React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  onCreateAction?: () => void;
  createActionLabel?: string;
  showSearch?: boolean;
  showCreateButton?: boolean;
  children?: React.ReactNode;
}

const ConsistentHeader: React.FC<ConsistentHeaderProps> = ({
  title,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder,
  onCreateAction,
  createActionLabel,
  showSearch = true,
  showCreateButton = true,
  children
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Title */}
          {typeof title === 'string' ? (
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
          ) : (
            <div className="text-2xl font-bold text-gray-900">
              {title}
            </div>
          )}

          {/* Search */}
          {showSearch && onSearchChange && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={searchPlaceholder || t('common.search')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-52 md:w-64"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Custom children content */}
          {children}

          {/* Create Button */}
          {showCreateButton && onCreateAction && (
            <button
              onClick={onCreateAction}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">{createActionLabel || t('common.create')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsistentHeader;
