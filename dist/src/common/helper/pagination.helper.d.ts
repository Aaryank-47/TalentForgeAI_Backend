import type { PaginationMeta, PaginationQuery, PaginationResult } from "../types/pagination.types.js";
export declare class PaginationHelper {
    /**
     * Parse pagination query parameters
     */
    static getPagination(query: PaginationQuery): PaginationResult;
    /**
     * Build pagination metadata
     */
    static buildMeta(page: number, limit: number, totalItems: number): PaginationMeta;
    /**
     * Build standardized paginated response
     */
    static buildResponse<T>(data: T[], pagination: PaginationResult, totalItems: number): {
        data: T[];
        pagination: PaginationMeta;
    };
}
//# sourceMappingURL=pagination.helper.d.ts.map