import type { QuestionDifficulty } from "@prisma/client";
export interface QuestionCategoryView {
    id: string;
    name: string;
    displayOrder: number;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    parent?: QuestionCategoryView | null;
    children?: QuestionCategoryView[];
}
export interface QuestionTagView {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ProgrammingLanguageView {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface DSASupportedLanguageView {
    dsaDetailId: string;
    programmingLanguageId: string;
    createdAt: Date;
    programmingLanguage?: ProgrammingLanguageView;
}
export interface MCQOptionInput {
    optionText: string;
    displayOrder: number;
    isCorrect: boolean;
}
export interface MCQDetailInput {
    allowMultipleCorrectAnswers: boolean;
    negativeMarks: number;
    options: MCQOptionInput[];
}
export interface TestCaseInput {
    input: string;
    expectedOutput: string;
    type?: "SAMPLE" | "HIDDEN";
    explanation?: string | null;
    displayOrder: number;
}
export interface DSADetailInput {
    starterCode: string;
    referenceSolution: string;
    memoryLimit: number;
    timeLimit: number;
    supportedLanguageIds: string[];
    testCases: TestCaseInput[];
}
export interface MachineCodingDetailInput {
    repositoryTemplate?: string | null;
    projectStructure?: string | null;
    techStack?: string | null;
    implementationInstructions: string;
    evaluationGuidelines?: string | null;
}
export interface ProjectDetailInput {
    requirements: string;
    submissionInstructions: string;
    deadlineHours: number;
}
export interface CreateQuestionInput {
    title: string;
    description: string;
    type: "MCQ" | "DSA" | "MACHINE_CODING" | "PROJECT";
    difficulty: "EASY" | "MEDIUM" | "HARD";
    estimatedTime: number;
    defaultMarks: number;
    ownership: "GLOBAL" | "COMPANY";
    categoryId?: string | null;
    tagIds?: string[];
    companyId?: string | null;
    mcqDetail?: MCQDetailInput | null;
    dsaDetail?: DSADetailInput | null;
    machineCodingDetail?: MachineCodingDetailInput | null;
    projectDetail?: ProjectDetailInput | null;
}
export interface UpdateQuestionInput {
    title?: string;
    description?: string;
    difficulty?: "EASY" | "MEDIUM" | "HARD";
    estimatedTime?: number;
    defaultMarks?: number;
    categoryId?: string | null;
    tagIds?: string[];
    mcqDetail?: MCQDetailInput | null;
    dsaDetail?: DSADetailInput | null;
    machineCodingDetail?: MachineCodingDetailInput | null;
    projectDetail?: ProjectDetailInput | null;
}
export interface SectionQuestionItemView {
    sectionItemId: string;
    displayOrder: number;
    marksOverride: number | null;
    timeLimitOverride: number | null;
    question: {
        id: string;
        title: string;
        difficulty: QuestionDifficulty;
        defaultMarks: number;
    };
}
import type { Question, QuestionCategory, QuestionTag, MCQDetail, MCQOption, DSADetail, TestCase, MachineCodingDetail, ProjectDetail, User, ProgrammingLanguage } from "@prisma/client";
export interface QuestionWithRelations extends Question {
    category: QuestionCategory | null;
    tags: {
        tag: QuestionTag;
    }[];
    mcqDetail?: (MCQDetail & {
        options: MCQOption[];
    }) | null;
    dsaDetail?: (DSADetail & {
        supportedLanguages: {
            programmingLanguage: ProgrammingLanguage;
        }[];
        testCases: TestCase[];
    }) | null;
    machineCodingDetail?: MachineCodingDetail | null;
    projectDetail?: ProjectDetail | null;
    createdBy?: User | null;
    updatedBy?: User | null;
    publishedBy?: User | null;
    archivedBy?: User | null;
    deletedBy?: User | null;
}
//# sourceMappingURL=question.interface.d.ts.map