import type { Socket } from "socket.io";
import { InterviewRoomManager } from "./interview.room.manager.js";
import { registerWebRTCSignalingHandlers } from "../webrtc/signaling.handler.js";
import { InterviewSessionParticipantsServices } from "../services/interviews.service.js";


export function registerInterviewHandlers(socket: Socket) {
    const user = socket.data.user;
    if (!user) return;

    socket.on("join-room",
        async (
            data: {
                sessionId: string
            }) => {
            const { sessionId } = data;
            try {
                // Delegate validation and database updates to the service layer
                await InterviewSessionParticipantsServices.verifyAndJoinSession(user.id, sessionId);

                const oldSocketId = InterviewRoomManager.joinRoom(sessionId, {
                    socketId: socket.id,
                    userId: user.id,
                    role: user.role,
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
                    socketId: socket.id
                });

                // Send the currently active participant list to the new joiner
                const currentParticipants = InterviewRoomManager.getParticipant(sessionId);
                socket.emit("room-users", currentParticipants);

            } catch (error: any) {
                const message = error.message || "Internal server error joining room";
                socket.emit("error", { message });
            }
        });

    // Delegate WebRTC signaling handlers (offer, answer, candidate) to the dedicated module
    registerWebRTCSignalingHandlers(socket);

    // TEXT CHAT EVENT
    socket.on("send-message", (data: {
        sessionId: string,
        message: string
    }) => {
        if (!InterviewRoomManager.isSocketInRoom(data.sessionId, socket.id)) {
            socket.emit("error", {
                message: "Forbidden: You are not a participant in this chat room"
            });
            return;
        }
        const payload = {
            senderId: user.id,
            senderEmail: user.email,
            message: data.message,
            timestamp: new Date()
        };
        socket.nsp.to(data.sessionId).emit("new-message", payload);
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