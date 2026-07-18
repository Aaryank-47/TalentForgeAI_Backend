import slugify from "slugify";
import crypto from "crypto";
import type { CompanyMemberRole } from "@prisma/client";
import { JobStatus } from "@prisma/client";
import type { JobView } from "../interfaces/jobs.interface.js";
import type { AuthUserView } from "../../auth/interfaces/auth.interface.js";

export class SlugHelper {

    static generateUniqueJobSlug(
        title: string,
        companyName: string
    ): string {

        const base = slugify(
            `${companyName} ${title}`,
            {
                lower: true,
                strict: true,
                trim: true,
            }
        );

        const suffix = crypto
            .randomBytes(2)
            .toString("hex");

        return `${base}-${suffix}`;
    }

}

export function toJobView(
    job: any,
    author: AuthUserView,
    companyMemberRole: CompanyMemberRole
): JobView {
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
