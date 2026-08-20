export interface RTCSessionDescriptionInit {
    type: 'offer' | 'answer' | 'pranswer' | 'rollback';
    sdp?: string;
}
export interface RTCIceCandidateInit {
    candidate?: string;
    sdpMLineIndex?: number | null;
    sdpMid?: string | null;
    usernameFragment?: string | null;
}
export interface SignalingPayload {
    sessionId: string;
    to: string;
}
export interface WebRTCOfferPayload extends SignalingPayload {
    offer: RTCSessionDescriptionInit;
}
export interface WebRTCAnswerPayload extends SignalingPayload {
    answer: RTCSessionDescriptionInit;
}
export interface IceCandidatePayload extends SignalingPayload {
    candidate: RTCIceCandidateInit;
}
//# sourceMappingURL=signaling.types.d.ts.map