import type { Socket } from "socket.io";

export function registerWebRTCSignalingHandlers(socket: Socket) {
    // Relays WebRTC offer to the targeted peer socket ID
    socket.on("webrtc-offer", (
        data: {
            sessionId: string;
            offer: any;
            to: string;
        }
    ) => {
        socket.to(data.to).emit("webrtc-offer", {
            from: socket.id,
            offer: data.offer
        });
    });

    // Relays WebRTC answer back to the peer socket ID
    socket.on("webrtc-answer", (
        data: {
            sessionId: string;
            answer: any;
            to: string;
        }
    ) => {
        socket.to(data.to).emit("webrtc-answer", {
            from: socket.id,
            answer: data.answer
        });
    });

    // Relays ICE Candidate information to the peer socket ID
    socket.on("webrtc-candidate", (
        data: {
            sessionId: string;
            candidate: any;
            to: string;
        }
    ) => {
        socket.to(data.to).emit("webrtc-candidate", {
            from: socket.id,
            candidate: data.candidate
        });
    });
}
