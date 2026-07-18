import type { CompanyMemberRole } from "@prisma/client";
import type { JobView } from "../interfaces/jobs.interface.js";
import type { AuthUserView } from "../../auth/interfaces/auth.interface.js";
export declare class SlugHelper {
    static generateUniqueJobSlug(title: string, companyName: string): string;
}
export declare function toJobView(job: any, author: AuthUserView, companyMemberRole: CompanyMemberRole): JobView;
//# sourceMappingURL=jobs.utils.d.ts.map