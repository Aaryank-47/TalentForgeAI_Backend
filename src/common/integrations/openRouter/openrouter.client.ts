import {
    openRouterConfig
} from "./openrouter.config.js";

import type {
    GenerateTextRequest,
    OpenRouterChatRequest,
    OpenRouterChatResponse,
} from "./openrouter.types.js";

export class OpenRouterClient {
    static async generateText(
        prompt: GenerateTextRequest,
        maxRetries = 3
    ): Promise<string> {
        const messages: OpenRouterChatRequest["messages"] = [];

        if (prompt.systemPrompt) {
            messages.push({
                role: "system",
                content: prompt.systemPrompt
            });
        }

        messages.push({
            role: "user",
            content: prompt.userPrompt
        });

        let lastError: any = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(
                    `${openRouterConfig.baseUrl}/chat/completions`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${openRouterConfig.apiKey}`
                        },
                        body: JSON.stringify({
                            model: openRouterConfig.model,
                            messages,
                            temperature: prompt.temperature,
                            max_tokens: prompt.maxTokens
                        })
                    }
                );

                if (!response.ok) {
                    const errorBody = await response.text();
                    const status = response.status;
                    const errorMsg = `OpenRouter Error: ${status} - ${errorBody}`;

                    // Non-transient errors (400, 401, 403, 404) should fail fast without retrying
                    if (status >= 400 && status < 500 && status !== 429) {
                        throw new Error(errorMsg);
                    }

                    throw new Error(errorMsg);
                }

                const result = await response.json() as OpenRouterChatResponse;
                const content = result.choices?.[0]?.message?.content;

                if (!content) {
                    throw new Error("OpenRouter returned an empty response");
                }

                return content;
            } catch (error: any) {
                lastError = error;

                // Stop retrying if error is non-transient or maxRetries reached
                const isNonTransient = error.message && (
                    error.message.includes("400") || 
                    error.message.includes("401") || 
                    error.message.includes("403")
                );

                if (attempt === maxRetries || isNonTransient) {
                    break;
                }

                const delayMs = Math.pow(2, attempt - 1) * 1000;
                console.warn(`[OpenRouterClient] Transient API failure (attempt ${attempt}/${maxRetries}): ${error.message}. Retrying in ${delayMs}ms...`);
                await new Promise(res => setTimeout(res, delayMs));
            }
        }

        throw lastError;
    }
}