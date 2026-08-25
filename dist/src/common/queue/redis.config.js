import { Redis } from "ioredis";
import env from "../../config/env.js";
// Note: BullMQ requires `maxRetriesPerRequest: null`.
export const redisConnectionConfig = {
    host: env.redis.host,
    port: env.redis.port,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        // Exponential backoff with jitter, up to 5 seconds
        const delay = Math.min(times * 200, 5000);
        return delay;
    }
};
// Factory for creating dedicated Redis instances when needed.
export const createRedisConnection = (customOptions) => {
    return new Redis({
        ...redisConnectionConfig,
        ...customOptions
    });
};
//# sourceMappingURL=redis.config.js.map