import type { Skill } from "@prisma/client";
export declare class SkillRepository {
    /**
     * Batch lookup for normalized aliases against SkillAlias database table.
     * Prevents N+1 database queries by executing a single `IN` query.
     * @param normalizedAliases Array of lookup keys (e.g. ["reactjs", "nodejs", "k8s"])
     * @returns Map of normalizedAlias -> Skill model
     */
    findSkillsByNormalizedAliases(normalizedAliases: string[]): Promise<Map<string, Skill>>;
    /**
     * Records or increments occurrence count for unknown/unmapped skill candidates.
     * Uses efficient 2-step batch processing (findMany + createMany + batched update)
     * instead of sequential individual upsert queries.
     * Operates safely without failing the primary resume parsing request.
     */
    recordSkillCandidates(candidates: Array<{
        rawName: string;
        normalizedName: string;
    }>): Promise<void>;
}
//# sourceMappingURL=skill.repository.d.ts.map