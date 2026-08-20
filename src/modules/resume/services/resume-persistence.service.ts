import { Prisma } from "@prisma/client";
import { logger } from "../../../common/logger/logger.js";
import { ApiError } from "../../../common/errors/ApiError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import type { ResumeParsingResult } from "../interfaces/resume-parser.interface.js";
import { ResumePersistenceRepository } from "../repositories/resume-persistence.repository.js";
import type { ResumePersistenceResult } from "../interfaces/resume-persistence.interface.js";

export interface ResumePersistencePort {
    persist(candidateId: string, data: ResumeParsingResult): Promise<ResumePersistenceResult>;
}

export class ResumePersistenceService {
    constructor(
        private readonly repository: ResumePersistencePort = new ResumePersistenceRepository()
    ) {}

    async persistResumeData(candidateId: string, data: ResumeParsingResult): Promise<ResumePersistenceResult> {
        if (!candidateId.trim()) throw new BadRequestError("Candidate ID is required");
        const startedAt = performance.now();
        try {
            const result = await this.repository.persist(candidateId, data);
            logger.info({
                candidateId,
                skills: data.skills.length,
                experiences: data.experience.length,
                projects: data.projects.length,
                certifications: data.certifications.length,
                durationMs: Math.round(performance.now() - startedAt)
            }, "[ResumePersistenceService] Resume persisted");
            return result;
        } catch (error: unknown) {
            logger.error({ candidateId, err: error }, "[ResumePersistenceService] Failed to persist resume");
            if (error instanceof ApiError) throw error;
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                throw new NotFoundError("Candidate not found");
            }
            throw new ApiError(500, "Failed to persist resume data");
        }
    }
}