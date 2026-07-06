import cloudinary from '../uploads/cloudinary.js';
import type { DeleteFileOptions, DeleteResult } from '../uploads/upload.interface.js';


export const deleteFileFromCloudinary = async (
  options: DeleteFileOptions,
): Promise<DeleteResult> => {
  const { publicId, resourceType = 'image' } = options;

  const response = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });

  return {
    result: response.result,
    publicId,
  };
};


export const deleteMultipleFilesFromCloudinary = async (
  items: DeleteFileOptions[],
): Promise<DeleteResult[]> => {
  return Promise.all(items.map((item) => deleteFileFromCloudinary(item)));
};