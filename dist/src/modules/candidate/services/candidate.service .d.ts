import type { CandidateProfileView, ResumeView, SkillsView, CandidateEducationView, CandidateExperienceView } from "../interfaces/candidate.interface.js";
import type { UpdateCandidateProfileDto, SingleSkillDto, AddEducationDto, UpdateEducationDto, AddExperienceDto, UpdateExperienceDto, UpdateSalaryPreferencesDto, UpdateLocationPreferencesDto } from "../dto/candidate.dto.js";
import type { Resume } from "@prisma/client";
export declare class CandidateService {
    static getCandidateProfile(candidateId: string): Promise<CandidateProfileView>;
    static updateProfile(candidateId: string, updateData: UpdateCandidateProfileDto): Promise<CandidateProfileView>;
    static calculateProfileCompletion(candidateId: string): Promise<number>;
    static uploadResume(candidateId: string, resumeData: {
        resumeUrl: string;
        resumeName: string;
        fileSize: number;
    }): Promise<Resume>;
    static getResumes(candidateId: string): Promise<ResumeView[]>;
    static getResumeById(resumeId: string, candidateId: string): Promise<Resume>;
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
    }>;
    static getCandidateResumes(candidateId: string, loggedInUser: {
        id: string;
        role: string;
    }): Promise<ResumeView[]>;
    static toggleOpenToWork(userId: string, isOpenToWork: boolean): Promise<CandidateProfileView>;
    static updateSalaryPreferences(userId: string, data: UpdateSalaryPreferencesDto): Promise<CandidateProfileView>;
    static updateLocationPreferences(userId: string, data: UpdateLocationPreferencesDto): Promise<CandidateProfileView>;
}
//# sourceMappingURL=candidate.service%20.d.ts.map