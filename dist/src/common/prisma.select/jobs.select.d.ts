export declare const JobSelect: {
    readonly id: true;
    readonly companyId: true;
    readonly title: true;
    readonly slug: true;
    readonly summary: true;
    readonly description: true;
    readonly employmentType: true;
    readonly workplaceType: true;
    readonly status: true;
    readonly visibility: true;
    readonly vacancies: true;
    readonly location: true;
    readonly minExperience: true;
    readonly maxExperience: true;
    readonly minimumSalary: true;
    readonly maximumSalary: true;
    readonly salaryPeriod: true;
    readonly hideSalary: true;
    readonly applicationDeadline: true;
    readonly publishedAt: true;
    readonly closedAt: true;
    readonly archivedAt: true;
    readonly createdById: true;
    readonly updatedById: true;
    readonly createdAt: true;
    readonly updatedAt: true;
    readonly skills: {
        readonly select: {
            readonly id: true;
            readonly name: true;
            readonly isRequired: true;
        };
    };
    readonly benefits: {
        readonly select: {
            readonly id: true;
            readonly benefit: true;
        };
    };
};
//# sourceMappingURL=jobs.select.d.ts.map