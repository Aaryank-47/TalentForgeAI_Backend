// import type {
//   AssessmentItemType,
//   AssessmentItemStatus,
//   AssessmentItemDifficulty,
//   AssessmentItemOwnership,
//   TestCaseType
// } from "@prisma/client";
export {};
// export interface TestCaseView {
//   id: string;
//   input: string;
//   expectedOutput: string;
//   type: TestCaseType;
//   explanation: string | null;
// }
// export interface DSADetailView {
//   id: string;
//   starterCode: string;
//   referenceSolution: string;
//   memoryLimit: number;
//   timeLimit: number;
//   supportedLanguages: { programmingLanguage: ProgrammingLanguageView }[];
//   testCases: TestCaseView[];
// }
// export interface MachineCodingDetailView {
//   id: string;
//   repositoryTemplate: string;
//   techStack: string;
//   evaluationInstructions: string;
// }
// export interface ProjectDetailView {
//   id: string;
//   requirements: string;
//   submissionInstructions: string;
//   deadlineHours: number;
// }
// export interface AssessmentItemView {
//   id: string;
//   title: string;
//   description: string;
//   type: AssessmentItemType;
//   difficulty: AssessmentItemDifficulty;
//   estimatedTime: number;
//   defaultMarks: number;
//   ownership: AssessmentItemOwnership;
//   status: AssessmentItemStatus;
//   companyId: string | null;
//   createdByCompanyMemberId: string | null;
//   createdById: string | null;
//   updatedById: string | null;
//   publishedById: string | null;
//   archivedById: string | null;
//   deletedAt: Date | null;
//   deletedById: string | null;
//   categoryId: string | null;
//   publishedAt: Date | null;
//   archivedAt: Date | null;
//   createdAt: Date;
//   updatedAt: Date;
//   category?: QuestionCategoryView | null;
//   tags?: { tag: QuestionTagView }[];
//   mcqDetail?: MCQDetailView | null;
//   dsaDetail?: DSADetailView | null;
//   machineCodingDetail?: MachineCodingDetailView | null;
//   projectDetail?: ProjectDetailView | null;
// }
// export interface AssessmentItemFilterQueryParams {
//   page?: string;
//   limit?: string;
//   search?: string;
//   type?: AssessmentItemType;
//   difficulty?: AssessmentItemDifficulty;
//   status?: AssessmentItemStatus;
//   categoryId?: string;
//   tagIds?: string | string[];
// }
//# sourceMappingURL=question.interface.js.map