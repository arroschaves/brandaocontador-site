'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorDisplay onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

// Componente de erro para o usuário
function ErrorDisplay({ onRetry }: { onRetry: () => void }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground">
          Algo deu errado
        </h2>

        <p className="text-muted-foreground">
          Encontramos um problema ao carregar esta página. Por favor, tente
          novamente.
        </p>

        <div className="flex gap-3 justify-center pt-4">
          <button
            onClick={onRetry}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'border border-border',
              'hover:bg-accent transition-colors'
            )}
          >
            <Home className="w-4 h-4" />
            Ir para início
          </button>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {showDetails ? 'Ocultar detalhes' : 'Mostrar detalhes'}
        </button>

        {showDetails && (
          <div className="text-left p-4 bg-muted rounded-lg text-sm font-mono overflow-auto max-h-40">
            <p className="text-destructive">
              Erro: Algum problema técnico ocorreu
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              Se o problema persistir, entre em contato conosco.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook para tratamento de erros em componentes funcionais
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (error) {
      console.error('[useErrorHandler] Erro:', error);
      // Aqui você pode enviar para um serviço de error tracking
    }
  }, [error]);

  const handleError = (err: Error | string) => {
    const error = typeof err === 'string' ? new Error(err) : err;
    setError(error);
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
}

// Error display para API errors
interface ApiErrorProps {
  error: string | Error;
  onRetry?: () => void;
  className?: string;
}

export function ApiErrorDisplay({ error, onRetry, className }: ApiErrorProps) {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <div className={cn('p-4 rounded-lg bg-destructive/10 border border-destructive/20', className)}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-destructive font-medium">Erro na requisição</p>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Necessário imports
import React from 'react';