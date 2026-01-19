import redis from '../config/redis';

export class CacheService {
  private static prefix = 'agenthub:';

  private static getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(this.getKey(key));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await redis.setEx(this.getKey(key), ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(this.getKey(key));
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(`${this.prefix}${pattern}`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(this.getKey(key));
      return result > 0;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Cache keys
  static readonly KEYS = {
    USER: (id: string) => `user:${id}`,
    AGENT: (id: string) => `agent:${id}`,
    AGENTS_LIST: (userId: string) => `agents:${userId}`,
    CONVERSATION: (id: string) => `conversation:${id}`,
    CONVERSATIONS_LIST: (userId: string) => `conversations:${userId}`,
    KNOWLEDGE_BASE: (id: string) => `kb:${id}`,
    PLUGIN: (id: string) => `plugin:${id}`,
    TEMPLATE: (id: string) => `template:${id}`,
  };

  // Cache TTLs (in seconds)
  static readonly TTL = {
    SHORT: 300,      // 5 minutes
    MEDIUM: 3600,    // 1 hour
    LONG: 86400,     // 1 day
    VERY_LONG: 604800, // 1 week
  };
}

export default CacheService;
