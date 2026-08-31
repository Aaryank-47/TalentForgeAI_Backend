import { InterviewRoomManager } from "../websocket/interview.room.manager.js";
export function registerWebRTCSignalingHandlers(socket) {
    const user = socket.data.user;
    if (!user)
        return;
    // Relays WebRTC offer to the targeted peer socket ID
    socket.on("webrtc-offer", (data) => {
        const targetSocketId = InterviewRoomManager.getSocketIdByUserId(data.sessionId, data.to);
        if (!targetSocketId) {
            socket.emit("error", { message: "Target user not in room" });
            return;
        }
        socket.to(targetSocketId).emit("webrtc-offer", {
            from: user.id,
            offer: data.offer
        });
    });
    socket.on("webrtc-answer", (data) => {
        const targetSocketId = InterviewRoomManager.getSocketIdByUserId(data.sessionId, data.to);
        if (!targetSocketId) {
            socket.emit("error", { message: "Target user not in room" });
            return;
        }
        socket.to(targetSocketId).emit("webrtc-answer", {
            from: user.id,
            answer: data.answer
        });
    });
    // Relays ICE Candidate information to the peer socket ID
    socket.on("webrtc-candidate", (data) => {
        const targetSocketId = InterviewRoomManager.getSocketIdByUserId(data.sessionId, data.to);
        if (!targetSocketId) {
            socket.emit("error", { message: "Target user not in room" });
            return;
        }
        socket.to(targetSocketId).emit("webrtc-candidate", {
            from: user.id,
            candidate: data.candidate
        });
    });
}
//# sourceMappingURL=signaling.handler.js.map