import { z } from "zod";
export declare class QuestionCategoryDto {
    static createCategory: z.ZodObject<{
        name: z.ZodString;
        parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
    static categoryIdParams: z.ZodObject<{
        categoryId: z.ZodString;
    }, z.core.$strip>;
    static updateCategory: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        displayOrder: z.ZodOptional<z.ZodNumber>;
        parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}
export type CreateQuestionCategoryDto = z.infer<typeof QuestionCategoryDto.createCategory>;
export type UpdateQuestionCategoryDto = z.infer<typeof QuestionCategoryDto.updateCategory>;
export declare const getQuestionCategoriesDto: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
    includeChildren: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        name: "name";
        createdAt: "createdAt";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export type GetQuestionCategoriesDto = z.infer<typeof getQuestionCategoriesDto>;
export declare class QuestionTagDto {
    static createTag: z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>;
    static tagIdParams: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static updateTag: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}
export type CreateQuestionTagDto = z.infer<typeof QuestionTagDto.createTag>;
export type UpdateQuestionTagDto = z.infer<typeof QuestionTagDto.updateTag>;
export declare const getQuestionTagsDto: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        name: "name";
        createdAt: "createdAt";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export type GetQuestionTagsDto = z.infer<typeof getQuestionTagsDto>;
export declare class ProgrammingLanguageDto {
    static createLanguage: z.ZodObject<{
        name: z.ZodString;
        isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>;
    static languageIdParams: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static updateLanguage: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}
export type CreateProgrammingLanguageDto = z.infer<typeof ProgrammingLanguageDto.createLanguage>;
export type UpdateProgrammingLanguageDto = z.infer<typeof ProgrammingLanguageDto.updateLanguage>;
export declare const getProgrammingLanguagesDto: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        slug: "slug";
        name: "name";
        createdAt: "createdAt";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export type GetProgrammingLanguagesDto = z.infer<typeof getProgrammingLanguagesDto>;
export declare class DSASupportedLanguageDto {
    static createSupportedLanguages: z.ZodObject<{
        questionId: z.ZodString;
        programmingLanguageIds: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    static deleteSupportedLanguages: z.ZodObject<{
        questionId: z.ZodString;
        programmingLanguageIds: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}
export type CreateDSASupportedLanguagesDto = z.infer<typeof DSASupportedLanguageDto.createSupportedLanguages>;
export type DeleteDSASupportedLanguagesDto = z.infer<typeof DSASupportedLanguageDto.deleteSupportedLanguages>;
export declare const createQuestionSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<{
        MCQ: "MCQ";
        DSA: "DSA";
        MACHINE_CODING: "MACHINE_CODING";
        PROJECT: "PROJECT";
    }>;
    difficulty: z.ZodEnum<{
        EASY: "EASY";
        MEDIUM: "MEDIUM";
        HARD: "HARD";
    }>;
    estimatedTime: z.ZodNumber;
    defaultMarks: z.ZodNumber;
    ownership: z.ZodEnum<{
        GLOBAL: "GLOBAL";
        COMPANY: "COMPANY";
    }>;
    categoryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tagIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    companyId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    mcqDetail: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        allowMultipleCorrectAnswers: z.ZodDefault<z.ZodBoolean>;
        negativeMarks: z.ZodDefault<z.ZodNumber>;
        options: z.ZodArray<z.ZodObject<{
            optionText: z.ZodString;
            displayOrder: z.ZodNumber;
            isCorrect: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    dsaDetail: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        starterCode: z.ZodString;
        referenceSolution: z.ZodString;
        memoryLimit: z.ZodNumber;
        timeLimit: z.ZodNumber;
        supportedLanguageIds: z.ZodArray<z.ZodString>;
        testCases: z.ZodArray<z.ZodObject<{
            input: z.ZodString;
            expectedOutput: z.ZodString;
            type: z.ZodDefault<z.ZodEnum<{
                SAMPLE: "SAMPLE";
                HIDDEN: "HIDDEN";
            }>>;
            explanation: z.ZodNullable<z.ZodOptional<z.ZodOptional<z.ZodString>>>;
            displayOrder: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    machineCodingDetail: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        repositoryTemplate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        projectStructure: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        techStack: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        implementationInstructions: z.ZodString;
        evaluationGuidelines: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>>;
    projectDetail: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        requirements: z.ZodString;
        submissionInstructions: z.ZodString;
        deadlineHours: z.ZodNumber;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateQuestionSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodEnum<{
        EASY: "EASY";
        MEDIUM: "MEDIUM";
        HARD: "HARD";
    }>>;
    estimatedTime: z.ZodOptional<z.ZodNumber>;
    defaultMarks: z.ZodOptional<z.ZodNumber>;
    categoryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tagIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    mcqDetail: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        allowMultipleCorrectAnswers: z.ZodDefault<z.ZodBoolean>;
        negativeMarks: z.ZodDefault<z.ZodNumber>;
        options: z.ZodArray<z.ZodObject<{
            optionText: z.ZodString;
            displayOrder: z.ZodNumber;
            isCorrect: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    dsaDetail: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        starterCode: z.ZodString;
        referenceSolution: z.ZodString;
        memoryLimit: z.ZodNumber;
        timeLimit: z.ZodNumber;
        supportedLanguageIds: z.ZodArray<z.ZodString>;
        testCases: z.ZodArray<z.ZodObject<{
            input: z.ZodString;
            expectedOutput: z.ZodString;
            type: z.ZodDefault<z.ZodEnum<{
                SAMPLE: "SAMPLE";
                HIDDEN: "HIDDEN";
            }>>;
            explanation: z.ZodNullable<z.ZodOptional<z.ZodOptional<z.ZodString>>>;
            displayOrder: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    machineCodingDetail: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        repositoryTemplate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        projectStructure: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        techStack: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        implementationInstructions: z.ZodString;
        evaluationGuidelines: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>>;
    projectDetail: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        requirements: z.ZodString;
        submissionInstructions: z.ZodString;
        deadlineHours: z.ZodNumber;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const getQuestionsQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        MCQ: "MCQ";
        DSA: "DSA";
        MACHINE_CODING: "MACHINE_CODING";
        PROJECT: "PROJECT";
    }>>;
    difficulty: z.ZodOptional<z.ZodEnum<{
        EASY: "EASY";
        MEDIUM: "MEDIUM";
        HARD: "HARD";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        PUBLISHED: "PUBLISHED";
        ARCHIVED: "ARCHIVED";
    }>>;
    ownership: z.ZodOptional<z.ZodEnum<{
        GLOBAL: "GLOBAL";
        COMPANY: "COMPANY";
    }>>;
    categoryId: z.ZodOptional<z.ZodString>;
    tagIds: z.ZodOptional<z.ZodString>;
    companyId: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        title: "title";
        difficulty: "difficulty";
        defaultMarks: "defaultMarks";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare const questionIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>;
export type GetQuestionsQueryDto = z.infer<typeof getQuestionsQuerySchema>;
//# sourceMappingURL=question.dto.d.ts.map