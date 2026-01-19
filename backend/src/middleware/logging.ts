import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface LogRequest extends Request {
  id?: string;
  startTime?: number;
}

export const requestLogger = (req: LogRequest, res: Response, next: NextFunction): void => {
  // Generate unique request ID
  req.id = uuidv4();
  req.startTime = Date.now();

  // Log request
  console.log(`[${req.id}] ${req.method} ${req.path} - Start`);

  // Log response
  res.on('finish', () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    console.log(
      `[${req.id}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

export const errorLogger = (
  err: Error,
  req: LogRequest,
  _res: Response,
  next: NextFunction
): void => {
  console.error(`[${req.id || 'unknown'}] Error:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  next(err);
};
