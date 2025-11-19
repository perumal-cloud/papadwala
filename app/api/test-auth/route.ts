import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';

// Simple auth test endpoint
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided', authenticated: false },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = TokenUtils.verifyAccessToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token', authenticated: false },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isVerified) {
      return NextResponse.json(
        { error: 'User not found or not verified', authenticated: false },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      tokenPayload: decoded
    });

  } catch (error: any) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { error: 'Server error', authenticated: false },
      { status: 500 }
    );
  }
}