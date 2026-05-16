/**
 * Monitor de Performance e Analytics
 */

'use client';

import { useEffect, useRef } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';

interface PerformanceMonitorProps {
  enabled?: boolean;
}

export function PerformanceMonitor({ enabled = true }: PerformanceMonitorProps) {
  const analyticsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Web Vitals reporting
    const reportWebVitals = (metric: { name: string; value: number; id: string }) => {
      // Enviar para analytics (exemplo: GA4, Plausible, etc.)
      console.log(`[WebVitals] ${metric.name}:`, {
        value: metric.value,
        id: metric.id,
      });

      // Aqui você pode enviar para seu backend ou serviço de analytics
      if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
        fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'web-vital',
            name: metric.name,
            value: metric.value,
            id: metric.id,
            url: window.location.href,
            timestamp: Date.now(),
          }),
        }).catch(() => {});
      }
    };

    // Monitorar Core Web Vitals
    const metrics = [
      'CLS', // Cumulative Layout Shift
      'FCP', // First Contentful Paint
      'FID', // First Input Delay
      'LCP', // Largest Contentful Paint
      'TTFB', // Time to First Byte
    ];

    // Adicionar observador de performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any) {
        reportWebVitals({
          name: entry.entryType,
          value: entry.value || entry.duration,
          id: entry.name,
        });
      }
    });

    try {
      metrics.forEach((metric) => {
        observer.observe({ type: metric as any, buffered: true });
      });
    } catch (e) {
      console.warn('[Performance] Observer not supported');
    }

    return () => {
      observer.disconnect();
    };
  }, [enabled]);

  return (
    <>
      {/* Speed Insights da Vercel */}
      <SpeedInsights />
    </>
  );
}

/**
 * Analytics Component
 */
export function Analytics() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Google Analytics (se configurado)
    // Substitua pelo seu GA4 Measurement ID
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

    if (GA_ID) {
      // Script de GA4 seria carregado aqui
      console.log('[Analytics] GA4 configured:', GA_ID);
    }
  }, []);

  return null;
}

/**
 * Error Boundary Component
 */
export function ErrorLogger() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Capturar erros não tratados
    const handleError = (event: ErrorEvent) => {
      console.error('[Error]', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      });

      // Enviar para serviço de error tracking
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        fetch('/api/error-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'uncaught-error',
            message: event.message,
            stack: event.error?.stack,
            url: window.location.href,
            timestamp: Date.now(),
          }),
        }).catch(() => {});
      }
    };

    // Capturar Promises rejeitadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[UnhandledPromiseRejection]', {
        reason: event.reason,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}