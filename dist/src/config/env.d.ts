export declare const env: {
    readonly nodeEnv: "development" | "production" | "test";
    readonly port: number;
    readonly databaseUrl: string;
    readonly jwt: {
        readonly accessSecret: string;
        readonly refreshSecret: string;
        readonly accessExpiresIn: string;
        readonly refreshExpiresIn: string;
        readonly resetPasswordSecret: string;
        readonly resetPasswordExpiresIn: string;
        readonly invitationTokenSecret: string;
        readonly invitationTokenExpiresIn: string;
    };
    readonly gmail: {
        readonly user: string;
        readonly pass: string;
    };
    readonly cloudinary: {
        readonly apiKey: string;
        readonly apiSecret: string;
        readonly cloudName: string;
    };
    readonly app: {
        readonly frontendUrl: string;
    };
    readonly elasticsearch: {
        readonly url: string;
        readonly username: string | undefined;
        readonly password: string | undefined;
        readonly apiKey: string | undefined;
    };
};
export default env;
//# sourceMappingURL=env.d.ts.map