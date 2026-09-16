import type { ConnectionOptions } from "bullmq";
import { Redis } from "ioredis";
export declare const redisConnectionConfig: ConnectionOptions;
export declare const createRedisConnection: (customOptions?: Partial<ConnectionOptions>) => Redis;
export declare let redisCloudClient: any;
//# sourceMappingURL=redis.config.d.ts.map