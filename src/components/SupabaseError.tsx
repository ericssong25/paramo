import React from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { SupabaseError as SupabaseErrorType } from '../hooks/useSupabaseError';

interface SupabaseErrorProps {
  error: SupabaseErrorType;
  onClose: () => void;
  className?: string;
}

const SupabaseErrorComponent: React.FC<SupabaseErrorProps> = ({ error, onClose, className = '' }) => {
  const getErrorIcon = () => {
    if (error.code === '42501') {
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getErrorColor = () => {
    if (error.code === '42501') {
      return 'bg-orange-50 border-orange-200 text-orange-800';
    }
    return 'bg-red-50 border-red-200 text-red-800';
  };

  return (
    <div className={`border rounded-lg p-4 ${getErrorColor()} ${className}`}>
      <div className="flex items-start space-x-3">
        {getErrorIcon()}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium">
            {error.message}
          </h3>
          
          {error.hint && (
            <div className="mt-2 flex items-start space-x-2">
              <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                {error.hint}
              </p>
            </div>
          )}
          
          {error.code && (
            <p className="mt-1 text-xs text-gray-500">
              Error code: {error.code}
            </p>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SupabaseErrorComponent;
