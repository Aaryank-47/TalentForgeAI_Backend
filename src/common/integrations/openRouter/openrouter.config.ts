import env from "../../../config/env.js";

export const openRouterConfig = {
    apiKey: env.openRouter.apiKey,
    baseUrl: env.openRouter.baseUrl,
    model: env.openRouter.model,
    timeoutMs: env.openRouter.timeoutMs,
};