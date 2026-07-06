import multer from "multer";
import type { Request } from "express";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "./upload.constants.js";

const storage = multer.memoryStorage();

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Unsupported file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
            ),
        );
    }
};

export const upload = multer ({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter,
})

export const uploadSingleFile = (fieldName: string) => upload.single(fieldName);
export const uploadMultipleFiles = (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount);
export const uploadFields = (fields: { name: string; maxCount?: number }[]) => upload.fields(fields);