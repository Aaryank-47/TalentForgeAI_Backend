import type { CandidateProfileView, ResumeView, SkillsView, CandidateEducationView, CandidateExperienceView } from "../interfaces/candidate.interface.js";
import type { UpdateCandidateProfileDto, AddEducationDto, UpdateEducationDto, AddExperienceDto, UpdateExperienceDto } from "../dto/candidate.dto.js";
import type { Resume, Prisma } from "@prisma/client";
export declare class CandidateRepository {
    static updateCandidateProfile(userId: string, updateData: UpdateCandidateProfileDto): Promise<CandidateProfileView>;
    static findProfileWithRelationsCount(userId: string): Promise<{
        fullName: string;
        phoneNumber: string | null;
        _count: {
            skills: number;
            educations: number;
            experiences: number;
        };
        profilePicture: string | null;
        headline: string | null;
        bio: string | null;
        currentLocation: string | null;
        isOpenToWork: boolean;
    } | null>;
    static uploadResume(userId: string, resumeData: {
        resumeUrl: string;
        resumeName: string;
        fileSize: number;
    }): Promise<Resume>;
    static findResumesByCandidateId(candidateId: string): Promise<ResumeView[]>;
    static findResumeById(resumeId: string): Promise<Resume[]>;
    static findResumeBelongToUser(userId: string, resumeId: string): Promise<Resume[]>;
    static findResumesBelongingToUser(userId: string, resumeIds: string[]): Promise<Resume[]>;
    static deleteResume(resumeId: string): Promise<Resume>;
    static deleteMultipleResumes(resumeIds: string[]): Promise<Prisma.BatchPayload>;
    static findSkillById(skillId: string): Promise<SkillsView | null>;
    static findSkillsNameViaCandidate(skillName: string, candidateId: string): Promise<SkillsView | null>;
    static addSkills(candidateId: string, name: string, yearsOfExperience: number | null): Promise<SkillsView>;
    static findAllSkillsByCandidateId(candidateId: string): Promise<SkillsView[]>;
    static findSkillBelongToUser(candidateId: string, skillId: string): Promise<SkillsView | null>;
    static findSkillsBelongToUser(candidateId: string, skillIds: string[]): Promise<{
        id: string;
    }[]>;
    static updateSkill(skillId: string, skillsName: string, yearsOfExperience: number): Promise<SkillsView>;
    static deleteSkills(skillIds: string[]): Promise<number>;
    static addEducation(candidateId: string, data: AddEducationDto): Promise<CandidateEducationView>;
    static findAllEducations(candidateId: string): Promise<CandidateEducationView[]>;
    static findEducationById(educationId: string): Promise<CandidateEducationView | null>;
    static findEducationBelongToUser(userId: string, educationId: string): Promise<CandidateEducationView | null>;
    static updateEducation(educationId: string, data: UpdateEducationDto): Promise<CandidateEducationView>;
    static deleteEducation(educationId: string): Promise<CandidateEducationView>;
    static addExperience(candidateId: string, data: AddExperienceDto): Promise<CandidateExperienceView>;
    static findAllExperiences(candidateId: string): Promise<CandidateExperienceView[]>;
    static findExperienceById(experienceId: string): Promise<CandidateExperienceView | null>;
    static findExperienceBelongToUser(userId: string, experienceId: string): Promise<CandidateExperienceView | null>;
    static updateExperience(experienceId: string, data: UpdateExperienceDto): Promise<CandidateExperienceView>;
    static deleteExperience(experienceId: string): Promise<CandidateExperienceView>;
    static findProfileByCandidateId(candidateId: string): Promise<({
        skills: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            candidateId: string;
            yearsOfExperience: number | null;
        }[];
        educations: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            collegeName: string;
            degree: string;
            fieldOfStudy: string;
            startDate: Date;
            endDate: Date | null;
            currentlyStudying: boolean;
            gradingSystem: import("@prisma/client").$Enums.GradingSystem;
            gradeText: string | null;
            grade: number | null;
            candidateId: string;
        }[];
        experiences: {
            companyName: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            designation: string;
            location: string | null;
            employmentType: import("@prisma/client").$Enums.EmploymentType;
            startDate: Date;
            endDate: Date | null;
            currentlyWorking: boolean;
            candidateId: string;
        }[];
    } & {
        fullName: string;
        phoneNumber: string | null;
        linkedinUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        profilePicture: string | null;
        headline: string | null;
        bio: string | null;
        dateOfBirth: Date | null;
        gender: import("@prisma/client").$Enums.Gender | null;
        experienceLevel: import("@prisma/client").$Enums.ExperienceLevel | null;
        currentLocation: string | null;
        preferredLocation: string | null;
        currentCompany: string | null;
        currentDesignation: string | null;
        totalExperience: number | null;
        expectedSalary: number | null;
        currentSalary: number | null;
        noticePeriod: number | null;
        githubUrl: string | null;
        portfolioUrl: string | null;
        websiteUrl: string | null;
        isOpenToWork: boolean;
        profileCompletion: number;
    }) | null>;
    static updateCandidateSettings(userId: string, data: Prisma.CandidateUpdateInput): Promise<CandidateProfileView>;
}
//# sourceMappingURL=candidate.repository.d.ts.map