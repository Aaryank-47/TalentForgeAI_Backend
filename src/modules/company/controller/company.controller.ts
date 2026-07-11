import type { Request, Response } from "express";
import type { CreateCompanyDto } from "../dto/company.dto.js";
import { CompanyService } from "../services/company.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";

export class CompanyController {
    static createCompany = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as CreateCompanyDto;
            const userId = req.user.id;

            const company = await CompanyService.createCompany(dto, userId);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: MESSAGE.COMPANY_CREATED,
                data: company,
            });
        }
    );

    static getMyCompanies = asyncHandler(
        async ( req: Request, res: Response) =>{
            const userId = req.user.id;

            const companies = await CompanyService.getMyCompanies(userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANIES_FETCHED,
                data: companies,
            });
        }
    )
}