import React from 'react';

// Base skeleton component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Property card skeleton for loading states
export const PropertyCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {/* Image skeleton */}
    <Skeleton className="w-full h-48" />

    <div className="p-4">
      {/* Title skeleton */}
      <Skeleton className="h-6 w-3/4 mb-2" />

      {/* Price skeleton */}
      <Skeleton className="h-5 w-1/2 mb-3" />

      {/* Location skeleton */}
      <Skeleton className="h-4 w-2/3 mb-3" />

      {/* Features skeleton */}
      <div className="flex gap-4 mb-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Button skeleton */}
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

// Blog post skeleton
export const BlogPostSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {/* Image skeleton */}
    <Skeleton className="w-full h-40" />

    <div className="p-4">
      {/* Title skeleton */}
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-3/4 mb-3" />

      {/* Excerpt skeleton */}
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-3" />

      {/* Date skeleton */}
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

// Grid of property skeletons
export const PropertyGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, index) => (
      <PropertyCardSkeleton key={index} />
    ))}
  </div>
);

// Grid of blog post skeletons
export const BlogGridSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <BlogPostSkeleton key={index} />
    ))}
  </div>
);

// Loading spinner component
export const LoadingSpinner = ({ size = 'md', className = '' }: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${sizeClasses[size]} ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Full page loading state
export const PageLoadingState = ({ message = 'Cargando...' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" className="text-blue-600 mb-4" />
    <p className="text-gray-600 text-lg">{message}</p>
  </div>
);

// Section loading state (for parts of a page)
export const SectionLoadingState = ({
  message = 'Cargando contenido...',
  height = 'h-64'
}: {
  message?: string;
  height?: string;
}) => (
  <div className={`flex flex-col items-center justify-center ${height}`}>
    <LoadingSpinner className="text-blue-600 mb-3" />
    <p className="text-gray-500">{message}</p>
  </div>
);

// Button loading state
export const ButtonLoadingState = ({
  loading,
  children,
  ...props
}: {
  loading: boolean;
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`${props.className} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
  >
    {loading ? (
      <div className="flex items-center justify-center gap-2">
        <LoadingSpinner size="sm" />
        <span>Cargando...</span>
      </div>
    ) : (
      children
    )}
  </button>
);

// Empty state component (when no data)
export const EmptyState = ({
  title = 'No hay contenido',
  description = 'No se encontraron elementos para mostrar.',
  action
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="text-center py-12">
    <div className="mb-4">
      {/* Empty state icon */}
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-2 2m-6 6l-2 2m2-2L8 9m6 6L8 15" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4">{description}</p>
    {action && <div>{action}</div>}
  </div>
);

// Error state component
export const ErrorState = ({
  title = 'Error al cargar',
  description = 'Ocurrió un error al cargar el contenido.',
  onRetry,
  showRetry = true
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}) => (
  <div className="text-center py-12">
    <div className="mb-4">
      {/* Error icon */}
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4">{description}</p>
    {showRetry && onRetry && (
      <button
        onClick={onRetry}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Intentar de nuevo
      </button>
    )}
  </div>
);