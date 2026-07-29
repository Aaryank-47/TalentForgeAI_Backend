import { z } from "zod";
export declare class RegisterEmployerDto {
    static registerEmployer: z.ZodObject<{
        email: z.ZodEmail;
        password: z.ZodString;
        fullName: z.ZodString;
        companyId: z.ZodString;
    }, z.core.$strip>;
}
export type RegisterEmployerDtoType = z.infer<typeof RegisterEmployerDto.registerEmployer>;
//# sourceMappingURL=registerEmployer.dto.d.ts.map