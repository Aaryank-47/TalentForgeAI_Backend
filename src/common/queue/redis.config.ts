import type { ConnectionOptions } from "bullmq";
import { Redis } from "ioredis";
import env from "../../config/env.js";

// Note: BullMQ requires `maxRetriesPerRequest: null`.
export const redisConnectionConfig: ConnectionOptions = {
    host: env.redis.host,
    port: env.redis.port,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times: number) {
        // Exponential backoff with jitter, up to 5 seconds
        const delay = Math.min(times * 200, 5000);
        return delay;
    }
};

// Factory for creating dedicated Redis instances when needed.
export const createRedisConnection = (
    customOptions?: Partial<ConnectionOptions>
): Redis => {
    return new Redis({
        ...redisConnectionConfig,
        ...customOptions
    } as any);
};

