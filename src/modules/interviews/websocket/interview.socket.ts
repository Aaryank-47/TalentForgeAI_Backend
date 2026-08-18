import type { Server } from "socket.io";
import { socketAuthMiddleware } from "./interview.socket.auth.js";
import { registerInterviewHandlers } from "./interview.socket.handler.js";
import { AIInterviewTimeoutWorker } from "../AI-interview/services/ai.timeout.service.js";

export function initializeInterviewSocket(io: Server){
    const interviewNamespace = io.of("/interviews");
    interviewNamespace.use(socketAuthMiddleware);

    AIInterviewTimeoutWorker.startWorker(interviewNamespace as unknown as Server);

    interviewNamespace.on("connection",(socket) =>{
        console.log(`Interview socket connected : ${socket.id}`);

        registerInterviewHandlers(socket);
        
        socket.on("disconnect",() => {
            console.log(`Interview socket disconnected : ${socket.id}`);
        });
    });
}