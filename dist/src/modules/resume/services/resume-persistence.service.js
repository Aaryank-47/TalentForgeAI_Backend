import { Prisma } from "@prisma/client";
import { logger } from "../../../common/logger/logger.js";
import { ApiError } from "../../../common/errors/ApiError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ResumePersistenceRepository } from "../repositories/resume-persistence.repository.js";
export class ResumePersistenceService {
    repository;
    constructor(repository = new ResumePersistenceRepository()) {
        this.repository = repository;
    }
    async persistResumeData(candidateId, data) {
        if (!candidateId.trim())
            throw new BadRequestError("Candidate ID is required");
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
        }
        catch (error) {
            logger.error({ candidateId, err: error }, "[ResumePersistenceService] Failed to persist resume");
            if (error instanceof ApiError)
                throw error;
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                throw new NotFoundError("Candidate not found");
            }
            throw new ApiError(500, "Failed to persist resume data");
        }
    }
}
//# sourceMappingURL=resume-persistence.service.js.map