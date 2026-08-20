import type { GenerateDocumentRequest, GenerateTextRequest } from "./openrouter.types.js";
export declare class OpenRouterClient {
    static generateText(prompt: GenerateTextRequest, maxRetries?: number): Promise<string>;
    static generateFromDocument(prompt: GenerateDocumentRequest, maxRetries?: number): Promise<string>;
    private static sendChatCompletion;
}
//# sourceMappingURL=openrouter.client.d.ts.map