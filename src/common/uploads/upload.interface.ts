export interface UploadedFileResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  resourceType: string;
  bytes: number;
  originalName: string;
  createdAt: string;
}

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  resourceType?: 'image' | 'raw' | 'video' | 'auto';
}

export interface DeleteFileOptions {
  publicId: string;
  resourceType?: 'image' | 'raw' | 'video';
}

export interface DeleteResult {
  result: string;
  publicId: string;
}