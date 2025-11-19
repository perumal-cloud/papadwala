import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { cloudinaryService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = TokenUtils.verifyAccessToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get current user to check for existing profile picture
    const currentUser = await User.findById(decoded.userId).select('profilePicture');
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate image
    const validation = cloudinaryService.validateImageFile(image);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    try {
      // Upload new image to Cloudinary
      const dataUrl = await cloudinaryService.fileToDataUrl(image);
      const uploadResult = await cloudinaryService.uploadImage(dataUrl, {
        folder: 'papad-store/profiles',
        quality: 'auto:good',
        format: 'webp',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto:good' }
        ]
      });

      // Delete old profile picture if it exists and is from Cloudinary
      if (currentUser.profilePicture && currentUser.profilePicture.includes('cloudinary.com')) {
        try {
          const publicId = cloudinaryService.extractPublicId(currentUser.profilePicture);
          if (publicId) {
            await cloudinaryService.deleteImage(publicId);
          }
        } catch (deleteError) {
          console.error('Failed to delete old profile picture:', deleteError);
          // Continue with upload even if old image deletion fails
        }
      }

      return NextResponse.json(
        { 
          message: 'Profile image uploaded successfully',
          imageUrl: uploadResult.secureUrl
        },
        { status: 200 }
      );

    } catch (uploadError) {
      console.error('Profile image upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload profile image. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Profile image upload error:', error);
    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message 
      },
      { status: 500 }
    );
  }
}