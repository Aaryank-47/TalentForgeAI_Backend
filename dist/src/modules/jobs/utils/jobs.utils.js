import slugify from "slugify";
import crypto from "crypto";
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
//# sourceMappingURL=jobs.utils.js.map