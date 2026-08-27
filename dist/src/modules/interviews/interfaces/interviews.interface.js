export const interviewSelect = {
    id: true,
    companyId: true,
    title: true,
    description: true,
    instructions: true,
    type: true,
    mode: true,
    durationMinutes: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    createdBy: {
        select: {
            id: true,
            userId: true,
        },
    },
    aiConfiguration: {
        select: {
            id: true,
            systemPrompt: true,
            evaluationMetrics: true,
            questionCount: true,
            difficulty: true,
            allowFollowUps: true,
        }
    },
};
export const interviewListSelect = {
    id: true,
    title: true,
    description: true,
    instructions: true,
    type: true,
    mode: true,
    durationMinutes: true,
    status: true,
    createdAt: true,
    aiConfiguration: {
        select: {
            id: true,
            systemPrompt: true,
            evaluationMetrics: true,
            questionCount: true,
            difficulty: true,
            allowFollowUps: true,
        }
    },
};
export const interviewDetailSelect = {
    id: true,
    companyId: true,
    title: true,
    description: true,
    instructions: true,
    type: true,
    mode: true,
    durationMinutes: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    createdBy: {
        select: {
            id: true,
            userId: true,
        },
    },
    aiConfiguration: {
        select: {
            id: true,
            systemPrompt: true,
            evaluationMetrics: true,
            questionCount: true,
            difficulty: true,
            allowFollowUps: true,
        }
    },
    jobInterviews: {
        select: {
            jobId: true,
            job: { select: { title: true } },
            displayOrder: true,
            isMandatory: true,
        }
    }
};
export const jobInterviewWithInterviewSelect = {
    jobId: true,
    interviewId: true,
    displayOrder: true,
    isMandatory: true,
    interview: {
        select: {
            id: true,
            title: true,
            type: true,
            mode: true,
            durationMinutes: true,
            status: true,
        }
    }
};
export const interviewAssignmentSelect = {
    id: true,
    interviewId: true,
    applicationId: true,
    creationSource: true,
    createdAt: true,
    application: {
        select: {
            id: true,
            status: true,
            candidate: {
                select: {
                    id: true,
                    fullName: true
                }
            },
            job: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    }
};
export const interviewAssignmentDetailSelect = {
    ...interviewAssignmentSelect,
    interview: {
        select: {
            id: true,
            title: true,
            type: true,
            mode: true,
            durationMinutes: true,
        }
    }
};
export const interviewSessionParticipantSelect = {
    id: true,
    sessionId: true,
    participantType: true,
    assignmentId: true,
    companyMemberId: true,
    hasJoined: true,
    joinedAt: true,
    createdAt: true,
    updatedAt: true
};
export const interviewSessionSelect = {
    id: true,
    interviewId: true,
    status: true,
    scheduledAt: true,
    startedAt: true,
    endedAt: true,
    roomId: true,
    createdAt: true,
    updatedAt: true,
    participants: {
        select: interviewSessionParticipantSelect
    }
};
export const interviewSessionDetailSelect = {
    ...interviewSessionSelect,
    interview: {
        select: {
            id: true,
            companyId: true,
            title: true,
            type: true,
            mode: true
        }
    }
};
//# sourceMappingURL=interviews.interface.js.map