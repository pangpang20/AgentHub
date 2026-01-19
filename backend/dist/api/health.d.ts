import { Request, Response } from 'express';
export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    environment: string;
    services: {
        database: 'healthy' | 'unhealthy';
        redis: 'healthy' | 'unhealthy';
    };
    metrics?: {
        memory: NodeJS.MemoryUsage;
        cpu: NodeJS.CpuUsage;
    };
}
export declare const healthCheck: (req: Request, res: Response) => Promise<void>;
export declare const readinessCheck: (_req: Request, res: Response) => Promise<void>;
export declare const livenessCheck: (_req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=health.d.ts.map