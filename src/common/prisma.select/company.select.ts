export const companySelect = {
    id: true,
    companyName: true,
    slug: true,
    companyEmail: true,
    phoneNumber: true,
    website: true,
    logo: true,
    coverImage: true,
    description: true,
    industry: true,
    companySize: true,
    foundedYear: true,
    headquarters: true,
    linkedinUrl: true,
    twitterUrl: true,
    profileCompletion: true,
    isVerified: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
} as const;

export const companyMemberSelect = {
    id: true,
    userId: true,
    companyId: true,
    role: true,
    status: true,
    joinedAt: true,
    invitedBy: true,
    user: {
        select: {
            email: true,
            employer: {
                select: {
                    fullName: true,
                },
            },
            candidate: {
                select: {
                    fullName: true,
                },
            },
        },
    },
} as const;