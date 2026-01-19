export declare class CacheService {
    private static prefix;
    private static getKey;
    static get<T>(key: string): Promise<T | null>;
    static set(key: string, value: any, ttl?: number): Promise<void>;
    static del(key: string): Promise<void>;
    static delPattern(pattern: string): Promise<void>;
    static exists(key: string): Promise<boolean>;
    static readonly KEYS: {
        USER: (id: string) => string;
        AGENT: (id: string) => string;
        AGENTS_LIST: (userId: string) => string;
        CONVERSATION: (id: string) => string;
        CONVERSATIONS_LIST: (userId: string) => string;
        KNOWLEDGE_BASE: (id: string) => string;
        PLUGIN: (id: string) => string;
        TEMPLATE: (id: string) => string;
    };
    static readonly TTL: {
        SHORT: number;
        MEDIUM: number;
        LONG: number;
        VERY_LONG: number;
    };
}
export default CacheService;
//# sourceMappingURL=cache.d.ts.map