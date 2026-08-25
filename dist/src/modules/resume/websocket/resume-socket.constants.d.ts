import type { ResumeProcessingStage } from "../queues/resume-processing.types.js";
export declare const RESUME_SOCKET_NAMESPACE = "/resume-processing";
export declare const RESUME_SOCKET_EVENTS: {
    readonly SUBSCRIBE: "resume:subscribe";
    readonly UNSUBSCRIBE: "resume:unsubscribe";
    readonly SUBSCRIBED: "resume:subscribed";
    readonly STAGE_CHANGE: "resume:stage";
    readonly COMPLETED: "resume:completed";
    readonly FAILED: "resume:failed";
    readonly ERROR: "resume:error";
};
export declare function getResumeRoomName(resumeId: string): string;
export declare const STAGE_DISPLAY_MESSAGES: Record<ResumeProcessingStage, string>;
//# sourceMappingURL=resume-socket.constants.d.ts.map