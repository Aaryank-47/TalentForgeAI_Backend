export declare const companySelect: {
    readonly id: true;
    readonly companyName: true;
    readonly slug: true;
    readonly companyEmail: true;
    readonly phoneNumber: true;
    readonly website: true;
    readonly logo: true;
    readonly coverImage: true;
    readonly description: true;
    readonly industry: true;
    readonly companySize: true;
    readonly foundedYear: true;
    readonly headquarters: true;
    readonly linkedinUrl: true;
    readonly twitterUrl: true;
    readonly profileCompletion: true;
    readonly isVerified: true;
    readonly verifiedAt: true;
    readonly verifiedBy: true;
    readonly deletedAt: true;
    readonly suspendedAt: true;
    readonly suspendedBy: true;
    readonly suspendedReason: true;
    readonly restoredAt: true;
    readonly restoredBy: true;
    readonly createdAt: true;
    readonly updatedAt: true;
};
export declare const companyMemberSelect: {
    readonly id: true;
    readonly userId: true;
    readonly companyId: true;
    readonly role: true;
    readonly status: true;
    readonly joinedAt: true;
    readonly invitedBy: true;
    readonly user: {
        readonly select: {
            readonly email: true;
            readonly employer: {
                readonly select: {
                    readonly fullName: true;
                };
            };
            readonly candidate: {
                readonly select: {
                    readonly fullName: true;
                };
            };
        };
    };
};
export declare const companyInvitationSelect: {
    readonly user: {
        readonly select: {
            readonly id: true;
            readonly email: true;
            readonly employer: {
                readonly select: {
                    readonly fullName: true;
                };
            };
            readonly candidate: {
                readonly select: {
                    readonly fullName: true;
                };
            };
        };
    };
};
export declare const invitationSelect: {
    readonly id: true;
    readonly userId: true;
    readonly companyId: true;
    readonly role: true;
    readonly status: true;
    readonly invitedBy: true;
    readonly invitedAt: true;
    readonly expiresAt: true;
    readonly invitationToken: true;
    readonly joinedAt: true;
};
//# sourceMappingURL=company.select.d.ts.map