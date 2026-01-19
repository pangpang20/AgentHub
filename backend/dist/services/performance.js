"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = void 0;
exports.performanceMonitoringMiddleware = performanceMonitoringMiddleware;
exports.measurePerformance = measurePerformance;
const perf_hooks_1 = require("perf_hooks");
class PerformanceMonitor {
    static metrics = new Map();
    static startTimer(label) {
        const start = perf_hooks_1.performance.now();
        return () => {
            const duration = perf_hooks_1.performance.now() - start;
            PerformanceMonitor.record(label, duration);
        };
    }
    static record(label, duration) {
        if (!this.metrics.has(label)) {
            this.metrics.set(label, []);
        }
        this.metrics.get(label).push(duration);
    }
    static getMetrics(label) {
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
    static getAllMetrics() {
        const result = {};
        for (const [label] of this.metrics) {
            result[label] = this.getMetrics(label);
        }
        return result;
    }
    static reset() {
        this.metrics.clear();
    }
    static logMetrics() {
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
exports.PerformanceMonitor = PerformanceMonitor;
// Middleware for Express
function performanceMonitoringMiddleware(req, res, next) {
    const endTimer = PerformanceMonitor.startTimer(`${req.method} ${req.path}`);
    res.on('finish', () => {
        endTimer();
    });
    next();
}
// Decorator for functions
function measurePerformance(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args) {
        const endTimer = PerformanceMonitor.startTimer(`${target.constructor.name}.${propertyKey}`);
        try {
            const result = await originalMethod.apply(this, args);
            return result;
        }
        finally {
            endTimer();
        }
    };
}
exports.default = PerformanceMonitor;
//# sourceMappingURL=performance.js.map