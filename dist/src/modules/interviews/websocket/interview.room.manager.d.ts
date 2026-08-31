import type { ActiveParticipant } from "./interview.socket.types.js";
export declare class InterviewRoomManager {
    private static activeRooms;
    static joinRoom(sessionId: string, participant: ActiveParticipant): string | null;
    static leaveRoom(sessionId: string, socketId: string): string | null;
    static isSocketInRoom(sessionId: string, socketId: string): boolean;
    static getParticipant(sessionId: string): ActiveParticipant[];
    static getSocketIdByUserId(sessionId: string, userId: string): string | null;
    private static roomStates;
    static setCodeState(sessionId: string, code: string): void;
    static setLanguageState(sessionId: string, language: string): void;
    static getCodeSyncState(sessionId: string): {
        code: string;
        language: string;
    };
}
//# sourceMappingURL=interview.room.manager.d.ts.map