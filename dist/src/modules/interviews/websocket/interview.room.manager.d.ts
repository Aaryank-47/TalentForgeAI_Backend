import type { ActiveParticipant } from "./interview.socket.types.js";
export declare class InterviewRoomManager {
    private static activeRooms;
    static joinRoom(sessionId: string, participant: ActiveParticipant): string | null;
    static leaveRoom(sessionId: string, socketId: string): string | null;
    static isSocketInRoom(sessionId: string, socketId: string): boolean;
    static getParticipant(sessionId: string): ActiveParticipant[];
}
//# sourceMappingURL=interview.room.manager.d.ts.map