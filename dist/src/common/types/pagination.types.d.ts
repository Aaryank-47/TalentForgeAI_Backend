export interface PaginationQuery {
    page?: string | number | undefined;
    limit?: string | number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}
export interface PaginationResult {
    page: number;
    limit: number;
    skip: number;
    take: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
}
export interface PaginationMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
//# sourceMappingURL=pagination.types.d.ts.map