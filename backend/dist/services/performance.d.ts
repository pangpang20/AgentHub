export declare class PerformanceMonitor {
    private static metrics;
    static startTimer(label: string): () => void;
    static record(label: string, duration: number): void;
    static getMetrics(label: string): {
        avg: number;
        min: number;
        max: number;
        count: number;
    } | null;
    static getAllMetrics(): Record<string, ReturnType<typeof PerformanceMonitor.getMetrics>>;
    static reset(): void;
    static logMetrics(): void;
}
export declare function performanceMonitoringMiddleware(req: any, res: any, next: any): void;
export declare function measurePerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export default PerformanceMonitor;
//# sourceMappingURL=performance.d.ts.map