import { Cloudinary } from '@cloudinary/url-gen';

// Get configuration from environment variables
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dc09vfass';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'oro-digital-image';

// Cloudinary configuration
export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: CLOUD_NAME
  }
});

// Upload preset for unsigned uploads
export { UPLOAD_PRESET };

// Cloudinary upload function
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', CLOUD_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
}) => {
  const { width = 800, height = 600, quality = 'auto', format = 'auto' } = options || {};
  
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},h_${height},c_fill,q_${quality},f_${format}/${publicId}`;
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string => {
  const matches = url.match(/\/v\d+\/(.+)\./);
  return matches ? matches[1] : '';
};