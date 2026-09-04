import type { ConnectionOptions } from "bullmq";
import { Redis } from "ioredis";
import { createClient } from "redis";
import env from "../../config/env.js";

// Note: BullMQ requires `maxRetriesPerRequest: null`.
export const redisConnectionConfig: ConnectionOptions = env.redis.url
    ? {
        url: env.redis.url,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        keepAlive: 10000,
        family: 4,
        tls: env.redis.url.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
    }
    : {
        host: env.redis.host,
        port: env.redis.port,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        keepAlive: 10000,
        family: 4,
    };

class RedisFailoverManager {
    private urls: string[];
    private currentIndex: number = -1;

    constructor(urls: string[]) {
        this.urls = urls;
    }

    getNextUrl(): string | undefined {
        if (this.urls.length === 0) return undefined;
        this.currentIndex = (this.currentIndex + 1) % this.urls.length;
        return this.urls[this.currentIndex];
    }
}

const failoverManager = new RedisFailoverManager(env.redisCloud.fallbackUrls || []);

// Factory for creating dedicated Redis instances when needed.
export const createRedisConnection = (
    customOptions?: Partial<ConnectionOptions>
): Redis => {
    let instanceFailoverRequested = false;
    
    const options: any = {
        ...redisConnectionConfig,
        ...customOptions,
        reconnectOnError(err: any) {
            if (err && err.message && err.message.includes('max requests limit exceeded')) {
                console.error("[Redis] Max requests limit hit. Requesting failover...");
                instanceFailoverRequested = true;
                return true; 
            }
            if ((customOptions as any)?.reconnectOnError) {
                return (customOptions as any).reconnectOnError(err);
            }
            return false;
        },
        retryStrategy(times: number) {
            if (process.env.NODE_ENV === "test" && times > 1) {
                return null;
            }
            if (instanceFailoverRequested && instance) {
                instanceFailoverRequested = false;
                const nextUrl = failoverManager.getNextUrl();
                if (nextUrl) {
                    console.warn(`[Redis] Failing over to next fallback URL: ${nextUrl.split('@')[1] || nextUrl}`);
                    const parsed = new URL(nextUrl);
                    instance.options.host = parsed.hostname;
                    instance.options.port = parseInt(parsed.port, 10);
                    instance.options.password = parsed.password;
                    instance.options.username = parsed.username || "default";
                    instance.options.tls = nextUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined;
                }
            }
            return Math.min(times * 200, 5000);
        }
    };

    let instance: Redis;
    if (env.redis.url) {
        options.tls = env.redis.url.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined;
        instance = new Redis(env.redis.url, options);
    } else {
        instance = new Redis(options);
    }

    return instance;
};

// --- New Redis Cloud Connection ---

export let redisCloudClient: any = null;

const createRedisCloudClient = (url: string) => {
    const client = createClient({
        url,
        socket: {
            reconnectStrategy: (retries: number) => Math.min(retries * 200, 5000)
        }
    });

    client.on('error', (err: Error) => {
        if (err.message && err.message.includes('max requests limit exceeded')) {
            console.warn(`[Node-Redis] Max requests limit hit on ${url.split('@')[1] || url}.`);
            const nextUrl = failoverManager.getNextUrl();
            if (nextUrl) {
                console.warn(`[Node-Redis] Failing over to next fallback URL: ${nextUrl.split('@')[1] || nextUrl}`);
                // Disconnect current client cleanly
                client.disconnect().catch(() => {});
                
                // Recreate client
                redisCloudClient = createRedisCloudClient(nextUrl);
            }
        } else {
            console.error('Redis Cloud Client Error', err);
        }
    });

    client.connect().catch(console.error);
    return client;
};

if (env.redisCloud.url) {
    redisCloudClient = createRedisCloudClient(env.redisCloud.url);
}

