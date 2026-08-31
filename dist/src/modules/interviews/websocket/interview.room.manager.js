export class InterviewRoomManager {
    static activeRooms = new Map();
    static joinRoom(sessionId, participant) {
        if (!this.activeRooms.has(sessionId)) {
            this.activeRooms.set(sessionId, new Map());
        }
        const room = this.activeRooms.get(sessionId);
        let oldSocketId = null;
        const existing = room.get(participant.userId);
        if (existing) {
            oldSocketId = existing.socketId;
        }
        room.set(participant.userId, participant);
        return oldSocketId;
    }
    static leaveRoom(sessionId, socketId) {
        const room = this.activeRooms.get(sessionId);
        if (!room)
            return null;
        let removeUserId = null;
        for (const [userId, participant] of room.entries()) {
            if (participant.socketId === socketId) {
                room.delete(userId);
                removeUserId = userId;
                break;
            }
        }
        if (room.size === 0)
            this.activeRooms.delete(sessionId);
        return removeUserId;
    }
    //checking if specific socketID is present in a specific session room 
    static isSocketInRoom(sessionId, socketId) {
        const room = this.activeRooms.get(sessionId);
        if (!room)
            return false;
        return Array.from(room.values()).some(participant => participant.socketId === socketId);
    }
    static getParticipant(sessionId) {
        const room = this.activeRooms.get(sessionId);
        return room ? Array.from(room.values()) : [];
    }
    static getSocketIdByUserId(sessionId, userId) {
        const room = this.activeRooms.get(sessionId);
        if (!room)
            return null;
        const participant = room.get(userId);
        return participant ? participant.socketId : null;
    }
    static roomStates = new Map();
    static setCodeState(sessionId, code) {
        const state = this.roomStates.get(sessionId) || { code: "", language: "javascript" };
        state.code = code;
        this.roomStates.set(sessionId, state);
    }
    static setLanguageState(sessionId, language) {
        const state = this.roomStates.get(sessionId) || { code: "", language: "javascript" };
        state.language = language;
        this.roomStates.set(sessionId, state);
    }
    static getCodeSyncState(sessionId) {
        return this.roomStates.get(sessionId) || { code: "", language: "javascript" };
    }
}
//# sourceMappingURL=interview.room.manager.js.map