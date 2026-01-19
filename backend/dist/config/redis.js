"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectRedis = exports.connectRedis = void 0;
const redis_1 = require("redis");
const index_1 = __importDefault(require("./index"));
const redis = (0, redis_1.createClient)({
    url: index_1.default.redisUrl,
});
redis.on('error', (err) => console.error('Redis Client Error:', err));
redis.on('connect', () => console.log('Redis Client Connected'));
redis.on('disconnect', () => console.log('Redis Client Disconnected'));
const connectRedis = async () => {
    try {
        await redis.connect();
    }
    catch (error) {
        console.error('Failed to connect to Redis:', error);
        // Don't throw error, allow app to continue without Redis
    }
};
exports.connectRedis = connectRedis;
const disconnectRedis = async () => {
    await redis.disconnect();
};
exports.disconnectRedis = disconnectRedis;
exports.default = redis;
//# sourceMappingURL=redis.js.map