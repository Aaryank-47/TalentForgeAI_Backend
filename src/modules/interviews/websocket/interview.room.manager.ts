import type { ActiveParticipant } from "./interview.socket.types.js";

export class InterviewRoomManager {
    private static activeRooms: Map<string, Map<string, ActiveParticipant>> = new Map();

    static joinRoom(
        sessionId: string,
        participant: ActiveParticipant
    ): void {
        if (!this.activeRooms.has(sessionId)) {
            this.activeRooms.set(sessionId, new Map());
        }
        const room = this.activeRooms.get(sessionId)!;
        room.set(participant.userId, participant)
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

    static getParticipant(
        sessionId: string
    ): ActiveParticipant[] {
        const room = this.activeRooms.get(sessionId);
        return room ? Array.from(room.values()) : [];
    }
}