export interface RecruiterCompanyInput {
    name: string;
    slug?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    website?: string | undefined;
    logo?: string | undefined;
    coverImage?: string | undefined;
    description?: string | undefined;
    industry?: string | undefined;
    companySize?: string | undefined;
    foundedYear?: number | undefined;
    headquarters?: string | undefined;
    linkedinUrl?: string | undefined;
    twitterUrl?: string | undefined;
}
export interface RecruiterCompanyView {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    website: string | null;
    logo: string | null;
    coverImage: string | null;
    description: string | null;
    industry: string | null;
    companySize: string | null;
    foundedYear: number | null;
    headquarters: string | null;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface RecruiterProfileView {
    id: string;
    userId: string;
    companyId: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    designation: string | null;
    department: string | null;
    profilePicture: string | null;
    linkedinUrl: string | null;
    isPrimaryRecruiter: boolean;
    canCreateJobs: boolean;
    canEditJobs: boolean;
    canDeleteJobs: boolean;
    canScheduleInterview: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=recruiter.interface.d.ts.map