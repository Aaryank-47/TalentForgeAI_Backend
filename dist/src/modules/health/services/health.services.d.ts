export declare class HealthService {
    static checkServerHealth(): Promise<{
        server: string;
        environment: "development" | "production" | "test";
        timestamp: string;
        uptime: number;
    }>;
    static checkDatabaseHealth(): Promise<{
        database: string;
        timestamp: string;
    }>;
}
//# sourceMappingURL=health.services.d.ts.map