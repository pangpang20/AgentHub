import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    details?: any;
    constructor(message: string, statusCode?: number, code?: string, details?: any);
}
export declare const errorHandler: (err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
//# sourceMappingURL=error.d.ts.map