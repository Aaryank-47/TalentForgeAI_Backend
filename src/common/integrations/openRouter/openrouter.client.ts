import { logger } from "../../logger/logger.js";
import { OpenRouterError } from "./errors/openrouter.error.js";
import { openRouterConfig } from "./openrouter.config.js";
import type {
    GenerateDocumentRequest,
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

        return this.sendChatCompletion(messages, prompt.temperature, prompt.maxTokens, maxRetries);
    }

    static async generateFromDocument(
        prompt: GenerateDocumentRequest,
        maxRetries = 3
    ): Promise<string> {
        if (!prompt.documentBuffer || prompt.documentBuffer.length === 0) {
            throw new OpenRouterError("Document buffer cannot be empty", 400);
        }

        const base64Data = prompt.documentBuffer.toString("base64");
        const dataUrl = `data:${prompt.mimeType};base64,${base64Data}`;

        const messages: OpenRouterChatRequest["messages"] = [];

        if (prompt.systemPrompt) {
            messages.push({
                role: "system",
                content: prompt.systemPrompt
            });
        }

        messages.push({
            role: "user",
            content: [
                { type: "text", text: prompt.userPrompt },
                { type: "image_url", image_url: { url: dataUrl } }
            ]
        });

        return this.sendChatCompletion(messages, prompt.temperature, prompt.maxTokens, maxRetries);
    }

    private static async sendChatCompletion(
        messages: OpenRouterChatRequest["messages"],
        temperature?: number,
        maxTokens?: number,
        maxRetries = 3
    ): Promise<string> {
        let lastError: unknown = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const controller = new AbortController();
            const timeout = setTimeout(() => {
                controller.abort();
            }, openRouterConfig.timeoutMs);

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
                            temperature,
                            max_tokens: maxTokens
                        }),
                        signal: controller.signal
                    }
                );

                if (!response.ok) {
                    const errorBody = await response.text();
                    const status = response.status;
                    const errorMsg = `OpenRouter Error: ${status} - ${errorBody}`;

                    const retryAfterHeader = response.headers.get("retry-after");
                    let delayMs = Math.pow(2, attempt - 1) * 1000;
                    if (status === 429 && retryAfterHeader) {
                        const parsedSeconds = parseInt(retryAfterHeader, 10);
                        if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
                            delayMs = parsedSeconds * 1000;
                        }
                    }

                    const openRouterError = new OpenRouterError(errorMsg, status);

                    // Non-transient errors (400, 401, 403, 404) fail fast without retrying
                    if ([400, 401, 403, 404].includes(status) || attempt === maxRetries) {
                        throw openRouterError;
                    }

                    logger.warn(
                        `[OpenRouterClient] Transient API failure (attempt ${attempt}/${maxRetries}): ${errorMsg}. Retrying in ${delayMs}ms...`
                    );
                    await new Promise((res) => setTimeout(res, delayMs));
                    continue;
                }

                const result = (await response.json()) as OpenRouterChatResponse;
                const content = result.choices?.[0]?.message?.content;

                if (!content) {
                    throw new OpenRouterError("OpenRouter returned an empty response", 500);
                }

                return content;
            } catch (error: unknown) {
                lastError = error;

                if (error instanceof OpenRouterError && [400, 401, 403, 404].includes(error.statusCode ?? 0)) {
                    throw error;
                }

                if (attempt === maxRetries) {
                    break;
                }

                const errorMessage = error instanceof Error ? error.message : "Unknown OpenRouter error";
                const delayMs = Math.pow(2, attempt - 1) * 1000;
                logger.warn(
                    `[OpenRouterClient] Transient failure (attempt ${attempt}/${maxRetries}): ${errorMessage}. Retrying in ${delayMs}ms...`
                );
                await new Promise((res) => setTimeout(res, delayMs));
            } finally {
                clearTimeout(timeout);
            }
        }

        if (lastError instanceof Error) {
            throw lastError;
        }

        throw new OpenRouterError("OpenRouter request failed unexpectedly", 500);
    }
}