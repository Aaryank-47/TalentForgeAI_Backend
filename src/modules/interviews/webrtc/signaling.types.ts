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
  to: string; // Target socket ID
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

