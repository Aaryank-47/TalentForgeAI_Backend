import slugify from "slugify";
import crypto from "crypto";
import { JobStatus } from "@prisma/client";
export class SlugHelper {
    static generateUniqueJobSlug(title, companyName) {
        const base = slugify(`${companyName} ${title}`, {
            lower: true,
            strict: true,
            trim: true,
        });
        const suffix = crypto
            .randomBytes(2)
            .toString("hex");
        return `${base}-${suffix}`;
    }
}
export function toJobView(job, author, companyMemberRole) {
    return {
        id: job.id,
        companyId: job.companyId,
        title: job.title,
        description: job.description,
        employmentType: job.employmentType,
        workplaceType: job.workplaceType,
        location: job.location ?? "",
        minExperience: job.minExperience,
        maxExperience: job.maxExperience,
        minimumSalary: job.minimumSalary ?? 0,
        maximumSalary: job.maximumSalary ?? 0,
        salaryPeriod: job.salaryPeriod,
        hideSalary: job.hideSalary,
        applicationDeadline: job.applicationDeadline,
        skills: job.skills ?? [],
        benefits: job.benefits ?? [],
        isPublished: job.status === JobStatus.PUBLISHED,
        companyMemberRole,
        author,
    };
}
//# sourceMappingURL=jobs.utils.js.map