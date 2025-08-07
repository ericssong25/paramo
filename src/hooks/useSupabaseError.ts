import { useState, useCallback } from 'react';

export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export const useSupabaseError = () => {
  const [error, setError] = useState<SupabaseError | null>(null);

  const handleError = useCallback((error: any) => {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = '';
    let errorDetails = '';
    let errorHint = '';

    if (error?.message) {
      errorMessage = error.message;
    }

    if (error?.code) {
      errorCode = error.code;
    }

    if (error?.details) {
      errorDetails = error.details;
    }

    if (error?.hint) {
      errorHint = error.hint;
    }

    // Handle specific Supabase errors
    if (errorCode === '42501') {
      errorMessage = 'Access denied. You may not have permission to perform this action.';
      errorHint = 'This is likely due to Row Level Security (RLS) policies.';
    } else if (errorCode === '23503') {
      errorMessage = 'Cannot create or update record. Referenced record does not exist.';
      errorHint = 'Please check that all referenced data exists.';
    } else if (errorCode === '23505') {
      errorMessage = 'Record already exists with these unique values.';
      errorHint = 'Please use different values or update the existing record.';
    } else if (errorCode === '42P01') {
      errorMessage = 'Table does not exist.';
      errorHint = 'Please check your database schema.';
    }

    setError({
      message: errorMessage,
      code: errorCode,
      details: errorDetails,
      hint: errorHint
    });

    // Log error for debugging
    console.error('Supabase Error:', {
      message: errorMessage,
      code: errorCode,
      details: errorDetails,
      hint: errorHint,
      originalError: error
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};
