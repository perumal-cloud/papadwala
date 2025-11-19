import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = TokenUtils.verifyRefreshToken(refreshToken);
    } catch (error) {
      // Clear invalid refresh token
      const response = NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
      
      response.cookies.set('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      
      return response;
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      // Clear refresh token for non-existent user
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
      
      response.cookies.set('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      
      return response;
    }

    // Check if user is still verified
    if (!user.isVerified) {
      const response = NextResponse.json(
        { error: 'Account not verified' },
        { status: 403 }
      );
      
      response.cookies.set('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      
      return response;
    }

    // Generate new tokens
    const tokens = TokenUtils.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Set new refresh token as httpOnly cookie
    const response = NextResponse.json(
      {
        message: 'Token refreshed successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        accessToken: tokens.accessToken
      },
      { status: 200 }
    );

    // Set new refresh token cookie
    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Token refresh error:', error);

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