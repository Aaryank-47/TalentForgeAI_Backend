export interface EmployerCompanyInput {
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

export interface EmployerCompanyView {
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

export interface EmployerProfileView {
    id: string;
    userId: string;
    fullName: string;
    phone: string | null;
    designation: string | null;
    department: string | null;
    profilePicture: string | null;
    linkedinUrl: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}