import { Request, Response, NextFunction } from 'express';
export interface LogRequest extends Request {
    id?: string;
    startTime?: number;
}
export declare const requestLogger: (req: LogRequest, res: Response, next: NextFunction) => void;
export declare const errorLogger: (err: Error, req: LogRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=logging.d.ts.map