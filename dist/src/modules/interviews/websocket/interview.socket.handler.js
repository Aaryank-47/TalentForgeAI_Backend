import { InterviewRoomManager } from "./interview.room.manager.js";
import { registerWebRTCSignalingHandlers } from "../webrtc/signaling.handler.js";
import { InterviewSessionsServices, InterviewSessionParticipantsServices } from "../services/interviews.service.js";
export function registerInterviewHandlers(socket) {
    const user = socket.data.user;
    if (!user)
        return;
    socket.on("join-room", async (data) => {
        const { sessionId } = data;
        try {
            // Delegate validation and database updates to the service layer
            const participantInfo = await InterviewSessionParticipantsServices.verifyAndJoinSession(user.id, sessionId);
            const oldSocketId = InterviewRoomManager.joinRoom(sessionId, {
                socketId: socket.id,
                userId: user.id,
                role: user.role,
                name: participantInfo.name,
                initials: participantInfo.initials,
                avatarColor: participantInfo.avatarColor,
                joinedAt: new Date()
            });
            if (oldSocketId) {
                const oldSocket = socket.nsp.sockets.get(oldSocketId);
                if (oldSocket) {
                    oldSocket.emit("error", {
                        message: "Connected from another device, Disconnecting this session"
                    });
                    oldSocket.disconnect(true);
                }
            }
            // Join the room
            socket.join(sessionId);
            // Notify others in room that a user has joined
            socket.to(sessionId).emit("user-joined", {
                userId: user.id,
                role: user.role,
                name: participantInfo.name,
                initials: participantInfo.initials,
                avatarColor: participantInfo.avatarColor,
                socketId: socket.id
            });
            // Send the currently active participant list to the new joiner
            const currentParticipants = InterviewRoomManager.getParticipant(sessionId);
            socket.emit("room-users", currentParticipants);
            // Send current code sync state to the joiner
            const syncState = InterviewRoomManager.getCodeSyncState(sessionId);
            socket.emit("code-sync", syncState);
        }
        catch (error) {
            const message = error.message || "Internal server error joining room";
            socket.emit("error", { message });
        }
    });
    // Delegate WebRTC signaling handlers (offer, answer, candidate) to the dedicated module
    registerWebRTCSignalingHandlers(socket);
    // SESSION LIFECYCLE: START INTERVIEW
    socket.on("start-interview", async (data) => {
        const { sessionId } = data;
        try {
            if (!InterviewRoomManager.isSocketInRoom(sessionId, socket.id)) {
                socket.emit("error", { message: "Forbidden: You are not a participant in this room" });
                return;
            }
            const participantInfo = await InterviewSessionParticipantsServices.verifyAndJoinSession(user.id, sessionId);
            const session = await InterviewSessionsServices.startSession(participantInfo.companyId, sessionId, user.id);
            socket.nsp.to(sessionId).emit("interview-started", {
                sessionId,
                startedAt: session.startedAt,
                status: session.status
            });
        }
        catch (error) {
            socket.emit("error", { message: error.message || "Failed to start interview" });
        }
    });
    // SESSION LIFECYCLE: END INTERVIEW
    socket.on("end-interview", async (data) => {
        const { sessionId } = data;
        try {
            if (!InterviewRoomManager.isSocketInRoom(sessionId, socket.id)) {
                socket.emit("error", { message: "Forbidden: You are not a participant in this room" });
                return;
            }
            const participantInfo = await InterviewSessionParticipantsServices.verifyAndJoinSession(user.id, sessionId);
            const session = await InterviewSessionsServices.endSession(participantInfo.companyId, sessionId, user.id);
            socket.nsp.to(sessionId).emit("interview-ended", {
                sessionId,
                endedAt: session.endedAt,
                status: session.status
            });
        }
        catch (error) {
            socket.emit("error", { message: error.message || "Failed to end interview" });
        }
    });
    // COLLABORATIVE CODE EDITOR: CODE CHANGE
    socket.on("code-change", (data) => {
        if (!InterviewRoomManager.isSocketInRoom(data.sessionId, socket.id)) {
            socket.emit("error", { message: "Forbidden: You are not a participant in this room" });
            return;
        }
        InterviewRoomManager.setCodeState(data.sessionId, data.code);
        socket.to(data.sessionId).emit("code-change", {
            senderId: user.id,
            code: data.code
        });
    });
    // COLLABORATIVE CODE EDITOR: LANGUAGE CHANGE
    socket.on("language-change", (data) => {
        if (!InterviewRoomManager.isSocketInRoom(data.sessionId, socket.id)) {
            socket.emit("error", { message: "Forbidden: You are not a participant in this room" });
            return;
        }
        InterviewRoomManager.setLanguageState(data.sessionId, data.language);
        socket.to(data.sessionId).emit("language-change", {
            senderId: user.id,
            language: data.language
        });
    });
    // COLLABORATIVE CODE EDITOR: CODE SYNC REQUEST
    socket.on("code-sync", (data) => {
        if (!InterviewRoomManager.isSocketInRoom(data.sessionId, socket.id)) {
            socket.emit("error", { message: "Forbidden: You are not a participant in this room" });
            return;
        }
        const syncState = InterviewRoomManager.getCodeSyncState(data.sessionId);
        socket.emit("code-sync", syncState);
    });
    // TEXT CHAT EVENT
    socket.on("send-message", (data) => {
        if (!InterviewRoomManager.isSocketInRoom(data.sessionId, socket.id)) {
            socket.emit("error", {
                message: "Forbidden: You are not a participant in this chat room"
            });
            return;
        }
        // Ensure sender ID cannot be spoofed
        data.message.senderId = user.id;
        socket.nsp.to(data.sessionId).emit("new-message", data.message);
    });
    // LEAVE ROOM EVENT
    socket.on("leave-room", (data) => {
        if (!data?.sessionId)
            return;
        const removeUserId = InterviewRoomManager.leaveRoom(data.sessionId, socket.id);
        socket.leave(data.sessionId);
        if (removeUserId) {
            socket.to(data.sessionId).emit("user-left", {
                userId: removeUserId,
                socketId: socket.id
            });
        }
    });
    socket.on("disconnecting", async () => {
        for (const room of socket.rooms) {
            if (room !== socket.id) {
                const removeUserId = InterviewRoomManager.leaveRoom(room, socket.id);
                if (removeUserId) {
                    socket.to(room).emit("user-left", {
                        userId: removeUserId,
                        socketId: socket.id
                    });
                }
            }
        }
    });
}
//# sourceMappingURL=interview.socket.handler.js.map