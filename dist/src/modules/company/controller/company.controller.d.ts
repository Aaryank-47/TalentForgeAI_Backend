export declare class CompanyController {
    static createCompany: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    static getMyCompanies: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    static getCompanyDetails: import("express").RequestHandler<{
        companyId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static updateCompanyProfile: import("express").RequestHandler<{
        companyId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static deleteCompanyProfile: import("express").RequestHandler<{
        companyId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static sendInvitation: import("express").RequestHandler<{
        inviterId: string;
        inviteeEmail: string;
        role: "ADMIN" | "OWNER" | "RECRUITER" | "HIRING_MANAGER";
    } & {
        companyId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static getInvitation: import("express").RequestHandler<{
        token: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static acceptOrRejectInvitation: import("express").RequestHandler<{
        token: string;
        action: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static listAllCompanyMembers: import("express").RequestHandler<{
        companyId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static updateCompanyMemberRole: import("express").RequestHandler<{
        role: "ADMIN" | "OWNER" | "RECRUITER" | "HIRING_MANAGER";
    } & {
        companyId: string;
        userId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static removeCompanyMember: import("express").RequestHandler<{
        userIds: string[];
    } & {
        companyId: string;
        userId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static uploadLogo: import("express").RequestHandler<{
        companyId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static uploadCoverImage: import("express").RequestHandler<{
        companyId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static searchCompanies: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    static verifyCompany: import("express").RequestHandler<{
        companyId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static suspendCompany: import("express").RequestHandler<{
        companyId: string;
    }, any, {
        reason: string;
    }, import("qs").ParsedQs, Record<string, any>>;
    static restoreCompany: import("express").RequestHandler<{
        companyId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static getAllCompanies: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    static listAllInvitations: import("express").RequestHandler<{
        companyId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static cancelInvitation: import("express").RequestHandler<{
        invitationId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static resendInvitation: import("express").RequestHandler<{
        invitationId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static deactivateCompany: import("express").RequestHandler<{
        companyId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
    static activateCompany: import("express").RequestHandler<{
        companyId: string;
    }, any, any, import("qs").ParsedQs, Record<string, any>>;
}
//# sourceMappingURL=company.controller.d.ts.map