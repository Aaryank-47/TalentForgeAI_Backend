export declare const userSelect: {
    readonly id: true;
    readonly email: true;
    readonly role: true;
    readonly status: true;
    readonly isEmailVerified: true;
    readonly lastLoginAt: true;
    readonly createdAt: true;
    readonly updatedAt: true;
};
export declare const loginUserSelect: {
    readonly id: true;
    readonly email: true;
    readonly password: true;
    readonly role: true;
    readonly status: true;
    readonly isEmailVerified: true;
    readonly lastLoginAt: true;
    readonly createdAt: true;
    readonly updatedAt: true;
    readonly candidate: {
        readonly select: {
            readonly id: true;
            readonly userId: true;
            readonly fullName: true;
            readonly createdAt: true;
            readonly updatedAt: true;
        };
    };
    readonly employer: {
        readonly select: {
            readonly id: true;
            readonly userId: true;
            readonly fullName: true;
            readonly phoneNumber: true;
            readonly designation: true;
            readonly department: true;
            readonly profilePicture: true;
            readonly linkedinUrl: true;
            readonly isActive: true;
            readonly createdAt: true;
            readonly updatedAt: true;
        };
    };
};
//# sourceMappingURL=user.select.d.ts.map