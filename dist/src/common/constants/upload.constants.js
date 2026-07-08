export const ALLOWED_MIME_TYPES = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Video (optional)
    'video/mp4',
    'video/quicktime',
];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const CLOUDINARY_FOLDER = 'uploads';
export const RESOURCE_TYPE_MAP = {
    'image/jpeg': 'image',
    'image/jpg': 'image',
    'image/png': 'image',
    'image/webp': 'image',
    'image/gif': 'image',
    'image/svg+xml': 'image',
    'application/pdf': 'raw',
    'application/msword': 'raw',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'raw',
    'application/vnd.ms-excel': 'raw',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'raw',
    'video/mp4': 'video',
    'video/quicktime': 'video',
};
//# sourceMappingURL=upload.constants.js.map