import prisma from "../../../config/database.js";
import { logger } from "../../../common/logger/logger.js";
export class SkillRepository {
    /**
     * Batch lookup for normalized aliases against SkillAlias database table.
     * Prevents N+1 database queries by executing a single `IN` query.
     * @param normalizedAliases Array of lookup keys (e.g. ["reactjs", "nodejs", "k8s"])
     * @returns Map of normalizedAlias -> Skill model
     */
    async findSkillsByNormalizedAliases(normalizedAliases) {
        const resultMap = new Map();
        if (!normalizedAliases || normalizedAliases.length === 0) {
            return resultMap;
        }
        const uniqueKeys = Array.from(new Set(normalizedAliases.filter(Boolean)));
        if (uniqueKeys.length === 0) {
            return resultMap;
        }
        try {
            const aliasRecords = await prisma.skillAlias.findMany({
                where: {
                    normalizedAlias: {
                        in: uniqueKeys
                    },
                    skill: {
                        isActive: true
                    }
                },
                include: {
                    skill: true
                }
            });
            for (const record of aliasRecords) {
                if (record.skill) {
                    resultMap.set(record.normalizedAlias, record.skill);
                }
            }
            logger.info(`[SkillRepository] Resolved ${resultMap.size} skill aliases out of ${uniqueKeys.length} requested lookup keys`);
        }
        catch (error) {
            logger.warn(`[SkillRepository] Failed to query skill aliases from database: ${error instanceof Error ? error.message : "Unknown error"}. Gracefully continuing with fallback...`);
        }
        return resultMap;
    }
    /**
     * Records or increments occurrence count for unknown/unmapped skill candidates.
     * Uses efficient 2-step batch processing (findMany + createMany + batched update)
     * instead of sequential individual upsert queries.
     * Operates safely without failing the primary resume parsing request.
     */
    async recordSkillCandidates(candidates) {
        if (!candidates || candidates.length === 0) {
            return;
        }
        const validCandidates = candidates.filter((c) => c && c.normalizedName && c.normalizedName.trim().length > 0 && c.rawName && c.rawName.trim().length > 0);
        if (validCandidates.length === 0) {
            return;
        }
        const uniqueCandidates = Array.from(new Map(validCandidates.map((c) => [c.normalizedName, c])).values());
        const candidateKeys = uniqueCandidates.map((c) => c.normalizedName);
        try {
            // Step 1: Query existing candidates in bulk
            const existingRecords = await prisma.skillCandidate.findMany({
                where: {
                    normalizedName: {
                        in: candidateKeys
                    }
                }
            });
            const existingKeysSet = new Set(existingRecords.map((r) => r.normalizedName));
            const newCandidates = uniqueCandidates.filter((c) => !existingKeysSet.has(c.normalizedName));
            const existingCandidates = uniqueCandidates.filter((c) => existingKeysSet.has(c.normalizedName));
            // Step 2: Bulk insert new candidates
            if (newCandidates.length > 0) {
                await prisma.skillCandidate.createMany({
                    data: newCandidates.map((c) => ({
                        rawName: c.rawName,
                        normalizedName: c.normalizedName,
                        occurrenceCount: 1
                    })),
                    skipDuplicates: true
                });
            }
            // Step 3: Batched update for existing candidates
            if (existingCandidates.length > 0) {
                await prisma.$transaction(existingCandidates.map((c) => prisma.skillCandidate.update({
                    where: { normalizedName: c.normalizedName },
                    data: {
                        occurrenceCount: { increment: 1 },
                        rawName: c.rawName
                    }
                })));
            }
            logger.info(`[SkillRepository] Recorded ${uniqueCandidates.length} unknown skill candidates (New: ${newCandidates.length}, Existing: ${existingCandidates.length})`);
        }
        catch (error) {
            logger.warn(`[SkillRepository] Failed to record ${uniqueCandidates.length} skill candidates: ${error instanceof Error ? error.message : "Unknown error"}. Gracefully continuing...`);
        }
    }
}
//# sourceMappingURL=skill.repository.js.map