import cloudinary from '../uploads/cloudinary.js';
import { CLOUDINARY_FOLDER, RESOURCE_TYPE_MAP, } from '../constants/upload.constants.js';
export const uploadFileToCloudinary = (file, options = {}) => {
    return new Promise((resolve, reject) => {
        const resourceType = options.resourceType || RESOURCE_TYPE_MAP[file.mimetype] || 'auto';
        const uploadOptions = {
            folder: options.folder || CLOUDINARY_FOLDER,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true,
            ...(options.fileName ? { public_id: options.fileName } : {}),
        };
        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error || !result) {
                return reject(error || new Error('Cloudinary upload failed'));
            }
            resolve({
                url: result.url,
                secureUrl: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                resourceType: result.resource_type,
                bytes: result.bytes,
                originalName: file.originalname,
                createdAt: result.created_at,
            });
        });
        uploadStream.end(file.buffer);
    });
};
export const uploadMultipleFilesToCloudinary = async (files, options = {}) => {
    return Promise.all(files.map((file) => uploadFileToCloudinary(file, options)));
};
//# sourceMappingURL=upload.helper.js.map