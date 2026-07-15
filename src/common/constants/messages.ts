export const MESSAGE = {

    // General
    SUCCESS: "Operation completed successfully.",
    SERVER_ERROR: "Internal Server Error.",
    ROUTE_NOT_FOUND: "Route not found.",

    // Authentication
    LOGIN_SUCCESS: "Login successful.",
    LOGOUT_SUCCESS: "Logout successful.",
    REGISTER_SUCCESS: "Registration successful. Please verify your email.",

    // Email Verification
    EMAIL_VERIFY_SUCCESS: "Email verified successfully.",
    EMAIL_ALREADY_VERIFIED: "Email already verified.",
    EMAIL_NOT_VERIFIED: "Please verify your email before logging in.",
    VERIFICATION_EMAIL_SENT: "Verification email sent successfully.",

    INVALID_CREDENTIALS: "Invalid email or password.",
    UNAUTHORIZED: "Unauthorized access.",
    ACCESS_DENIED: "Access denied.",

    TOKEN_EXPIRED: "Token has expired.",
    INVALID_TOKEN: "Invalid token.",

    // User
    USER_CREATED: "User created successfully.",
    USER_UPDATED: "User updated successfully.",
    USER_DELETED: "User deleted successfully.",
    USER_NOT_FOUND: "User not found.",

    // Validation
    VALIDATION_FAILED: "Validation failed.",

    // Company
    COMPANY_DETAILS_FETCHED: "Company details fetched successfully.",
    COMPANIES_FETCHED: "Companies fetched successfully.",
    COMPANY_CREATED: "Company created successfully.",
    COMPANY_UPDATED: "Company updated successfully.",
    COMPANY_NOT_FOUND: "Company not found.",
    COMPANY_DELETED: "Company deleted successfully.",
    COMPANY_INVITATION_SENT: "Company invitation sent successfully.",
    COMPANY_INVITATION_FETCHED: "Company invitation fetched successfully.",
    COMPANY_INVITATION_ACCEPTED: "Company invitation accepted successfully.",
    COMPANY_MEMBERS_FETCHED: "Company members fetched successfully.",
    COMPANY_MEMBER_ROLE_UPDATED:"Role Updated Successfully",
    COMPANY_MEMBER_REMOVED:"Removed Company Member",
    COMPANY_LOGO_UPLOADED: "Company logo uploaded successfully.",
    COMPANY_COVER_UPLOADED: "Company cover image uploaded successfully.",
    COMPANY_SEARCH_SUCCESS: "Companies fetched successfully.",

    // Job
    JOB_CREATED: "Job created successfully.",
    JOB_UPDATED: "Job updated successfully.",
    JOB_DELETED: "Job deleted successfully.",
    JOB_NOT_FOUND: "Job not found."
} as const;