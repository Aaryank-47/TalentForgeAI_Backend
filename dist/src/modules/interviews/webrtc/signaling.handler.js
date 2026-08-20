import { InterviewRoomManager } from "../websocket/interview.room.manager.js";
export function registerWebRTCSignalingHandlers(socket) {
    // Relays WebRTC offer to the targeted peer socket ID
    socket.on("webrtc-offer", (data) => {
        // SECURITY CHECK: Verify both sender and recipient belong to this room
        if (!InterviewRoomManager.isSocketInRoom(data.sessionId, socket.id) ||
            !InterviewRoomManager.isSocketInRoom(data.sessionId, data.to)) {
            socket.emit("error", { message: "Unauthorized signaling action" });
            return;
        }
        socket.to(data.to).emit("webrtc-offer", {
            from: socket.id,
            offer: data.offer
        });
    });
    socket.on("webrtc-answer", (data) => {
        if (!InterviewRoomManager.isSocketInRoom(data.sessionId, socket.id) ||
            !InterviewRoomManager.isSocketInRoom(data.sessionId, data.to)) {
            socket.emit("error", { message: "Unauthorized signaling action" });
            return;
        }
        socket.to(data.to).emit("webrtc-answer", {
            from: socket.id,
            answer: data.answer
        });
    });
    // Relays ICE Candidate information to the peer socket ID
    socket.on("webrtc-candidate", (data) => {
        if (!InterviewRoomManager.isSocketInRoom(data.sessionId, socket.id) ||
            !InterviewRoomManager.isSocketInRoom(data.sessionId, data.to)) {
            socket.emit("error", { message: "Unauthorized signaling action" });
            return;
        }
        socket.to(data.to).emit("webrtc-candidate", {
            from: socket.id,
            candidate: data.candidate
        });
    });
}
//# sourceMappingURL=signaling.handler.js.map