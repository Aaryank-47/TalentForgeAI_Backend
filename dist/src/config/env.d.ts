export declare const env: {
    readonly nodeEnv: "development" | "production" | "test";
    readonly port: number;
    readonly databaseUrl: string;
    readonly jwt: {
        readonly accessSecret: string;
        readonly refreshSecret: string;
        readonly accessExpiresIn: string;
        readonly refreshExpiresIn: string;
    };
};
export default env;
//# sourceMappingURL=env.d.ts.map