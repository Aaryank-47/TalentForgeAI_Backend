import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { QuestionRepository } from "../repositories/question.repository.js";

export function normalizeName(name: string): string {
    return name.toLowerCase().replace(/[\s\-_]+/g, "");
}

export async function validateQuestionAccess(
    question: any,
    user: any,
    action: "read" | "write"
): Promise<string | null> {
    if (question.ownership === "GLOBAL") {
        if (action === "write") {
            if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
                throw new ForbiddenError("Only platform administrators can modify global questions");
            }
        }
        return null;
    }

    if (question.ownership === "COMPANY") {
        if (!question.companyId) {
            throw new ConflictError("Company question must have a company ID");
        }
        if (action === "write") {
            const membership = await QuestionRepository.findCompanyMember(user.id, question.companyId);
            if (!membership) {
                throw new ForbiddenError("You do not have access to modify this company's questions");
            }
            return membership.id;
        }
        // Reading questions is allowed for all authenticated users so questions across companies can be used in assessments
        return null;
    }
    return null;
}
