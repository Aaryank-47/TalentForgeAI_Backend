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
//# sourceMappingURL=question.interface.d.ts.map