import { z } from "zod";
import { questionIdValidator } from "../../../common/validators/validators.js";
export const applicationIdParamSchema = z.object({
    applicationId: questionIdValidator
});
//# sourceMappingURL=atsIntegration.dto.js.map