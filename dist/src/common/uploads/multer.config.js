import multer from "multer";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "../constants/upload.constants.js";
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
    }
};
export const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter,
});
export const uploadSingleFile = (fieldName) => upload.single(fieldName);
export const uploadMultipleFiles = (fieldName, maxCount) => upload.array(fieldName, maxCount);
export const uploadFields = (fields) => upload.fields(fields);
//# sourceMappingURL=multer.config.js.map