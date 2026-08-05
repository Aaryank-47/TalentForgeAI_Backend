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
export declare const createAssessmentSectionSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    instructions: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    sectionType: z.ZodEnum<{
        MCQ: "MCQ";
        DSA: "DSA";
        MACHINE_CODING: "MACHINE_CODING";
        PROJECT: "PROJECT";
    }>;
    durationMinutes: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type CreateAssessmentSectionDto = z.infer<typeof createAssessmentSectionSchema>;
export declare const sectionIdParamSchema: z.ZodObject<{
    sectionId: z.ZodString;
}, z.core.$strip>;
export type SectionIdParamDto = z.infer<typeof sectionIdParamSchema>;
export declare const updateAssessmentSectionSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    instructions: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    durationMinutes: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type UpdateAssessmentSectionDto = z.infer<typeof updateAssessmentSectionSchema>;
export declare const reorderSectionsSchema: z.ZodObject<{
    assessmentId: z.ZodString;
    sections: z.ZodArray<z.ZodObject<{
        sectionId: z.ZodString;
        displayOrder: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ReorderSectionsDto = z.infer<typeof reorderSectionsSchema>;
export declare const addQuestionsToSectionSchema: z.ZodObject<{
    questions: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        marksOverride: z.ZodOptional<z.ZodNumber>;
        timeLimitOverride: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AddQuestionsToSectionDto = z.infer<typeof addQuestionsToSectionSchema>;
export declare const updateSectionItemSchema: z.ZodObject<{
    marksOverride: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    timeLimitOverride: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    isRequired: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateSectionItemDto = z.infer<typeof updateSectionItemSchema>;
export declare const sectionItemIdParamSchema: z.ZodObject<{
    sectionItemId: z.ZodString;
}, z.core.$strip>;
export type SectionItemIdParamDto = z.infer<typeof sectionItemIdParamSchema>;
export declare const reorderQuestionsSchema: z.ZodObject<{
    sectionId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        sectionItemId: z.ZodString;
        displayOrder: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ReorderQuestionsDto = z.infer<typeof reorderQuestionsSchema>;
//# sourceMappingURL=assessmentBuilder.dto.d.ts.map