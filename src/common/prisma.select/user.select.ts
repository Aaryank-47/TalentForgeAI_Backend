import { candidateSelect } from "./candidate.select.js"
import { recruiterSelect } from "./recruiter.select.js"

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
    recruiter: {
        select: recruiterSelect
    },
} as const;