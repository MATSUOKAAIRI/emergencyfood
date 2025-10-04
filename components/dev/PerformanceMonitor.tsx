'use client';
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

interface PerformanceMonitorProps {
  componentName: string;
  enabled?: boolean;
  children: React.ReactNode;
}

/**
 * Development component to monitor render performance
 * Only use in development environment
 */
export function PerformanceMonitor({
  componentName,
  enabled = process.env.NODE_ENV === 'development',
  children,
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();

    setMetrics(prev => {
      const renderTime = performance.now() - startTime;
      const newCount = prev.renderCount + 1;
      const newAverage =
        (prev.averageRenderTime * prev.renderCount + renderTime) / newCount;

      return {
        renderCount: newCount,
        lastRenderTime: renderTime,
        averageRenderTime: newAverage,
      };
    });

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🔍 ${componentName} Performance:`, {
        renderCount: metrics.renderCount + 1,
        lastRenderTime: `${(performance.now() - startTime).toFixed(2)}ms`,
        averageRenderTime: `${metrics.averageRenderTime.toFixed(2)}ms`,
      });
    }
  }, [enabled, componentName, metrics.renderCount, metrics.averageRenderTime]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div data-performance-monitor={componentName}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 9999,
          }}
        >
          <div>{componentName}</div>
          <div>Renders: {metrics.renderCount}</div>
          <div>Last: {metrics.lastRenderTime.toFixed(2)}ms</div>
          <div>Avg: {metrics.averageRenderTime.toFixed(2)}ms</div>
        </div>
      )}
    </div>
  );
}
