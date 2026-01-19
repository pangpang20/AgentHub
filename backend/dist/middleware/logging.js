"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.requestLogger = void 0;
const uuid_1 = require("uuid");
const requestLogger = (req, res, next) => {
    // Generate unique request ID
    req.id = (0, uuid_1.v4)();
    req.startTime = Date.now();
    // Log request
    console.log(`[${req.id}] ${req.method} ${req.path} - Start`);
    // Log response
    res.on('finish', () => {
        const duration = req.startTime ? Date.now() - req.startTime : 0;
        console.log(`[${req.id}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
};
exports.requestLogger = requestLogger;
const errorLogger = (err, req, _res, next) => {
    console.error(`[${req.id || 'unknown'}] Error:`, {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    next(err);
};
exports.errorLogger = errorLogger;
//# sourceMappingURL=logging.js.map