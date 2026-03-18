import React from 'react';
import { cn } from '../lib/utils';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner = ({ className, size = 'md' }: Props) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={cn(
      "border-primary border-t-transparent rounded-full animate-spin",
      sizes[size],
      className
    )} />
  );
};

export const FullPageLoading = ({ message }: { message?: string }) => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
    <LoadingSpinner size="lg" />
    {message && <p className="text-slate-500 font-medium animate-pulse">{message}</p>}
  </div>
);
