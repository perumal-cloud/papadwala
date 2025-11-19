import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User, OTP } from '@/lib/models';
import { TokenUtils, OTPUtils } from '@/lib/auth';
import { emailService, validateOTPVerification } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validation = validateOTPVerification(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { email, otp } = validation.data!;

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      userEmail: email,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 }); // Get the latest OTP

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check attempt limits
    if (otpRecord.attempts >= 5) {
      // Mark OTP as used to prevent further attempts
      await OTP.updateOne(
        { _id: otpRecord._id },
        { $set: { used: true } }
      );
      
      return NextResponse.json(
        { error: 'Too many verification attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    // Verify OTP
    const isValidOTP = await OTPUtils.verify(otp, otpRecord.codeHash);
    
    if (!isValidOTP) {
      // Increment attempt count
      await OTP.updateOne(
        { _id: otpRecord._id },
        { $inc: { attempts: 1 } }
      );
      
      const remainingAttempts = 5 - (otpRecord.attempts + 1);
      
      return NextResponse.json(
        { 
          error: 'Invalid OTP. Please try again.',
          remainingAttempts 
        },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please register again.' },
        { status: 404 }
      );
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Mark OTP as used
    await OTP.updateOne(
      { _id: otpRecord._id },
      { $set: { used: true } }
    );

    // Clean up expired/used OTPs for this user
    await OTP.deleteMany({
      userEmail: email,
      $or: [
        { used: true },
        { expiresAt: { $lt: new Date() } }
      ]
    });

    // Generate tokens
    const tokens = TokenUtils.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user.email, user.name).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    // Set refresh token as httpOnly cookie
    const response = NextResponse.json(
      {
        message: 'Email verified successfully',
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
    console.error('OTP verification error:', error);

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