import type { ActiveParticipant } from "./interview.socket.types.js";

export class InterviewRoomManager {
    private static activeRooms: Map<string, Map<string, ActiveParticipant>> = new Map();

    static joinRoom(
        sessionId: string,
        participant: ActiveParticipant
    ): string | null {
        if (!this.activeRooms.has(sessionId)) {
            this.activeRooms.set(sessionId, new Map());
        }
        const room = this.activeRooms.get(sessionId)!;
        let oldSocketId: string | null = null;
        const existing = room.get(participant.userId);
        if (existing) {
            oldSocketId = existing.socketId;
        }
        room.set(participant.userId, participant);
        return oldSocketId
    }

    static leaveRoom(
        sessionId: string,
        socketId: string
    ): string | null {
        const room = this.activeRooms.get(sessionId);
        if (!room) return null;

        let removeUserId: string | null = null;
        for (const [userId, participant] of room.entries()) {
            if (participant.socketId === socketId) {
                room.delete(userId);
                removeUserId = userId;
                break;
            }
        }

        if (room.size === 0) this.activeRooms.delete(sessionId);

        return removeUserId;
    }
    
    //checking if specific socketID is present in a specific session room 
    static isSocketInRoom(
        sessionId: string,
        socketId: string
    ):boolean{
        const room = this.activeRooms.get(sessionId);
        if(!room) return false;
        
        return Array.from(room.values()).some(participant => participant.socketId === socketId);
    }

    static getParticipant(
        sessionId: string
    ): ActiveParticipant[] {
        const room = this.activeRooms.get(sessionId);
        return room ? Array.from(room.values()) : [];
    }
}