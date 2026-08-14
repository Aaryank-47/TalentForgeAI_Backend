import type { Socket } from "socket.io";
import { InterviewRoomManager } from "./interview.room.manager.js";
import prisma from "../../../config/database.js";
import { registerWebRTCSignalingHandlers } from "../webrtc/signaling.handler.js";


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
                const participant = await prisma.interviewSessionParticipant.findFirst({
                    where: {
                        sessionId: sessionId,
                        OR: [
                            {
                                assignment: {
                                    application: {
                                        candidate: {
                                            userId: user.id
                                        }
                                    }
                                }
                            },
                            {
                                companyMember: {
                                    userId: user.id
                                }
                            }
                        ]
                    },
                    include: {
                        session: true
                    }
                });

                if (!participant) {
                    socket.emit(
                        "error", {
                        message: "You are not authorized to join this interview"
                    });
                    return;
                }

                const restrictedStatuses = ["COMPLETED", "CANCELLED", "EXPIRED"];
                if (restrictedStatuses.includes(participant.session.status)) {
                    socket.emit("error", {
                        message: `Cannot join! Interview is already ${participant.session.status.toLocaleLowerCase()}`
                    })
                    return;
                }

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

                await prisma.interviewSessionParticipant.update({
                    where: { id: participant.id },
                    data: {
                        hasJoined: true,
                        joinedAt: new Date()
                    }
                });

                // Notify others in room that a user has joined
                socket.to(sessionId).emit("user-joined", {
                    userId: user.id,
                    role: user.role,
                    socketId: socket.id
                });

                // Send the currently active participant list to the new joiner
                const currentParticipants = InterviewRoomManager.getParticipant(sessionId);
                socket.emit("room-users", currentParticipants);

            } catch (error) {
                socket.emit("error", {
                    message: "Internal server error joining room"
                });
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