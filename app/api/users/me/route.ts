import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { cloudinaryService } from '@/lib/services';

export async function GET(request: NextRequest) {
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

    // Find user
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Account not verified' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get user profile error:', error);

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

export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { name, profilePicture } = body;

    // Validate name
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Name must be at least 2 characters long' },
          { status: 400 }
        );
      }

      if (name.trim().length > 50) {
        return NextResponse.json(
          { error: 'Name cannot exceed 50 characters' },
          { status: 400 }
        );
      }
    }

    // Validate profile picture URL if provided
    if (profilePicture !== undefined && profilePicture !== null && profilePicture !== '') {
      if (typeof profilePicture !== 'string' || 
          !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(profilePicture)) {
        return NextResponse.json(
          { error: 'Profile picture must be a valid image URL' },
          { status: 400 }
        );
      }
    }

    // Prepare update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture || null;

    // Get current user to check for existing profile picture
    const currentUser = await User.findById(decoded.userId).select('profilePicture');
    const oldProfilePicture = currentUser?.profilePicture;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete old profile picture from Cloudinary if it exists and is different from new one
    if (oldProfilePicture && 
        profilePicture !== undefined && 
        oldProfilePicture !== profilePicture &&
        oldProfilePicture.includes('cloudinary.com')) {
      try {
        const publicId = cloudinaryService.extractPublicId(oldProfilePicture);
        if (publicId) {
          await cloudinaryService.deleteImage(publicId);
        }
      } catch (deleteError) {
        console.error('Failed to delete old profile picture:', deleteError);
        // Continue with update even if image deletion fails
      }
    }

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Update user profile error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: errors 
        },
        { status: 400 }
      );
    }

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