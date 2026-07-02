import type { ExperienceLevel, Gender } from "@prisma/client";

export interface CandidateProfileView {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    phone: string | null;
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
    profileCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}