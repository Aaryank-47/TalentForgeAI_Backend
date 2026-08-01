import type { Request, Response } from "express";
import type { CreateQuestionCategoryDto, UpdateQuestionCategoryDto } from "../dto/question.dto.js";
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
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.CATEGORY_FETCHED,
                data: result,
            });
        }
    );

    static getCategoryById = asyncHandler(
        async (req: Request, res: Response) => {
            const categoryId = req.params.categoryId as string;
            const category = await QuestionService.getCategoryById(categoryId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.CATEGORY_FETCHED,
                data: category,
            });
        }
    );

    static updateCategory = asyncHandler(
        async (req: Request, res: Response) => {
            const categoryId = req.params.categoryId as string;
            const dto = req.body as UpdateQuestionCategoryDto;

            const category = await QuestionService.updateQueCategory(categoryId, dto);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.CATEGORY_UPDATED,
                data: category,
            });
        }
    );

    static deleteCategory = asyncHandler(
        async (req: Request, res: Response) => {
            const categoryId = req.params.categoryId as string;

            await QuestionService.deleteQueCategory(categoryId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.CATEGORY_DELETED,
            });
        }
    );
}
