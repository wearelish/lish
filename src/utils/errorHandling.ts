/**
 * Centralized Error Handling for LISH Platform
 * Provides consistent error messages and logging
 */

import { toast } from 'sonner';

export type ErrorType = 
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'database'
  | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  timestamp: Date;
}

// User-friendly error messages
const ERROR_MESSAGES: Record<ErrorType, string> = {
  network: 'Network error. Please check your connection and try again.',
  authentication: 'Authentication failed. Please sign in again.',
  authorization: 'You don\'t have permission to perform this action.',
  validation: 'Please check your input and try again.',
  database: 'Database error. Please try again later.',
  unknown: 'Something went wrong. Please try again.',
};

// Determine error type from error object
export const getErrorType = (error: any): ErrorType => {
  if (!error) return 'unknown';
  
  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('fetch') || code.includes('network')) {
    return 'network';
  }
  
  if (message.includes('auth') || code.includes('auth') || error.status === 401) {
    return 'authentication';
  }
  
  if (message.includes('permission') || error.status === 403) {
    return 'authorization';
  }
  
  if (message.includes('invalid') || message.includes('required') || error.status === 400) {
    return 'validation';
  }
  
  if (code.includes('23') || message.includes('database') || message.includes('postgres')) {
    return 'database';
  }
  
  return 'unknown';
};

// Create standardized error object
export const createAppError = (error: any): AppError => {
  const type = getErrorType(error);
  
  return {
    type,
    message: ERROR_MESSAGES[type],
    originalError: error,
    timestamp: new Date(),
  };
};

// Handle error with toast notification
export const handleError = (error: any, customMessage?: string): AppError => {
  const appError = createAppError(error);
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('[Error Handler]', {
      type: appError.type,
      message: appError.message,
      original: appError.originalError,
      timestamp: appError.timestamp,
    });
  }
  
  // Show user-friendly toast
  toast.error(customMessage || appError.message);
  
  return appError;
};

// Async error wrapper
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  customMessage?: string
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    handleError(error, customMessage);
    return null;
  }
};

// Retry logic for failed requests
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
};

export const validateRequired = (value: any, fieldName: string): { valid: boolean; message?: string } => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  return { valid: true };
};
