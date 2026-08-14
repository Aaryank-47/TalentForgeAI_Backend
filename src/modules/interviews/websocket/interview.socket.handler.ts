import type { Socket } from "socket.io";
import { InterviewRoomManager } from "./interview.room.manager.js";
import prisma from "../../../config/database.js";


export function registerInterviewHandlers(socket: Socket) {
    const user = socket.data.user;
    if (!user) return;

    socket.on("join-room", async (data: { sessionId: string }) => {
        const { sessionId } = data;
        try {
            const participant = await prisma.interviewSessionParticipant.findFirst({
                where: {
                    sessionId: sessionId,
                    OR: [
                        { assignment: { application: { candidate: { userId: user.id } } } },
                        { companyMember: { userId: user.id } }
                    ]
                }
            });

            if (!participant) {
                socket.emit("error", { message: "You are not authorized to join this interview" });
                return;
            }

            socket.join(sessionId);

            // Add user to room manager
            InterviewRoomManager.joinRoom(sessionId, {
                socketId: socket.id,
                userId: user.id,
                role: user.role,
                joinedAt: new Date()
            });

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

    // WEBRTC SIGNALING EVENTS (Relays details to peers in the room)
    socket.on("webrtc-offer", (
        data: {
            sessionId: string,
            offer: any,
            to: string
        }) => {
        socket.to(data.to).emit("webrtc-offer", {
            from: socket.id,
            offer: data.offer
        });
    });

    socket.on("webrtc-answer", (
        data: {
            sessionId: string,
            answer: any,
            to: string
        }) => {
        socket.to(data.to).emit("webrtc-answer", {
            from: socket.id,
            answer: data.answer
        });
    });

    socket.on("webrtc-candidate", (
        data: {
            sessionId: string,
            candidate: any,
            to: string
        }) => {
        socket.to(data.to).emit("webrtc-candidate", {
            from: socket.id,
            candidate: data.candidate
        });
    });

    // TEXT CHAT EVENT
    socket.on("send-message", (data: {
        sessionId: string,
        message: string
    }) => {
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