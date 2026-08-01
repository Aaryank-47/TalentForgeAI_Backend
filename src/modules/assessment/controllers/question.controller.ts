import type { Request, Response } from "express";
import type { CreateQuestionCategoryDto } from "../dto/question.dto.js";
import { QuestionService } from "../services/question.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";

export class QuestionController {
    static createCategory = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as CreateQuestionCategoryDto;

            const category = await QuestionService.createQueCategory(dto.name, dto.parentId);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: MESSAGE.CATEGORY_CREATED,
                data: category,
            });
        }
    );
    
    static getAllQueCategories = asyncHandler(
        async (req: Request, res: Response) => {
            
            const result = await QuestionService.getAllQueCategories(req.query);
            
            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: MESSAGE.CATEGORY_FETCHED,
                data: result,
            })
        }
    );
}
