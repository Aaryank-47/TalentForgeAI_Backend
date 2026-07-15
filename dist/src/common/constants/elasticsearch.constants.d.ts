export declare const ES_INDICES: {
    readonly COMPANIES: "talentforge_companies";
};
export declare const ES_COMPANY_FIELDS: {
    readonly COMPANY_NAME: "companyName";
    readonly INDUSTRY: "industry";
    readonly DESCRIPTION: "description";
    readonly HEADQUARTERS: "headquarters";
    readonly WEBSITE: "website";
};
export declare const ES_COMPANY_BOOSTS: {
    readonly COMPANY_NAME: 5;
    readonly INDUSTRY: 3;
    readonly DESCRIPTION: 2;
    readonly HEADQUARTERS: 2;
    readonly WEBSITE: 1;
};
export declare const ES_MAX_RESULT_WINDOW = 10000;
export declare const ES_COMPANY_MAPPINGS: {
    readonly properties: {
        readonly id: {
            readonly type: "keyword";
        };
        readonly companyName: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly slug: {
            readonly type: "keyword";
        };
        readonly industry: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly description: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly headquarters: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly website: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly companySize: {
            readonly type: "keyword";
        };
        readonly status: {
            readonly type: "keyword";
        };
        readonly visibility: {
            readonly type: "keyword";
        };
        readonly isVerified: {
            readonly type: "boolean";
        };
        readonly profileCompletion: {
            readonly type: "integer";
        };
        readonly logo: {
            readonly type: "keyword";
            readonly index: false;
        };
        readonly coverImage: {
            readonly type: "keyword";
            readonly index: false;
        };
        readonly companyEmail: {
            readonly type: "keyword";
        };
        readonly phoneNumber: {
            readonly type: "keyword";
        };
        readonly foundedYear: {
            readonly type: "integer";
        };
        readonly linkedinUrl: {
            readonly type: "keyword";
            readonly index: false;
        };
        readonly twitterUrl: {
            readonly type: "keyword";
            readonly index: false;
        };
        readonly createdAt: {
            readonly type: "date";
        };
        readonly updatedAt: {
            readonly type: "date";
        };
    };
};
//# sourceMappingURL=elasticsearch.constants.d.ts.map