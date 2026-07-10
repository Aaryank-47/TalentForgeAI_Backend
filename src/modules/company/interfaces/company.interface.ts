export interface CreateCompanyInput {
    userId: string;
    companyName: string;
    slug: string;
    companyEmail?: string | undefined;
    website?: string | undefined;
    phoneNumber?: string | undefined;
}