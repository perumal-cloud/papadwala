import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/lib/models';
import { PasswordUtils, TokenUtils } from '@/lib/auth';
import { validateUserLogin } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validation = validateUserLogin(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data!;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          error: 'Account not verified. Please verify your email first.',
          code: 'EMAIL_NOT_VERIFIED'
        },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await PasswordUtils.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokens = TokenUtils.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Update last login (optional)
    user.updatedAt = new Date();
    await user.save();

    // Set refresh token as httpOnly cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
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

    // Set refresh token cookie
    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);

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