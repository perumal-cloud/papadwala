import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/database/connection';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { TokenUtils } from '@/lib/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { error: 'No credential provided' },
        { status: 400 }
      );
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Invalid Google token' },
        { status: 400 }
      );
    }

    const { email, name, picture, email_verified } = payload;

    // Process and validate Google profile picture URL
    let validatedPictureUrl: string | null = null;
    if (picture) {
      console.log('Google profile picture URL:', picture);
      
      try {
        // Clean and validate Google profile picture URL
        const url = new URL(picture);
        
        // Ensure it's from Google's trusted domains
        const allowedGoogleDomains = [
          'lh3.googleusercontent.com',
          'lh4.googleusercontent.com',
          'lh5.googleusercontent.com',
          'lh6.googleusercontent.com',
          'graph.google.com',
          'googleusercontent.com'
        ];
        
        const isGoogleDomain = allowedGoogleDomains.some(domain => 
          url.hostname === domain || url.hostname.endsWith('.' + domain)
        );
        
        if (isGoogleDomain && (url.protocol === 'https:' || url.protocol === 'http:')) {
          // For Google profile pictures, ensure they use HTTPS and optimal size
          validatedPictureUrl = picture.replace('http:', 'https:');
          
          // If it's a Google user content URL, ensure good image quality but smaller size to reduce rate limiting
          if (validatedPictureUrl.includes('googleusercontent.com')) {
            // Remove size parameters and add our preferred smaller size
            validatedPictureUrl = validatedPictureUrl.replace(/=s\d+-c.*$/, '=s200-c');
            validatedPictureUrl = validatedPictureUrl.replace(/=s\d+.*$/, '=s200-c');
            if (!validatedPictureUrl.includes('=s')) {
              validatedPictureUrl += '=s200-c';
            }
          }
          
          console.log('Validated profile picture URL:', validatedPictureUrl);
        } else {
          console.log('Profile picture URL not from trusted Google domain, skipping');
          validatedPictureUrl = null;
        }
      } catch (urlError) {
        console.error('Invalid profile picture URL format:', picture, urlError);
        validatedPictureUrl = null;
      }
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create a new user with Google account
      // For Google users, we create a random password hash since they don't need it
      const randomPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        profilePicture: validatedPictureUrl,
        isVerified: email_verified || true, // Google emails are pre-verified
        role: 'customer'
      });
      
      console.log('New Google user created:', {
        email: user.email,
        name: user.name,
        hasProfilePicture: !!user.profilePicture
      });
    } else {
      // Update profile picture if user exists and validated picture is available
      let shouldUpdate = false;
      
      if (validatedPictureUrl && (!user.profilePicture || user.profilePicture !== validatedPictureUrl)) {
        user.profilePicture = validatedPictureUrl;
        shouldUpdate = true;
      }
      
      if (!user.isVerified) {
        user.isVerified = true; // Mark as verified for Google users
        shouldUpdate = true;
      }
      
      if (shouldUpdate) {
        await user.save();
        console.log('Existing Google user updated:', {
          email: user.email,
          profilePictureUpdated: !!validatedPictureUrl,
          verificationUpdated: user.isVerified
        });
      }
    }

    // Generate JWT access token
    const accessToken = TokenUtils.generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Final user data for response
    const responseUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified
    };

    console.log('Google login successful:', {
      email: user.email,
      hasProfilePicture: !!user.profilePicture,
      profilePictureUrl: user.profilePicture ? user.profilePicture.substring(0, 50) + '...' : null,
      isNewUser: !user.createdAt || (Date.now() - new Date(user.createdAt).getTime()) < 1000
    });

    // Return success response with token and user data
    return NextResponse.json({
      message: 'Google login successful',
      accessToken,
      user: responseUser
    }, { status: 200 });

  } catch (error: any) {
    console.error('Google OAuth error:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return NextResponse.json(
        { 
          error: 'User validation failed',
          details: 'Please check your profile information',
          validationErrors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
