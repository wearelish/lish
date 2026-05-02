/**
 * Reusable Loading Spinner Component
 * Consistent loading states across the application
 */

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
};

export const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false,
  message 
}: LoadingSpinnerProps) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div 
        className={`${sizeClasses[size]} border-primary/30 border-t-primary rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Skeleton loader for content
export const SkeletonLoader = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

// Card skeleton
export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
    <SkeletonLoader className="h-6 w-3/4" />
    <SkeletonLoader className="h-4 w-full" />
    <SkeletonLoader className="h-4 w-5/6" />
    <div className="flex gap-2 pt-2">
      <SkeletonLoader className="h-8 w-20" />
      <SkeletonLoader className="h-8 w-20" />
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-border">
        <SkeletonLoader className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader className="h-4 w-1/3" />
          <SkeletonLoader className="h-3 w-1/2" />
        </div>
        <SkeletonLoader className="h-8 w-24" />
      </div>
    ))}
  </div>
);
