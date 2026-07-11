import { z } from "zod";
import {
    companyNameValidator,
    companyEmailValidator,
    companyWebsiteValidator,
    companyPhoneNumberValidator,
    companyIdValidator
} from "../../../common/validators/validators.js";

export const createCompanyDto = z.object({
    companyName: companyNameValidator,
    companyEmail: companyEmailValidator.optional(),
    website: companyWebsiteValidator.optional(),
    phoneNumber: companyPhoneNumberValidator.optional(),
});

export type CreateCompanyDto = z.infer<typeof createCompanyDto>;

export const companyIdParamDto = z.object({
    companyId: companyIdValidator,
});

export type CompanyIdParamDto = z.infer<typeof companyIdParamDto>;