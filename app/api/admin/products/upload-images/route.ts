import { NextRequest, NextResponse } from 'next/server';
import { createAuthMiddleware } from '@/lib/auth/middleware';
import { cloudinaryService } from '@/lib/services';

const authMiddleware = createAuthMiddleware({
  required: true,
  roles: ['admin']
});

async function handler(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const images = formData.getAll('images') as File[];

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Validate images
    for (let i = 0; i < images.length; i++) {
      const validation = cloudinaryService.validateImageFile(images[i]);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: `Image ${i + 1}: ${validation.errors.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const imageUrls: string[] = [];

    try {
      // Upload images to Cloudinary
      for (const image of images) {
        const dataUrl = await cloudinaryService.fileToDataUrl(image);
        const uploadResult = await cloudinaryService.uploadImage(dataUrl, {
          folder: 'papad-store/products',
          quality: 'auto:good',
          format: 'webp'
        });
        imageUrls.push(uploadResult.secureUrl);
      }
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload images. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${imageUrls.length} image(s)`,
      imageUrls
    });

  } catch (error) {
    console.error('Upload images error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = (request: NextRequest) => authMiddleware(request, handler);