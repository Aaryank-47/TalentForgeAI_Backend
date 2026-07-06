import { PAGINATION } from "../constants/pagination.constants.js";
import type {
    PaginationMeta,
    PaginationQuery,
    PaginationResult,
} from "../types/pagination.types.js";

export class PaginationHelper {

    /**
     * Parse pagination query parameters
     */
    static getPagination(
        query: PaginationQuery
    ): PaginationResult {

        const page = Math.max(
            Number(query.page) || PAGINATION.DEFAULT_PAGE,
            1
        );

        const limit = Math.min(
            Math.max(
                Number(query.limit) || PAGINATION.DEFAULT_LIMIT,
                1
            ),
            PAGINATION.MAX_LIMIT
        );

        const skip = (page - 1) * limit;

        const sortBy =
            query.sortBy || PAGINATION.DEFAULT_SORT_BY;

        const sortOrder =
            query.sortOrder === "asc" || query.sortOrder === "desc"
                ? query.sortOrder
                : PAGINATION.DEFAULT_SORT_ORDER;

        return {
            page,
            limit,
            skip,
            take: limit,
            sortBy,
            sortOrder,
        };
    }

    /**
     * Build pagination metadata
     */
    static buildMeta(
        page: number,
        limit: number,
        totalItems: number
    ): PaginationMeta {

        const totalPages = Math.ceil(totalItems / limit);

        return {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }

    /**
     * Build standardized paginated response
     */
    static buildResponse<T>(
        data: T[],
        pagination: PaginationResult,
        totalItems: number,
    ): {
        data: T[];
        pagination: PaginationMeta;
    } {

        return {
            data,
            pagination: this.buildMeta(
                pagination.page,
                pagination.limit,
                totalItems
            ),
        };
    }
}