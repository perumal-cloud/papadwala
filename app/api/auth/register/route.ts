import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User, OTP } from '@/lib/models';
import { PasswordUtils, OTPUtils } from '@/lib/auth';
import { emailService, validateUserRegistration } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validation = validateUserRegistration(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data!;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 409 }
        );
      } else {
        // User exists but not verified, allow re-registration
        await User.deleteOne({ email });
        await OTP.deleteMany({ userEmail: email });
      }
    }

    // Generate OTP
    const otpLength = parseInt(process.env.OTP_LENGTH || '6');
    const otpExpiryMinutes = parseInt(process.env.OTP_EXPIRES_IN || '10');
    
    const otpCode = OTPUtils.generate(otpLength);
    const otpHash = await OTPUtils.hash(otpCode);
    const otpExpiry = OTPUtils.generateExpiryDate(otpExpiryMinutes);

    // Hash password
    const passwordHash = await PasswordUtils.hash(password);

    // Store user temporarily (unverified)
    const user = new User({
      name,
      email,
      passwordHash,
      role: 'customer',
      isVerified: false
    });

    // Store OTP
    const otp = new OTP({
      userEmail: email,
      codeHash: otpHash,
      expiresAt: otpExpiry,
      used: false,
      attempts: 0
    });

    // Save both user and OTP
    await Promise.all([user.save(), otp.save()]);

    // Send OTP email
    try {
      await emailService.sendOTPEmail(email, otpCode, name);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      
      // Clean up user and OTP if email fails
      await Promise.all([
        User.deleteOne({ email }),
        OTP.deleteOne({ userEmail: email })
      ]);
      
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Registration initiated. Please check your email for verification code.',
        email: email,
        expiresIn: otpExpiryMinutes
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

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