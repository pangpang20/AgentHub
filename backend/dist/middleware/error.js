"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.name,
            message: err.message,
            code: err.code,
            ...(err.details && { details: err.details }),
        });
        return;
    }
    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err;
        switch (prismaError.code) {
            case 'P2002':
                res.status(409).json({
                    error: 'Conflict',
                    message: 'A record with this value already exists',
                    code: 'DUPLICATE_RECORD',
                });
                return;
            case 'P2025':
                res.status(404).json({
                    error: 'Not Found',
                    message: 'Record not found',
                    code: 'RECORD_NOT_FOUND',
                });
                return;
            default:
                res.status(500).json({
                    error: 'Database Error',
                    message: 'A database error occurred',
                    code: 'DATABASE_ERROR',
                });
                return;
        }
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid token',
            code: 'INVALID_TOKEN',
        });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Token expired',
            code: 'TOKEN_EXPIRED',
        });
        return;
    }
    // Default error
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        code: 'ROUTE_NOT_FOUND',
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.js.map