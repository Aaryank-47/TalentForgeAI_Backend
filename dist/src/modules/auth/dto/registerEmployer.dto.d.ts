import { z } from "zod";
export declare const registerEmployerDto: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    fullName: z.ZodString;
    companyId: z.ZodString;
}, z.core.$strip>;
export type RegisterEmployerDto = z.infer<typeof registerEmployerDto>;
//# sourceMappingURL=registerEmployer.dto.d.ts.map