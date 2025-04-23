import { v4 as uuidv4 } from 'uuid';

/**
 * Process a base64 encoded image without saving it to disk
 * @param base64Image - The base64 encoded image data
 * @returns A unique identifier for the image data
 */
export async function processBase64Image(base64Image: string): Promise<string> {
  // Validate the base64 image format
  const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image format');
  }
  
  // Generate a unique ID for this image
  const imageId = uuidv4();
  
  // Return the image ID and the base64 data
  return imageId;
}

/**
 * Get the full data URL for a base64 image
 * @param base64Image - The base64 encoded image data
 * @returns The validated base64 image data
 */
export function getBase64ImageData(base64Image: string): string {
  return base64Image;
}

// For backward compatibility
export function getImageUrl(imageData: string): string {
  // If it's already a base64 image, return as is
  if (imageData.startsWith('data:image')) {
    return imageData;
  }
  
  // If we're dealing with a legacy path-based reference
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${baseUrl}${imageData}`;
}

// Alias for backward compatibility
export const saveBase64Image = processBase64Image; 