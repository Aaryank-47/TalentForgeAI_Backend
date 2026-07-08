import { z } from "zod";
import { emailValidator, passwordValidator } from "../../../common/validators/validators.js";
export const registerEmployerDto = z.object({
    email: emailValidator,
    password: passwordValidator,
    fullName: z.string().trim().min(1, "Full name is required").max(150),
    companyId: z.string().trim().min(1, "Company ID is required"),
});
//# sourceMappingURL=registerEmployer.dto.js.map