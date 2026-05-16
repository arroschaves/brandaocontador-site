/**
 * Componentes de Loading e Skeleton
 */

import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ className, size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-primary border-t-transparent',
          sizeClasses[size]
        )}
      />
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        variantClasses[variant],
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" variant="text" />
      <Skeleton className="h-3 w-full" variant="text" />
      <Skeleton className="h-3 w-2/3" variant="text" />
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Skeleton className="h-48 w-full" variant="rectangular" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" variant="text" />
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-2/3" variant="text" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-3 w-16" variant="text" />
          <Skeleton className="h-3 w-20" variant="text" />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" variant="text" />
        <Skeleton className="h-10 w-full" variant="rectangular" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" variant="text" />
        <Skeleton className="h-10 w-full" variant="rectangular" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" variant="text" />
        <Skeleton className="h-24 w-full" variant="rectangular" />
      </div>
      <Skeleton className="h-10 w-32" variant="rectangular" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" />
    </div>
  );
}