import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { createCompanyDto } from "../validators/company.validators.js";
import { CompanyController } from "../controller/company.controller.js";

const router = Router();

router.post(
    "/register",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(createCompanyDto, "body"),
    CompanyController.createCompany
);

export default router;