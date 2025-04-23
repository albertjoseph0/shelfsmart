import { NextRequest, NextResponse } from 'next/server';
import { processBase64Image } from '../../../lib/upload';
import { auth } from '@clerk/nextjs/server';
import { getUserUploadLimit, getUserImageCount } from './limitUtils';

// POST /api/upload - Process a bookshelf image
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Validate base64 string
    const base64Pattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
    if (typeof image !== 'string' || !base64Pattern.test(image)) {
      return NextResponse.json(
        { error: 'Invalid image format. Must be base64-encoded image.' },
        { status: 400 }
      );
    }
    // Check decoded size (max 10MB)
    const base64Data = image.split(',')[1];
    const decodedSize = Math.ceil((base64Data.length * 3) / 4); // rough estimate
    if (decodedSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Enforce backend upload limit
    const [{ limit }, imageCount] = await Promise.all([
      getUserUploadLimit(userId),
      getUserImageCount(userId)
    ]);
    if (imageCount >= limit) {
      return NextResponse.json(
        { error: "You’ve reached your upload limit. Upgrade your plan to upload more photos." },
        { status: 403 }
      );
    }
    
    // Process the image and get a unique ID
    const imageId = await processBase64Image(image);
    
    // Optionally: associate the imageId with userId in the DB for tracking/limiting
    // (Implementation can be added later if needed)

    // Return both the ID and the original base64 data
    return NextResponse.json({ 
      imageId, 
      imageData: image 
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
} 