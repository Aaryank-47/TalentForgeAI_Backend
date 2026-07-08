import cloudinary from '../uploads/cloudinary.js';
export const deleteFileFromCloudinary = async (options) => {
    const { publicId, resourceType = 'image' } = options;
    const response = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
    });
    return {
        result: response.result,
        publicId,
    };
};
export const deleteMultipleFilesFromCloudinary = async (items) => {
    return Promise.all(items.map((item) => deleteFileFromCloudinary(item)));
};
//# sourceMappingURL=delete.helper.js.map