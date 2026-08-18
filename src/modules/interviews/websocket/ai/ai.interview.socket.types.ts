export interface AIInterviewStartPayload {
    sessionId: string;
}

export interface AIQuestionPayload {
    sessionId: string;
    questionId: string;
    sequence: number;
    question: string;
    topic: string | null;
    skill: string | null;
    difficulty: string | null
}