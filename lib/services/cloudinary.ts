import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  // Upload image to Cloudinary
  async uploadImage(
    file: Buffer | string,
    options: {
      folder?: string;
      publicId?: string;
      transformation?: any;
      format?: string;
      quality?: string | number;
    } = {}
  ): Promise<{
    url: string;
    secureUrl: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  }> {
    try {
      const uploadOptions = {
        folder: options.folder || 'papad-store',
        public_id: options.publicId,
        transformation: options.transformation || [
          { width: 800, height: 800, crop: 'limit' },
          { quality: options.quality || 'auto:good' },
          { format: options.format || 'webp' }
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        ...options
      };

      const result = await cloudinary.uploader.upload(file as string, uploadOptions);

      return {
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      };
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  // Upload multiple images
  async uploadMultipleImages(
    files: (Buffer | string)[],
    options: {
      folder?: string;
      publicId?: string;
      transformation?: any;
      format?: string;
      quality?: string | number;
    } = {}
  ): Promise<Array<{
    url: string;
    secureUrl: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  }>> {
    try {
      const uploadPromises = files.map((file, index) => 
        this.uploadImage(file, {
          ...options,
          publicId: options.publicId ? `${options.publicId}_${index}` : undefined
        })
      );

      return await Promise.all(uploadPromises);
    } catch (error: any) {
      console.error('Multiple image upload error:', error);
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  }

  // Delete image from Cloudinary
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  // Delete multiple images
  async deleteMultipleImages(publicIds: string[]): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error: any) {
      console.error('Multiple image delete error:', error);
      throw new Error(`Failed to delete images: ${error.message}`);
    }
  }

  // Generate optimized image URL
  generateOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
    } = {}
  ): string {
    try {
      return cloudinary.url(publicId, {
        transformation: [
          {
            width: options.width,
            height: options.height,
            crop: options.crop || 'fill',
            quality: options.quality || 'auto:good',
            format: options.format || 'webp'
          }
        ]
      });
    } catch (error: any) {
      console.error('URL generation error:', error);
      throw new Error(`Failed to generate optimized URL: ${error.message}`);
    }
  }

  // Get image details
  async getImageDetails(publicId: string): Promise<any> {
    try {
      return await cloudinary.api.resource(publicId);
    } catch (error: any) {
      console.error('Get image details error:', error);
      throw new Error(`Failed to get image details: ${error.message}`);
    }
  }

  // Validate image file
  validateImageFile(file: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
    }

    // Check file name
    if (!file.name || file.name.length === 0) {
      errors.push('File name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert File to buffer for server-side upload
  async fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Convert File to base64 data URL for server-side upload
  async fileToDataUrl(file: File): Promise<string> {
    try {
      const buffer = await this.fileToBuffer(file);
      const base64 = buffer.toString('base64');
      const mimeType = file.type || 'image/jpeg';
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      throw new Error('Failed to convert file to data URL');
    }
  }

  // Extract public ID from Cloudinary URL
  extractPublicId(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex === -1) return null;
      
      // Get the part after version (if exists) or after upload
      let pathStart = uploadIndex + 1;
      if (urlParts[pathStart] && urlParts[pathStart].startsWith('v')) {
        pathStart += 1;
      }
      
      const pathParts = urlParts.slice(pathStart);
      const fullPath = pathParts.join('/');
      
      // Remove file extension
      return fullPath.replace(/\.[^.]+$/, '');
    } catch (error) {
      return null;
    }
  }

  // Create product image transformations
  getProductImageTransformations() {
    return {
      thumbnail: [
        { width: 150, height: 150, crop: 'fill' },
        { quality: 'auto:good' },
        { format: 'webp' }
      ],
      medium: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto:good' },
        { format: 'webp' }
      ],
      large: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'webp' }
      ]
    };
  }

  // Test Cloudinary configuration
  async testConnection(): Promise<boolean> {
    try {
      await cloudinary.api.ping();
      return true;
    } catch (error) {
      console.error('Cloudinary connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();