import { logger } from "../../../common/logger/logger.js";
import { OpenRouterClient } from "../../../common/integrations/openRouter/openrouter.client.js";
import { MATCHING_WEIGHTS, MATCHING_SUB_WEIGHTS, MATCHING_THRESHOLDS } from "../constants/matching.constants.js";
import { normalizeSkillLookupKey } from "../../resume/utils/resume-normalization.utils.js";
export class MatchingScorerService {
    static calculateDeterministicScore(candidate, job) {
        const skillsFactor = this.evaluateSkills(candidate, job);
        const experienceFactor = this.evaluateExperience(candidate, job);
        const locationFactor = this.evaluateLocation(candidate, job);
        const roleFactor = this.evaluateRole(candidate, job);
        const educationFactor = this.evaluateEducation(candidate, job);
        const totalScore = Math.round(skillsFactor.score +
            experienceFactor.score +
            locationFactor.score +
            roleFactor.score +
            educationFactor.score);
        const factors = {
            skills: skillsFactor,
            experience: experienceFactor,
            location: locationFactor,
            role: roleFactor,
            education: educationFactor
        };
        return {
            score: Math.min(100, Math.max(0, totalScore)),
            factors
        };
    }
    static async calculateSemanticScore(candidate, job, deterministicScore) {
        // Only evaluate if deterministic score meets minimum threshold
        if (deterministicScore < MATCHING_THRESHOLDS.SEMANTIC_SCORING_MIN_THRESHOLD) {
            return {
                score: deterministicScore,
                reasoning: "Deterministic score below threshold for AI semantic evaluation",
                usedAI: false
            };
        }
        try {
            const systemPrompt = `You are an expert HR and Technical Recruiter AI evaluating candidate-job alignment.
                Score the overall fit from 0 to 100 based on technical synergy, domain relevance, and role expectations.
                Return your response ONLY in valid JSON format:
                {
                  "semanticScore": number,
                  "reasoning": "string"
                }`;
            const candidateSummary = [
                `Name: ${candidate.fullName}`,
                `Headline: ${candidate.headline || "N/A"}`,
                `Designation: ${candidate.currentDesignation || "N/A"}`,
                `Total Experience: ${candidate.totalExperience ?? 0} years`,
                `Skills: ${candidate.skills.map(s => s.name).join(", ") || "N/A"}`,
                `Education: ${candidate.educationDegrees.join(", ") || "N/A"}`,
                `Certifications: ${candidate.certificationNames.join(", ") || "N/A"}`
            ].join("\n");
            const jobSummary = [
                `Title: ${job.title}`,
                `Summary: ${job.summary || "N/A"}`,
                `Description: ${job.description.slice(0, 800)}`,
                `Experience Required: ${job.minExperience}-${job.maxExperience} years`,
                `Workplace: ${job.workplaceType} at ${job.location || "Any"}`
            ].join("\n");
            const userPrompt = `Evaluate the fit between this Candidate and Job:\n\n[CANDIDATE PROFILE]\n${candidateSummary}\n\n[JOB REQUIREMENTS]\n${jobSummary}`;
            const rawAiResponse = await OpenRouterClient.generateText({
                systemPrompt,
                userPrompt,
                temperature: 0.2,
                maxTokens: 300
            });
            const parsed = this.parseAiResponse(rawAiResponse);
            if (parsed && typeof parsed.semanticScore === "number") {
                const boundedScore = Math.min(100, Math.max(0, Math.round(parsed.semanticScore)));
                return {
                    score: boundedScore,
                    reasoning: parsed.reasoning || "AI semantic evaluation completed",
                    usedAI: true
                };
            }
            return {
                score: deterministicScore,
                reasoning: "AI response could not be parsed; preserved deterministic score",
                usedAI: false
            };
        }
        catch (error) {
            logger.warn({
                err: error instanceof Error ? error.message : "Unknown AI error",
                candidateId: candidate.id,
                jobId: job.id
            }, "[MatchingScorerService] Semantic AI scoring encountered an error; falling back to deterministic score seamlessly.");
            return {
                score: deterministicScore,
                reasoning: "AI evaluation fallback; deterministic score retained",
                usedAI: false
            };
        }
    }
    /**
     * Blends deterministic score and semantic score according to configured weights.
     */
    static blendFinalScore(deterministicScore, semanticResult) {
        if (!semanticResult || !semanticResult.usedAI) {
            return deterministicScore;
        }
        const blended = deterministicScore * MATCHING_THRESHOLDS.DETERMINISTIC_BLEND_WEIGHT +
            semanticResult.score * MATCHING_THRESHOLDS.SEMANTIC_BLEND_WEIGHT;
        return Math.min(100, Math.max(0, Math.round(blended)));
    }
    // ── Helper Factor Evaluators ──────────────────────────────────────
    static evaluateSkills(candidate, job) {
        const candidateSkillKeys = new Set(candidate.skills.map((s) => normalizeSkillLookupKey(s.name)).filter(Boolean));
        const requiredSkills = job.skills.filter((s) => s.isRequired);
        const preferredSkills = job.skills.filter((s) => !s.isRequired);
        const requiredMatched = [];
        const requiredMissing = [];
        const preferredMatched = [];
        const preferredMissing = [];
        for (const reqSkill of requiredSkills) {
            const key = normalizeSkillLookupKey(reqSkill.name);
            if (candidateSkillKeys.has(key) || this.hasPartialSkillMatch(key, candidateSkillKeys)) {
                requiredMatched.push(reqSkill.name);
            }
            else {
                requiredMissing.push(reqSkill.name);
            }
        }
        for (const prefSkill of preferredSkills) {
            const key = normalizeSkillLookupKey(prefSkill.name);
            if (candidateSkillKeys.has(key) || this.hasPartialSkillMatch(key, candidateSkillKeys)) {
                preferredMatched.push(prefSkill.name);
            }
            else {
                preferredMissing.push(prefSkill.name);
            }
        }
        const reqPct = requiredSkills.length === 0 ? 1.0 : requiredMatched.length / requiredSkills.length;
        const prefPct = preferredSkills.length === 0 ? 1.0 : preferredMatched.length / preferredSkills.length;
        const reqScore = reqPct * MATCHING_SUB_WEIGHTS.REQUIRED_SKILLS;
        const prefScore = prefPct * MATCHING_SUB_WEIGHTS.PREFERRED_SKILLS;
        const score = Math.round(reqScore + prefScore);
        return {
            score,
            maxScore: MATCHING_WEIGHTS.SKILLS,
            requiredMatched,
            requiredMissing,
            preferredMatched,
            preferredMissing,
            requiredMatchPercentage: Math.round(reqPct * 100),
            preferredMatchPercentage: Math.round(prefPct * 100)
        };
    }
    static evaluateExperience(candidate, job) {
        const candidateYoe = candidate.totalExperience ?? 0;
        const minYoe = job.minExperience;
        const maxYoe = job.maxExperience > 0 ? job.maxExperience : Math.max(minYoe + 5, 10);
        let score = 0;
        let levelFit = "EXACT";
        if (minYoe === 0 && candidateYoe >= 0) {
            score = MATCHING_WEIGHTS.EXPERIENCE;
            levelFit = "ENTRY_LEVEL_FIT";
        }
        else if (candidateYoe >= minYoe && candidateYoe <= maxYoe + 2) {
            score = MATCHING_WEIGHTS.EXPERIENCE;
            levelFit = "STRONG_FIT";
        }
        else if (candidateYoe >= minYoe) {
            const overage = candidateYoe - maxYoe;
            score = Math.max(15, MATCHING_WEIGHTS.EXPERIENCE - Math.min(10, overage * 1.5));
            levelFit = "OVERQUALIFIED";
        }
        else {
            const deficit = minYoe - candidateYoe;
            if (deficit <= 1) {
                score = 18;
                levelFit = "SLIGHTLY_BELOW_MINIMUM";
            }
            else if (deficit <= 2) {
                score = 10;
                levelFit = "BELOW_MINIMUM";
            }
            else {
                score = Math.max(2, 6 - deficit);
                levelFit = "UNDERQUALIFIED";
            }
        }
        return {
            score: Math.round(score),
            maxScore: MATCHING_WEIGHTS.EXPERIENCE,
            candidateYoe,
            minRequiredYoe: minYoe,
            maxRequiredYoe: maxYoe,
            levelFit
        };
    }
    static evaluateLocation(candidate, job) {
        const isRemote = job.workplaceType === "REMOTE";
        let score = 0;
        if (isRemote) {
            // Remote jobs match any location
            score = MATCHING_WEIGHTS.LOCATION;
        }
        else {
            const jobLoc = (job.location || "").toLowerCase().trim();
            const candLoc = (candidate.currentLocation || "").toLowerCase().trim();
            const candPrefLoc = (candidate.preferredLocation || "").toLowerCase().trim();
            if (!jobLoc || !candLoc) {
                score = job.workplaceType === "HYBRID" ? 10 : 8;
            }
            else if (candLoc.includes(jobLoc) || jobLoc.includes(candLoc)) {
                score = MATCHING_WEIGHTS.LOCATION;
            }
            else if (candPrefLoc && (candPrefLoc.includes(jobLoc) || jobLoc.includes(candPrefLoc))) {
                score = MATCHING_WEIGHTS.LOCATION - 2;
            }
            else if (job.workplaceType === "HYBRID") {
                score = 6;
            }
            else {
                score = 3;
            }
        }
        return {
            score: Math.round(score),
            maxScore: MATCHING_WEIGHTS.LOCATION,
            workplaceType: job.workplaceType,
            jobLocation: job.location,
            candidateLocation: candidate.currentLocation,
            isRemoteCompatible: isRemote || Boolean(candidate.preferredLocation)
        };
    }
    static evaluateRole(candidate, job) {
        const jobTitle = job.title.toLowerCase();
        const candidateDesignation = (candidate.currentDesignation || "").toLowerCase();
        const candidateHeadline = (candidate.headline || "").toLowerCase();
        const similarity = this.calculateTitleSimilarity(jobTitle, candidateDesignation, candidateHeadline);
        const score = Math.round(similarity * MATCHING_WEIGHTS.ROLE);
        return {
            score,
            maxScore: MATCHING_WEIGHTS.ROLE,
            jobTitle: job.title,
            candidateDesignation: candidate.currentDesignation,
            candidateHeadline: candidate.headline,
            titleSimilarity: Math.round(similarity * 100)
        };
    }
    static evaluateEducation(candidate, _job) {
        let score = 5;
        const matchedDegrees = [];
        const matchedCerts = [];
        if (candidate.educationDegrees && candidate.educationDegrees.length > 0) {
            score += 3;
            matchedDegrees.push(...candidate.educationDegrees);
        }
        if (candidate.certificationNames && candidate.certificationNames.length > 0) {
            score += 2;
            matchedCerts.push(...candidate.certificationNames);
        }
        return {
            score: Math.min(MATCHING_WEIGHTS.EDUCATION, score),
            maxScore: MATCHING_WEIGHTS.EDUCATION,
            matchedDegrees,
            matchedCertifications: matchedCerts
        };
    }
    static hasPartialSkillMatch(key, candidateSkillKeys) {
        for (const candKey of candidateSkillKeys) {
            if (candKey.includes(key) || key.includes(candKey)) {
                return true;
            }
        }
        return false;
    }
    static calculateTitleSimilarity(jobTitle, designation, headline) {
        if (!designation && !headline)
            return 0.4;
        const targetWords = jobTitle.split(/\W+/).filter(w => w.length > 2);
        const sourceWords = `${designation} ${headline}`.split(/\W+/).filter(w => w.length > 2);
        if (targetWords.length === 0 || sourceWords.length === 0)
            return 0.4;
        let matchCount = 0;
        for (const tw of targetWords) {
            if (sourceWords.some(sw => sw.includes(tw) || tw.includes(sw))) {
                matchCount++;
            }
        }
        return Math.min(1.0, Math.max(0.3, matchCount / targetWords.length));
    }
    static parseAiResponse(raw) {
        try {
            const cleanJson = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
            return JSON.parse(cleanJson);
        }
        catch {
            const match = raw.match(/"semanticScore"\s*:\s*(\d+)/i);
            if (match && match[1]) {
                return { semanticScore: parseInt(match[1], 10), reasoning: "Extracted from AI response" };
            }
            return null;
        }
    }
}
//# sourceMappingURL=matching-scorer.service.js.map