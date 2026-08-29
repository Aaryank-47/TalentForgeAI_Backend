export interface ActiveParticipant {
    socketId: string;
    userId: string;
    role: string;
    name: string;
    initials: string;
    avatarColor: string;
    joinedAt: Date
}