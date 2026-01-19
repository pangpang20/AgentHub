"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const redis_1 = __importDefault(require("../config/redis"));
class CacheService {
    static prefix = 'agenthub:';
    static getKey(key) {
        return `${this.prefix}${key}`;
    }
    static async get(key) {
        try {
            const data = await redis_1.default.get(this.getKey(key));
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    static async set(key, value, ttl = 3600) {
        try {
            await redis_1.default.setEx(this.getKey(key), ttl, JSON.stringify(value));
        }
        catch (error) {
            console.error('Cache set error:', error);
        }
    }
    static async del(key) {
        try {
            await redis_1.default.del(this.getKey(key));
        }
        catch (error) {
            console.error('Cache delete error:', error);
        }
    }
    static async delPattern(pattern) {
        try {
            const keys = await redis_1.default.keys(`${this.prefix}${pattern}`);
            if (keys.length > 0) {
                await redis_1.default.del(keys);
            }
        }
        catch (error) {
            console.error('Cache delete pattern error:', error);
        }
    }
    static async exists(key) {
        try {
            const result = await redis_1.default.exists(this.getKey(key));
            return result > 0;
        }
        catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }
    // Cache keys
    static KEYS = {
        USER: (id) => `user:${id}`,
        AGENT: (id) => `agent:${id}`,
        AGENTS_LIST: (userId) => `agents:${userId}`,
        CONVERSATION: (id) => `conversation:${id}`,
        CONVERSATIONS_LIST: (userId) => `conversations:${userId}`,
        KNOWLEDGE_BASE: (id) => `kb:${id}`,
        PLUGIN: (id) => `plugin:${id}`,
        TEMPLATE: (id) => `template:${id}`,
    };
    // Cache TTLs (in seconds)
    static TTL = {
        SHORT: 300, // 5 minutes
        MEDIUM: 3600, // 1 hour
        LONG: 86400, // 1 day
        VERY_LONG: 604800, // 1 week
    };
}
exports.CacheService = CacheService;
exports.default = CacheService;
//# sourceMappingURL=cache.js.map