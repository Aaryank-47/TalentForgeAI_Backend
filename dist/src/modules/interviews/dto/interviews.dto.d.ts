import { z } from "zod";
export declare const createInterviewDto: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    instructions: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodEnum<{
        AI: "AI";
        NORMAL: "NORMAL";
    }>;
    mode: z.ZodEnum<{
        INDIVIDUAL: "INDIVIDUAL";
        GROUP: "GROUP";
    }>;
    durationMinutes: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    aiConfiguration: z.ZodOptional<z.ZodObject<{
        systemPrompt: z.ZodOptional<z.ZodString>;
        evaluationMetrics: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CreateInterviewDto = z.infer<typeof createInterviewDto>;
export declare const interviewListQueryDto: z.ZodObject<{
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        ACTIVE: "ACTIVE";
        ARCHIVED: "ARCHIVED";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        AI: "AI";
        NORMAL: "NORMAL";
    }>>;
    mode: z.ZodOptional<z.ZodEnum<{
        INDIVIDUAL: "INDIVIDUAL";
        GROUP: "GROUP";
    }>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type InterviewListQueryDto = z.infer<typeof interviewListQueryDto>;
export declare const updateInterviewDto: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodOptional<z.ZodString>>>;
    instructions: z.ZodNullable<z.ZodOptional<z.ZodOptional<z.ZodString>>>;
    type: z.ZodOptional<z.ZodEnum<{
        AI: "AI";
        NORMAL: "NORMAL";
    }>>;
    mode: z.ZodOptional<z.ZodEnum<{
        INDIVIDUAL: "INDIVIDUAL";
        GROUP: "GROUP";
    }>>;
    durationMinutes: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    aiConfiguration: z.ZodOptional<z.ZodObject<{
        systemPrompt: z.ZodOptional<z.ZodString>;
        evaluationMetrics: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type UpdateInterviewDto = z.infer<typeof updateInterviewDto>;
export declare const changeInterviewStatusDto: z.ZodObject<{
    status: z.ZodEnum<{
        DRAFT: "DRAFT";
        ACTIVE: "ACTIVE";
        ARCHIVED: "ARCHIVED";
    }>;
}, z.core.$strip>;
export type ChangeInterviewStatusDto = z.infer<typeof changeInterviewStatusDto>;
export declare const attachInterviewToJobDto: z.ZodObject<{
    interviewId: z.ZodString;
    displayOrder: z.ZodOptional<z.ZodNumber>;
    isMandatory: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type AttachInterviewToJobRequest = z.infer<typeof attachInterviewToJobDto>;
export declare const reorderJobInterviewsDto: z.ZodObject<{
    interviews: z.ZodArray<z.ZodObject<{
        interviewId: z.ZodString;
        displayOrder: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ReorderJobInterviewsRequest = z.infer<typeof reorderJobInterviewsDto>;
export declare const createInterviewAssignmentsDto: z.ZodObject<{
    applicationIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type CreateInterviewAssignmentsRequest = z.infer<typeof createInterviewAssignmentsDto>;
export declare const getInterviewAssignmentsQueryDto: z.ZodObject<{
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GetInterviewAssignmentsQueryDto = z.infer<typeof getInterviewAssignmentsQueryDto>;
export declare const createInterviewSessionDto: z.ZodObject<{
    scheduledAt: z.ZodString;
    assignmentIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    companyMemberIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type CreateInterviewSessionRequest = z.infer<typeof createInterviewSessionDto>;
export declare const updateInterviewSessionDto: z.ZodObject<{
    scheduledAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateInterviewSessionRequest = z.infer<typeof updateInterviewSessionDto>;
export declare const addSessionParticipantsDto: z.ZodObject<{
    assignmentIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    companyMemberIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type AddSessionParticipantsRequest = z.infer<typeof addSessionParticipantsDto>;
//# sourceMappingURL=interviews.dto.d.ts.map