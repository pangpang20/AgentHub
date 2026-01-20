"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.livenessCheck = exports.readinessCheck = exports.healthCheck = void 0;
const database_1 = __importDefault(require("../config/database"));
const redis_1 = __importDefault(require("../config/redis"));
const performance_1 = __importDefault(require("../services/performance"));
// Helper function to add timeout to promises
const withTimeout = (promise, timeoutMs, errorMessage) => {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]);
};
const healthCheck = async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            database: 'unhealthy',
            redis: 'unhealthy',
        },
    };
    try {
        // Check database connection with timeout
        await withTimeout(database_1.default.$queryRaw `SELECT 1`, 5000, 'Database connection timeout');
        health.services.database = 'healthy';
    }
    catch (error) {
        health.status = 'unhealthy';
        health.services.database = 'unhealthy';
    }
    try {
        // Check Redis connection with timeout
        await withTimeout(redis_1.default.ping(), 3000, 'Redis connection timeout');
        health.services.redis = 'healthy';
    }
    catch (error) {
        health.status = 'unhealthy';
        health.services.redis = 'unhealthy';
    }
    // Add metrics if detailed health check
    if (req.query.detailed === 'true') {
        health.metrics = {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
        };
    }
    // Add performance metrics if available
    if (req.query.performance === 'true') {
        const perfMetrics = performance_1.default.getAllMetrics();
        if (Object.keys(perfMetrics).length > 0) {
            health.performance = perfMetrics;
        }
    }
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
};
exports.healthCheck = healthCheck;
const readinessCheck = async (_req, res) => {
    const ready = {
        ready: true,
        timestamp: new Date().toISOString(),
    };
    try {
        // Check if database is ready with timeout
        await withTimeout(database_1.default.$queryRaw `SELECT 1`, 5000, 'Database connection timeout');
    }
    catch {
        ready.ready = false;
        res.status(503).json(ready);
        return;
    }
    try {
        // Check if Redis is ready with timeout
        await withTimeout(redis_1.default.ping(), 3000, 'Redis connection timeout');
    }
    catch {
        ready.ready = false;
        res.status(503).json(ready);
        return;
    }
    res.json(ready);
};
exports.readinessCheck = readinessCheck;
const livenessCheck = async (_req, res) => {
    const alive = {
        alive: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    };
    res.json(alive);
};
exports.livenessCheck = livenessCheck;
//# sourceMappingURL=health.js.map