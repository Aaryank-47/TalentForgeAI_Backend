export declare class MatchingEventsPublisher {
    /**
     * Triggered when candidate profile information updates.
     * Evaluates whether changes affect matching before enqueuing work.
     */
    static onCandidateMatchingDataChanged(candidateId: string, changedFields: string[] | Record<string, any>): Promise<boolean>;
    /**
     * Triggered when job requirements or status updates.
     */
    static onJobMatchingDataChanged(jobId: string, changedFields: string[] | Record<string, any>): Promise<boolean>;
}
//# sourceMappingURL=matching-events.publisher.d.ts.map