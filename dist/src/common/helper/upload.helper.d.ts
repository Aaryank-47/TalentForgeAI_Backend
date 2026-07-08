import type { UploadedFileResult, UploadOptions } from '../uploads/upload.interface.js';
export declare const uploadFileToCloudinary: (file: Express.Multer.File, options?: UploadOptions) => Promise<UploadedFileResult>;
export declare const uploadMultipleFilesToCloudinary: (files: Express.Multer.File[], options?: UploadOptions) => Promise<UploadedFileResult[]>;
//# sourceMappingURL=upload.helper.d.ts.map