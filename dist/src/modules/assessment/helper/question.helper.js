import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { QuestionRepository } from "../repositories/question.repository.js";
export function normalizeName(name) {
    return name.toLowerCase().replace(/[\s\-_]+/g, "");
}
export async function validateQuestionAccess(question, user, action) {
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
        const membership = await QuestionRepository.findCompanyMember(user.id, question.companyId);
        if (!membership) {
            throw new ForbiddenError("You do not have access to this company's questions");
        }
        return membership.id;
    }
    return null;
}
//# sourceMappingURL=question.helper.js.map