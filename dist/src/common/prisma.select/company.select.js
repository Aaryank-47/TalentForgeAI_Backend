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
    verifiedAt: true,
    verifiedBy: true,
    deletedAt: true,
    suspendedAt: true,
    suspendedBy: true,
    suspendedReason: true,
    restoredAt: true,
    restoredBy: true,
    createdAt: true,
    updatedAt: true,
};
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
};
export const companyInvitationSelect = {
    user: {
        select: {
            id: true,
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
};
export const invitationSelect = {
    id: true,
    userId: true,
    companyId: true,
    role: true,
    status: true,
    invitedBy: true,
    invitedAt: true,
    expiresAt: true,
    invitationToken: true,
    joinedAt: true,
};
//# sourceMappingURL=company.select.js.map