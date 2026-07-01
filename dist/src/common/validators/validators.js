import { z } from "zod";
export const emailValidator = z
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase();
export const passwordValidator = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password must be at most 64 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=[\]{};':"\\|,.<>/?]).+$/, "Password must contain uppercase, lowercase, number and special character.");
export const uuidValidator = z.uuid("Please enter a valid UUID");
//# sourceMappingURL=validators.js.map