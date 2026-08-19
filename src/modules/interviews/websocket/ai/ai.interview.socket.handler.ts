import type { Socket } from "socket.io";
import { AIInterviewSessionService } from "../../AI-interview/services/ai.interview.service.js";

export function registerAIIinterviewSocketHandlers(socket: Socket) {
    const emitSocketError = (code: string, message: string) => {
        socket.emit("ai-interview-error", { code, message });
    };

    const handleStartOrResume = async (sessionId: string) => {
        try {
            const user = socket.data.user;
            if (!user) {
                emitSocketError("UNAUTHORIZED", "Unauthorized");
                return;
            }

            if (!sessionId) {
                emitSocketError("INVALID_QUESTION", "Session ID is required");
                return;
            }

            const state = await AIInterviewSessionService.validateAndGetCurrentQuestion(
                sessionId,
                user.id
            );

            socket.join(sessionId);

            if (state.status === "COMPLETED") {
                socket.emit("ai-interview-completed", {
                    sessionId,
                    completed: true,
                    message: state.message || "Thank you for completing your AI technical interview! Your responses have been successfully recorded and submitted to the hiring team for evaluation."
                });
                return;
            }

            if (state.status === "EXPIRED" || state.status === "CANCELLED") {
                socket.emit("ai-interview-timeout", {
                    sessionId,
                    completed: true,
                    reason: state.reason || "TIME_LIMIT_REACHED"
                });
                return;
            }

            if (state.status === "IN_PROGRESS" && state.question) {
                socket.emit("ai-question", state.question);
            }
        } catch (error: any) {
            console.error("ai-interview start/resume error:", error);
            const code = error.code || (error.name === "NotFoundError" ? "INVALID_QUESTION" : "SESSION_INACTIVE");
            emitSocketError(code, error.message || "Internal server error");
        }
    };

    socket.on("ai-interview-start", async (data: { sessionId: string }) => {
        await handleStartOrResume(data?.sessionId);
    });

    socket.on("ai-interview-resume", async (data: { sessionId: string }) => {
        await handleStartOrResume(data?.sessionId);
    });

    socket.on(
        "ai-answer-submit",
        async (data: {
            sessionId: string;
            questionId: string;
            answerText: string;
            recordingUrl?: string | null
        }) => {
            try {
                const user = socket.data.user;
                if (!user) {
                    emitSocketError("UNAUTHORIZED", "Unauthorized");
                    return;
                }

                console.log("user : " + user);

                const result = await AIInterviewSessionService.submitAnswer({
                    userId: user.id,
                    sessionId: data.sessionId,
                    questionId: data.questionId,
                    answerText: data.answerText,
                    recordingUrl: data.recordingUrl ?? null
                });

                socket.emit("ai-answer-received", {
                    submittedQuestionId: result.submittedQuestionId,
                    answerSubmitted: result.answerSubmitted,
                    answerId: result.answerId,
                    submittedAt: result.submittedAt
                });

                if (result.completed) {
                    socket.emit("ai-interview-completed", {
                        sessionId: data.sessionId,
                        completed: true,
                        message: result.sendOffMessage || "Thank you for completing your AI technical interview! Your responses have been successfully recorded and submitted to the hiring team for evaluation."
                    });
                } else if (result.nextQuestion) {
                    socket.emit("ai-question", result.nextQuestion);
                }

            } catch (error: any) {
                console.error("ai-answer-submit error:", error);

                let code = "INTERNAL_ERROR";
                if (error.code) {
                    code = error.code;
                } else if (error.name === "NotFoundError") {
                    code = "INVALID_QUESTION";
                } else if (error.name === "BadRequestError") {
                    code = error.message && error.message.includes("in progress") ? "SESSION_INACTIVE" : "INVALID_QUESTION";
                }

                emitSocketError(code, error.message || "We could not process your answer right now. Please try again.");
            }
        }
    );
}