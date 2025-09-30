// VIP File Upload Service
// Handles uploading VIP ID files to Supabase Storage

import { supabase } from '../lib/supabase';

export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class VipFileUploadService {
  private static readonly BUCKET_NAME = 'vip-id-files';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf'
  ];

  /**
   * Upload a VIP ID file to Supabase Storage
   */
  static async uploadFile(
    file: File, 
    vipUniqueId: string, 
    fileType: 'student_id' | 'senior_id' | 'pwd_id' | 'verification_id'
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      const validationResult = this.validateFile(file);
      if (!validationResult.success) {
        return validationResult;
      }

      // Check if bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('Error checking buckets:', bucketError);
        // Fallback: create a data URL for now
        return this.createDataUrl(file);
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        console.warn(`Storage bucket '${this.BUCKET_NAME}' does not exist. Creating data URL instead.`);
        return this.createDataUrl(file);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${vipUniqueId}/${fileType}_${timestamp}.${fileExtension}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        // Fallback: create a data URL for now
        return this.createDataUrl(file);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return {
        success: true,
        url: urlData.publicUrl
      };

    } catch (error) {
      console.error('File upload error:', error);
      // Fallback: create a data URL for now
      return this.createDataUrl(file);
    }
  }

  /**
   * Create a data URL as fallback when storage is not available
   */
  private static createDataUrl(file: File): Promise<FileUploadResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          success: true,
          url: reader.result as string
        });
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Delete a VIP ID file from Supabase Storage
   */
  static async deleteFile(fileUrl: string): Promise<FileUploadResult> {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const vipUniqueId = urlParts[urlParts.length - 2];
      const fullPath = `${vipUniqueId}/${fileName}`;

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fullPath]);

      if (error) {
        console.error('Supabase delete error:', error);
        return {
          success: false,
          error: `Delete failed: ${error.message}`
        };
      }

      return { success: true };

    } catch (error) {
      console.error('File delete error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during deletion'
      };
    }
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): FileUploadResult {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`
      };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'File type not allowed. Please upload JPEG, PNG, or PDF files'
      };
    }

    return { success: true };
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Check if file is an image
   */
  static isImageFile(filename: string): boolean {
    const extension = this.getFileExtension(filename);
    return ['jpg', 'jpeg', 'png'].includes(extension);
  }

  /**
   * Check if file is a PDF
   */
  static isPdfFile(filename: string): boolean {
    const extension = this.getFileExtension(filename);
    return extension === 'pdf';
  }
}
