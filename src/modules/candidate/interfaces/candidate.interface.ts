import type { ExperienceLevel, Gender, GradingSystem } from "@prisma/client";

export interface CandidateProfileView {
    id: string;
    userId: string;
    fullName: string;
    phoneNumber: string | null;
    profilePicture: string | null;
    headline: string | null;
    bio: string | null;
    gender: Gender | null;
    experienceLevel: ExperienceLevel | null;
    currentLocation: string | null;
    preferredLocation: string | null;
    currentCompany: string | null;
    currentDesignation: string | null;
    totalExperience: number | null;
    expectedSalary: number | null;
    currentSalary: number | null;
    noticePeriod: number | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
    websiteUrl: string | null;
    isOpenToWork: boolean;
    profileCompletion: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CandidateWithRelationsCount {
    fullName: string;
    phoneNumber: string | null;
    profilePicture: string | null;
    headline: string | null;
    bio: string | null;
    currentLocation: string | null;
    isOpenToWork: boolean;
    _count: {
        skills: number;
        educations: number;
        experiences: number;
    };
}

export interface ResumeView {
    id: string,
    resumeName: string,
    resumeUrl: string,
    fileSize: number,
    uploadedAt: Date
}

export interface SkillsView {
    id: string;
    name: string;
    yearsOfExperience: number | null;
    candidateId: string;
}

export interface CandidateEducationView {
    id: string;
    candidateId: string;
    collegeName: string;
    degree: string;
    fieldOfStudy: string;
    currentlyStudying: boolean;
    startDate: Date;
    endDate: Date | null;
    gradingSystem: GradingSystem;
    gradeText: string | null;
    grade: number | null;
    createdAt: Date;
    updatedAt: Date;
}

