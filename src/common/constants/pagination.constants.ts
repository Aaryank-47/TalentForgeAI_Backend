// src/common/constants/pagination.constants.ts

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,

    DEFAULT_SORT_BY: "createdAt",
    DEFAULT_SORT_ORDER: "desc",

    ALLOWED_SORT_ORDERS: ["asc", "desc"] as const,
} as const;