import { logger } from "../../../common/logger/logger.js";
import type { Skill } from "@prisma/client";
import type { ResumeSkillResult } from "../../resume/interfaces/resume-parser.interface.js";
import {
    normalizeSkillLookupKey,
    normalizeSkillName
} from "../../resume/utils/resume-normalization.utils.js";
import { SkillRepository } from "../repositories/skill.repository.js";

export class SkillNormalizationService {
    private readonly skillRepository = new SkillRepository();

    public async normalizeSkills(skills: ResumeSkillResult[]): Promise<ResumeSkillResult[]> {
        if (!Array.isArray(skills) || skills.length === 0) {
            return [];
        }

        logger.info(`[SkillNormalizationService] Starting skill normalization. Input skills: ${skills.length}`);

        // Clean raw skill strings and build candidate array
        const rawCandidates: Array<{
            original: ResumeSkillResult;
            cleanedName: string;
            lookupKey: string
        }> = [];

        for (const skill of skills) {
            if (!skill || !skill.name) continue;

            const cleanedName = normalizeSkillName(skill.name);
            if (!cleanedName) continue;

            const lookupKey = normalizeSkillLookupKey(cleanedName);
            if (!lookupKey) continue;

            rawCandidates.push({
                original: skill,
                cleanedName,
                lookupKey
            });
        }

        if (rawCandidates.length === 0) {
            return [];
        }

        // Perform batched database lookup (Single SQL `IN` query to prevent N+1 queries)
        let dbAliasMap = new Map<string, Skill>();
        try {
            const allLookupKeys = rawCandidates.map((c) => c.lookupKey);
            dbAliasMap = await this.skillRepository.findSkillsByNormalizedAliases(allLookupKeys);
        } catch (error: unknown) {
            logger.warn(
                `[SkillNormalizationService] Database alias lookup failed: ${
                    error instanceof Error ? error.message : "Unknown error"
                }. Continuing with fallback raw skills.`
            );
        }

        // Resolve canonical skill names or preserve raw normalized skill strings
        const skillMap = new Map<string, ResumeSkillResult>();
        const unknownCandidates: Array<{ rawName: string; normalizedName: string }> = [];
        let matchedCount = 0;

        for (const candidate of rawCandidates) {
            const matchedSkill = dbAliasMap.get(candidate.lookupKey);

            let canonicalName: string;
            if (matchedSkill) {
                canonicalName = matchedSkill.name;
                matchedCount++;
            } else {
                canonicalName = candidate.cleanedName;
                unknownCandidates.push({
                    rawName: candidate.original.name,
                    normalizedName: candidate.lookupKey
                });
            }

            const dedupKey = normalizeSkillLookupKey(canonicalName);
            const yoe = candidate.original.yearsOfExperience;
            const validYoe = yoe !== null && yoe !== undefined && yoe >= 0 ? yoe : null;

            const existing = skillMap.get(dedupKey);

            if (existing) {
                const existingYoe = existing.yearsOfExperience;
                const mergedYoe =
                    existingYoe === null || existingYoe === undefined
                        ? validYoe
                        : validYoe === null
                        ? existingYoe
                        : Math.max(existingYoe, validYoe);

                skillMap.set(dedupKey, {
                    name: existing.name, // Preserve first encountered display name
                    yearsOfExperience: mergedYoe
                });
            } else {
                skillMap.set(dedupKey, {
                    name: canonicalName,
                    yearsOfExperience: validYoe
                });
            }
        }

        // Asynchronously record unknown skill candidates without blocking
        if (unknownCandidates.length > 0) {
            this.skillRepository.recordSkillCandidates(unknownCandidates).catch((err: unknown) => {
                logger.warn(
                    `[SkillNormalizationService] Asynchronous candidate recording warning: ${
                        err instanceof Error ? err.message : "Unknown error"
                    }`
                );
            });
        }

        const result = Array.from(skillMap.values());

        logger.info(
            `[SkillNormalizationService] Skill normalization completed. Input: ${skills.length}, Output: ${result.length}, Matched DB: ${matchedCount}, Unknown: ${unknownCandidates.length}`
        );

        return result;
    }
}
