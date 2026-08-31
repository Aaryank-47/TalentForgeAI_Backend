import { logger } from "../../../common/logger/logger.js";
import { SkillNormalizationService } from "./skill-normalization.service.js";
import type {
    PersonalInfoResult,
    ProfessionalInfoResult,
    ResumeCertificationResult,
    ResumeEducationResult,
    ResumeExperienceResult,
    ResumeParsingResult,
    ResumeProjectResult,
    ResumeSkillResult
} from "../interfaces/resume-parser.interface.js";
import {
    normalizeDateString,
    normalizeEmail,
    normalizeEmploymentType,
    normalizeLookupKey,
    normalizePhone,
    normalizeString,
    normalizeText,
    normalizeUrl
} from "../utils/resume-normalization.utils.js";

export class ResumeNormalizationService {
    private readonly skillNormalizationService = new SkillNormalizationService();

    public async normalizeResumeData(data: ResumeParsingResult): Promise<ResumeParsingResult> {
        if (!data) {
            throw new Error("Cannot normalize null or undefined resume data");
        }

        logger.info("[ResumeNormalizationService] Starting deterministic resume data normalization...");

        const normalizedPersonal = this.normalizePersonal(data.personal);
        const normalizedProfessional = this.normalizeProfessional(data.professional);
        const normalizedSkills = await this.skillNormalizationService.normalizeSkills(data.skills);
        const normalizedExperience = this.normalizeExperience(data.experience);
        const normalizedEducation = this.normalizeEducation(data.education);
        const normalizedProjects = this.normalizeProjects(data.projects);
        const normalizedCertifications = this.normalizeCertifications(data.certifications);

        logger.info(
            `[ResumeNormalizationService] Resume data normalization completed. Skills: ${data.skills?.length ?? 0} -> ${normalizedSkills.length}, Projects: ${data.projects?.length ?? 0} -> ${normalizedProjects.length}, Certifications: ${data.certifications?.length ?? 0} -> ${normalizedCertifications.length}`
        );

        return {
            personal: normalizedPersonal,
            professional: normalizedProfessional,
            skills: normalizedSkills,
            experience: normalizedExperience,
            education: normalizedEducation,
            projects: normalizedProjects,
            certifications: normalizedCertifications
        };
    }

    private normalizePersonal(personal: PersonalInfoResult): PersonalInfoResult {
        return {
            fullName: normalizeString(personal.fullName),
            email: normalizeEmail(personal.email),
            phoneNumber: normalizePhone(personal.phoneNumber),
            currentLocation: normalizeString(personal.currentLocation),
            linkedinUrl: normalizeUrl(personal.linkedinUrl),
            githubUrl: normalizeUrl(personal.githubUrl),
            portfolioUrl: normalizeUrl(personal.portfolioUrl),
            websiteUrl: normalizeUrl(personal.websiteUrl)
        };
    }

    private normalizeProfessional(professional: ProfessionalInfoResult): ProfessionalInfoResult {
        const exp = professional.totalExperience;
        return {
            headline: normalizeString(professional.headline),
            bio: normalizeText(professional.bio),
            currentCompany: normalizeString(professional.currentCompany),
            currentDesignation: normalizeString(professional.currentDesignation),
            totalExperience: exp !== null && exp !== undefined && exp >= 0 ? exp : null
        };
    }

    private normalizeExperience(experience: ResumeExperienceResult[]): ResumeExperienceResult[] {
        if (!Array.isArray(experience) || experience.length === 0) {
            return [];
        }

        return experience
            .filter(Boolean)
            .map((item) => ({
                companyName: normalizeString(item.companyName) ?? item.companyName,
                designation: normalizeString(item.designation) ?? item.designation,
                employmentType: normalizeEmploymentType(item.employmentType),
                description: normalizeText(item.description),
                location: normalizeString(item.location),
                startDate: normalizeDateString(item.startDate),
                endDate: normalizeDateString(item.endDate),
                currentlyWorking: Boolean(item.currentlyWorking)
            }));
    }

    private normalizeEducation(education: ResumeEducationResult[]): ResumeEducationResult[] {
        if (!Array.isArray(education) || education.length === 0) {
            return [];
        }

        return education
            .filter(Boolean)
            .map((item) => {
                const g = item.grade;
                return {
                    collegeName: normalizeString(item.collegeName) ?? item.collegeName,
                    degree: normalizeString(item.degree) ?? item.degree,
                    fieldOfStudy: normalizeString(item.fieldOfStudy) ?? item.fieldOfStudy,
                    currentlyStudying: Boolean(item.currentlyStudying),
                    startDate: normalizeDateString(item.startDate),
                    endDate: normalizeDateString(item.endDate),
                    gradingSystem: item.gradingSystem ?? null,
                    gradeText: normalizeString(item.gradeText),
                    grade: g !== null && g !== undefined && g >= 0 ? g : null
                };
            });
    }

    private normalizeProjects(projects: ResumeProjectResult[]): ResumeProjectResult[] {
        if (!Array.isArray(projects) || projects.length === 0) {
            return [];
        }

        const projectMap = new Map<string, ResumeProjectResult>();

        for (const item of projects) {
            if (!item || !item.name) continue;

            const name = normalizeString(item.name);
            if (!name) continue;

            const description = normalizeText(item.description);
            const dedupKey = `${normalizeLookupKey(name)}|||${normalizeLookupKey(description)}`;

            if (!projectMap.has(dedupKey)) {
                projectMap.set(dedupKey, {
                    name,
                    description
                });
            }
        }

        return Array.from(projectMap.values());
    }

    private normalizeCertifications(certifications: ResumeCertificationResult[]): ResumeCertificationResult[] {
        if (!Array.isArray(certifications) || certifications.length === 0) {
            return [];
        }

        const certMap = new Map<string, ResumeCertificationResult>();

        for (const item of certifications) {
            if (!item || !item.name) continue;

            const name = normalizeString(item.name);
            if (!name) continue;

            const dedupKey = normalizeLookupKey(name);

            if (!certMap.has(dedupKey)) {
                certMap.set(dedupKey, {
                    name
                });
            }
        }

        return Array.from(certMap.values());
    }
}
