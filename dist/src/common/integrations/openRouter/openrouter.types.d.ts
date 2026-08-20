export type OpenRouterContentPart = {
    type: "text";
    text: string;
} | {
    type: "image_url";
    image_url: {
        url: string;
    };
};
export interface OpenRouterMessage {
    role: "system" | "user" | "assistant";
    content: string | OpenRouterContentPart[];
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
export interface GenerateDocumentRequest {
    systemPrompt?: string;
    userPrompt: string;
    documentBuffer: Buffer;
    mimeType: string;
    temperature?: number;
    maxTokens?: number;
}
//# sourceMappingURL=openrouter.types.d.ts.map