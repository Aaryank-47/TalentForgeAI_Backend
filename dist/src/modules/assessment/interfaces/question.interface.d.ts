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
//# sourceMappingURL=question.interface.d.ts.map