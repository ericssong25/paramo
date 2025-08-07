import React from 'react';
import { supabase } from '../lib/supabase';

interface SupabaseStatusProps {
  onStatusChange?: (isConnected: boolean) => void;
}

const SupabaseStatus: React.FC<SupabaseStatusProps> = ({ onStatusChange }) => {
  const [isConnected, setIsConnected] = React.useState<boolean | null>(null);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsChecking(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (error) {
          console.warn('Supabase connection warning:', error.message);
          setIsConnected(false);
        } else {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
  }, []);

  React.useEffect(() => {
    if (onStatusChange && isConnected !== null) {
      onStatusChange(isConnected);
    }
  }, [isConnected, onStatusChange]);

  if (isChecking) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        <span>Conectando a Supabase...</span>
      </div>
    );
  }

  if (isConnected === false) {
    return (
      <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-md">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span>Modo offline - Usando datos locales</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>Conectado a Supabase</span>
    </div>
  );
};

export default SupabaseStatus;
