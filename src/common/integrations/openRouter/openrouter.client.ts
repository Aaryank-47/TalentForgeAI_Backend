import {
    openRouterConfig
} from "./openrouter.config.js";

import type {
    GenerateTextRequest,
    OpenRouterChatRequest,
    OpenRouterChatResponse,
} from "./openrouter.types.js";

export class OpenRouterClient {
    static async generateText (
        prompt: GenerateTextRequest
    ):Promise<String>{
        const messages: OpenRouterChatRequest["messages"] = [];

        if(prompt.systemPrompt){
            messages.push({
                role: "system",
                content: prompt.systemPrompt
            });
        }

        messages.push({
            role: "user",
            content: prompt.userPrompt
        });

        const response = await fetch(
            `${openRouterConfig}/chat/completions`,
            {
                method: "POST",
                headers:{
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
        )

        if(!response.ok){
            const errorBody = await response.text();
            throw new Error(`OpenRouter Error: ${response.status} - ${errorBody}`);
        }

        const result = await response.json() as OpenRouterChatResponse;
        const content = result.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error(
                "OpenRouter returned an empty response"
            );
        }

        return content;
    }
}