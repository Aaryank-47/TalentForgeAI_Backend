import { z } from "zod";
export declare const createAssessmentSchema: z.ZodObject<{
    companyId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    instructions: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    durationMinutes: z.ZodNumber;
    passingScore: z.ZodNumber;
    totalMarks: z.ZodNumber;
    isTemplate: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export type CreateAssessmentDto = z.infer<typeof createAssessmentSchema>;
export declare const updateAssessmentSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    instructions: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    durationMinutes: z.ZodOptional<z.ZodNumber>;
    passingScore: z.ZodOptional<z.ZodNumber>;
    totalMarks: z.ZodOptional<z.ZodNumber>;
    isTemplate: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateAssessmentDto = z.infer<typeof updateAssessmentSchema>;
export declare const getAssessmentsQuerySchema: z.ZodObject<{
    page: z.ZodPreprocess<z.ZodDefault<z.ZodOptional<z.ZodNumber>>>;
    limit: z.ZodPreprocess<z.ZodDefault<z.ZodOptional<z.ZodNumber>>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        PUBLISHED: "PUBLISHED";
        ARCHIVED: "ARCHIVED";
    }>>;
    companyId: z.ZodOptional<z.ZodString>;
    isTemplate: z.ZodPreprocess<z.ZodOptional<z.ZodBoolean>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        title: "title";
        durationMinutes: "durationMinutes";
        passingScore: "passingScore";
        totalMarks: "totalMarks";
    }>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>>;
}, z.core.$strip>;
export type GetAssessmentsQueryDto = z.infer<typeof getAssessmentsQuerySchema>;
export declare const assessmentIdParamSchema: z.ZodObject<{
    assessmentId: z.ZodString;
}, z.core.$strip>;
export type AssessmentIdParamDto = z.infer<typeof assessmentIdParamSchema>;
//# sourceMappingURL=assessmentBuilder.dto.d.ts.map