import type { CandidateProfileView, ResumeView, SkillsView, CandidateEducationView, CandidateExperienceView } from "../interfaces/candidate.interface.js";
import type { UpdateCandidateProfileDto, SingleSkillDto, AddEducationDto, UpdateEducationDto, AddExperienceDto, UpdateExperienceDto, UpdateSalaryPreferencesDto, UpdateLocationPreferencesDto } from "../dto/candidate.dto.js";
import type { Resume } from "@prisma/client";
export declare class CandidateService {
    static createCandidateProfile(userId: string, data: {
        fullName: string;
        phoneNumber?: string;
        headline?: string;
    }): Promise<CandidateProfileView>;
    static getCandidateProfile(candidateId: string): Promise<CandidateProfileView>;
    static updateProfile(candidateId: string, updateData: UpdateCandidateProfileDto): Promise<CandidateProfileView>;
    static calculateProfileCompletion(candidateId: string): Promise<number>;
    static uploadResume(candidateId: string, resumeData: {
        resumeUrl: string;
        resumeName: string;
        fileSize: number;
    }): Promise<Resume>;
    static getResumes(candidateId: string): Promise<ResumeView[]>;
    static getResumeById(resumeId: string, candidateId: string): Promise<Resume & {
        processing?: any;
    }>;
    static retryResumeProcessing(resumeId: string, candidateId: string): Promise<{
        resumeId: string;
        jobId: string;
        status: string;
    }>;
    static deleteResumes(resumeIds: string[], candidateId: string): Promise<void>;
    static addSkills(candidateId: string, skills: SingleSkillDto[]): Promise<SkillsView[]>;
    static getAllSkills(candidateId: string): Promise<SkillsView[]>;
    static updateSkills(candidateId: string, skillId: string, skillName: string, skillExperience: number): Promise<SkillsView>;
    static deleteSkills(candidateId: string, skillIds: string[]): Promise<void>;
    static addEducation(candidateId: string, data: AddEducationDto): Promise<CandidateEducationView>;
    static getEducations(candidateId: string): Promise<CandidateEducationView[]>;
    static getEducationById(educationId: string, candidateId: string): Promise<CandidateEducationView>;
    static updateEducation(candidateId: string, educationId: string, data: UpdateEducationDto): Promise<CandidateEducationView>;
    static deleteEducation(candidateId: string, educationId: string): Promise<CandidateEducationView>;
    static addExperience(candidateId: string, data: AddExperienceDto): Promise<CandidateExperienceView>;
    static getExperiences(candidateId: string): Promise<CandidateExperienceView[]>;
    static getExperienceById(experienceId: string, candidateId: string): Promise<CandidateExperienceView>;
    static updateExperience(candidateId: string, experienceId: string, data: UpdateExperienceDto): Promise<CandidateExperienceView>;
    static deleteExperience(candidateId: string, experienceId: string): Promise<CandidateExperienceView>;
    static getPublicProfile(candidateId: string): Promise<{
        skills: {
            name: string;
            yearsOfExperience: number | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            candidateId: string;
            skillId: string | null;
        }[];
        educations: {
            startDate: Date;
            endDate: Date | null;
            collegeName: string;
            degree: string;
            fieldOfStudy: string;
            currentlyStudying: boolean;
            gradingSystem: import("@prisma/client").$Enums.GradingSystem;
            gradeText: string | null;
            grade: number | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            candidateId: string;
        }[];
        experiences: {
            companyName: string;
            description: string | null;
            designation: string;
            currentlyWorking: boolean;
            employmentType: import("@prisma/client").$Enums.EmploymentType;
            location: string | null;
            startDate: Date;
            endDate: Date | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            candidateId: string;
        }[];
    } & {
        fullName: string;
        phoneNumber: string | null;
        linkedinUrl: string | null;
        currentLocation: string | null;
        githubUrl: string | null;
        portfolioUrl: string | null;
        websiteUrl: string | null;
        headline: string | null;
        bio: string | null;
        currentCompany: string | null;
        currentDesignation: string | null;
        totalExperience: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        profilePicture: string | null;
        dateOfBirth: Date | null;
        gender: import("@prisma/client").$Enums.Gender | null;
        experienceLevel: import("@prisma/client").$Enums.ExperienceLevel | null;
        preferredLocation: string | null;
        expectedSalary: number | null;
        currentSalary: number | null;
        noticePeriod: number | null;
        isOpenToWork: boolean;
        profileCompletion: number;
        profileVersion: number;
    }>;
    static getCandidateResumes(candidateId: string, loggedInUser: {
        id: string;
        role: string;
    }): Promise<ResumeView[]>;
    static toggleOpenToWork(userId: string, isOpenToWork: boolean): Promise<CandidateProfileView>;
    static updateSalaryPreferences(userId: string, data: UpdateSalaryPreferencesDto): Promise<CandidateProfileView>;
    static updateLocationPreferences(userId: string, data: UpdateLocationPreferencesDto): Promise<CandidateProfileView>;
}
//# sourceMappingURL=candidate.service.d.ts.map