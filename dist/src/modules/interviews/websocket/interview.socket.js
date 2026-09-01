import { socketAuthMiddleware } from "./interview.socket.auth.js";
import { registerInterviewHandlers } from "./interview.socket.handler.js";
import { registerAIIinterviewSocketHandlers } from "./ai/ai.interview.socket.handler.js";
export function initializeInterviewSocket(io) {
    const interviewNamespace = io.of("/interviews");
    interviewNamespace.use(socketAuthMiddleware);
    interviewNamespace.on("connection", (socket) => {
        console.log(`Interview socket connected : ${socket.id}`);
        registerInterviewHandlers(socket);
        socket.on("disconnect", () => {
            console.log(`Interview socket disconnected : ${socket.id}`);
        });
    });
    const aiInterviewNamespace = io.of("/interviews/ai");
    aiInterviewNamespace.use(socketAuthMiddleware);
    aiInterviewNamespace.on("connection", (socket) => {
        console.log(`Interview socket connected : ${socket.id}`);
        registerAIIinterviewSocketHandlers(socket);
        socket.on("disconnect", () => {
            console.log(`Interview socket disconnected : ${socket.id}`);
        });
    });
}
//# sourceMappingURL=interview.socket.js.map