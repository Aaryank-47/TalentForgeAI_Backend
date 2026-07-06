export interface PaginationQuery {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
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
