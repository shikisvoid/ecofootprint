import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Leaf } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-green-500',
        sizeClasses[size],
        className
      )} 
    />
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton = ({ className, variant = 'rectangular' }: SkeletonProps) => {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        variantClasses[variant],
        className
      )}
    />
  );
};

interface CardSkeletonProps {
  className?: string;
}

export const CardSkeleton = ({ className }: CardSkeletonProps) => {
  return (
    <div className={cn(
      'p-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50',
      className
    )}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" variant="text" />
          <Skeleton className="h-10 w-10" variant="circular" />
        </div>
        <Skeleton className="h-8 w-24" variant="text" />
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-3/4" variant="text" />
      </div>
    </div>
  );
};

interface StatSkeletonProps {
  count?: number;
  className?: string;
}

export const StatSkeleton = ({ count = 4, className }: StatSkeletonProps) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

interface PageLoadingProps {
  message?: string;
}

export const PageLoading = ({ message = 'Loading your eco journey...' }: PageLoadingProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-colors duration-300">
      <div className="text-center space-y-6">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
            <Leaf className="text-white animate-pulse" size={32} />
          </div>
          
          {/* Floating particles */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-bounce delay-100" />
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-emerald-400 rounded-full animate-bounce delay-300" />
          <div className="absolute top-1/2 -right-4 w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-500" />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Ecofootprint
          </h2>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">{message}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse" 
                 style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ButtonLoadingProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const ButtonLoading = ({ 
  children, 
  loading = false, 
  className, 
  disabled,
  onClick 
}: ButtonLoadingProps) => {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200',
        'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
        'hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/25',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>
    </button>
  );
};

interface DataLoadingProps {
  rows?: number;
  className?: string;
}

export const DataLoading = ({ rows = 5, className }: DataLoadingProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white/50 dark:bg-gray-900/50 rounded-xl">
          <Skeleton className="h-10 w-10" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" variant="text" />
            <Skeleton className="h-3 w-1/2" variant="text" />
          </div>
          <Skeleton className="h-6 w-16" variant="text" />
        </div>
      ))}
    </div>
  );
};
