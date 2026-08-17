export interface OpenRouterMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface OpenRouterChatRequest {
    model: string;
    messages: OpenRouterMessage[];
    temperature?: number;
    max_tokens?: number;
}

export interface OpenRouterChoice {
    index: number;
    message: {
        role: string;
        content: string;
    };
}

export interface OpenRouterChatResponse {
    id: string;
    choices: OpenRouterChoice[];
}

export interface OpenRouterError {
    error: {
        message: string;
        code: number;
    };
}

export interface GenerateTextRequest {
    systemPrompt?: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
}