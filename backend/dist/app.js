"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const logging_1 = require("./middleware/logging");
const error_1 = require("./middleware/error");
const config_1 = __importDefault(require("./config"));
const redis_1 = require("./config/redis");
const index_1 = __importDefault(require("./api/index"));
const auth_1 = __importDefault(require("./api/auth"));
const agents_1 = __importDefault(require("./api/agents"));
const conversations_1 = __importDefault(require("./api/conversations"));
const knowledge_base_1 = __importDefault(require("./api/knowledge-base"));
const plugins_1 = __importDefault(require("./api/plugins"));
const templates_1 = __importDefault(require("./api/templates"));
const users_1 = __importDefault(require("./api/users"));
const health_1 = require("./api/health");
const createApp = () => {
    const app = (0, express_1.default)();
    // Security middleware
    app.use((0, helmet_1.default)());
    // CORS configuration - allow multiple origins for development
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3003',
        config_1.default.frontendUrl,
    ];
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }));
    // Body parsing middleware
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Request logging
    app.use(logging_1.requestLogger);
    // Health check endpoints
    app.get('/health', health_1.healthCheck);
    app.get('/health/readiness', health_1.readinessCheck);
    app.get('/health/liveness', health_1.livenessCheck);
    // API routes
    app.use('/v1', index_1.default);
    app.use('/v1/auth', auth_1.default);
    app.use('/v1/agents', agents_1.default);
    app.use('/v1/conversations', conversations_1.default);
    app.use('/v1/knowledge-base', knowledge_base_1.default);
    app.use('/v1/plugins', plugins_1.default);
    app.use('/v1/templates', templates_1.default);
    app.use('/v1/users', users_1.default);
    // 404 handler
    app.use(error_1.notFoundHandler);
    // Error handler (must be last)
    app.use(error_1.errorHandler);
    return app;
};
exports.createApp = createApp;
const startServer = async () => {
    try {
        console.log('Starting server...');
        console.log('Connecting to Redis...');
        // Connect to Redis
        await (0, redis_1.connectRedis)();
        console.log('Redis connection completed');
        const app = createApp();
        console.log('Express app created');
        app.listen(config_1.default.port, () => {
            console.log(`🚀 Server is running on port ${config_1.default.port}`);
            console.log(`📝 Environment: ${config_1.default.nodeEnv}`);
            console.log(`🔗 Frontend URL: ${config_1.default.frontendUrl}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
exports.startServer = startServer;
// Start server if this file is run directly
if (require.main === module) {
    startServer();
}
exports.default = createApp;
//# sourceMappingURL=app.js.map