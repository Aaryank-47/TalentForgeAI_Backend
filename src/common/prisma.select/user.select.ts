import { candidateSelect } from "./candidate.select.js"
import { employerSelect } from "./employer.select.js"

export const userSelect = {
    id: true,
    email: true,
    role: true,
    status: true,
    isEmailVerified: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
} as const;

export const loginUserSelect = {
    id: true,
    email: true,
    password: true,
    role: true,
    status: true,
    isEmailVerified: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
    candidate: {
        select: candidateSelect
    },
    employer: {
        select: employerSelect
    },
} as const;