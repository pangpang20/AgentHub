import { performance } from 'perf_hooks';

export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      PerformanceMonitor.record(label, duration);
    };
  }

  static record(label: string, duration: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
  }

  static getMetrics(label: string): {
    avg: number;
    min: number;
    max: number;
    count: number;
  } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) {
      return null;
    }

    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  static getAllMetrics(): Record<string, ReturnType<typeof PerformanceMonitor.getMetrics>> {
    const result: Record<string, ReturnType<typeof PerformanceMonitor.getMetrics>> = {};
    for (const [label] of this.metrics) {
      result[label] = this.getMetrics(label);
    }
    return result;
  }

  static reset(): void {
    this.metrics.clear();
  }

  static logMetrics(): void {
    const metrics = this.getAllMetrics();
    console.log('Performance Metrics:');
    for (const [label, stats] of Object.entries(metrics)) {
      if (stats) {
        console.log(`  ${label}:`);
        console.log(`    Count: ${stats.count}`);
        console.log(`    Avg:   ${stats.avg.toFixed(2)}ms`);
        console.log(`    Min:   ${stats.min.toFixed(2)}ms`);
        console.log(`    Max:   ${stats.max.toFixed(2)}ms`);
      }
    }
  }
}

// Middleware for Express
export function performanceMonitoringMiddleware(req: any, res: any, next: any): void {
  const endTimer = PerformanceMonitor.startTimer(`${req.method} ${req.path}`);
  
  res.on('finish', () => {
    endTimer();
  });

  next();
}

// Decorator for functions
export function measurePerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const endTimer = PerformanceMonitor.startTimer(`${target.constructor.name}.${propertyKey}`);
    try {
      const result = await originalMethod.apply(this, args);
      return result;
    } finally {
      endTimer();
    }
  };
}

export default PerformanceMonitor;
