import type { ConnectionOptions } from "bullmq";
import { Redis } from "ioredis";
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
        retryStrategy(times: number) {
            if (process.env.NODE_ENV === "test" && times > 1) {
                return null;
            }
            const delay = Math.min(times * 200, 5000);
            return delay;
        }
    }
    : {
        host: env.redis.host,
        port: env.redis.port,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        keepAlive: 10000,
        family: 4,
        retryStrategy(times: number) {
            if (process.env.NODE_ENV === "test" && times > 1) {
                return null;
            }
            const delay = Math.min(times * 200, 5000);
            return delay;
        }
    };

// Factory for creating dedicated Redis instances when needed.
export const createRedisConnection = (
    customOptions?: Partial<ConnectionOptions>
): Redis => {
    if (env.redis.url) {
        return new Redis(env.redis.url, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            tls: env.redis.url.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
            ...customOptions
        } as any);
    }
    return new Redis({
        ...redisConnectionConfig,
        ...customOptions
    } as any);
};

