import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Newsletter from '@/lib/models/Newsletter';
import { emailService } from '@/lib/services/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email: email.toLowerCase() });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        );
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        existingSubscription.unsubscribedAt = undefined;
        await existingSubscription.save();

        // Send confirmation email
        try {
          await emailService.sendNewsletterConfirmationEmail(email);
        } catch (emailError) {
          console.error('Failed to send newsletter confirmation email:', emailError);
          // Continue even if email fails
        }

        return NextResponse.json(
          { 
            success: true, 
            message: 'Welcome back! Your subscription has been reactivated.' 
          },
          { status: 200 }
        );
      }
    }

    // Create new subscription
    const newsletter = new Newsletter({
      email: email.toLowerCase(),
      isActive: true,
      subscribedAt: new Date(),
      preferences: {
        products: true,
        offers: true,
        recipes: true,
      },
    });

    await newsletter.save();

    // Send confirmation email
    try {
      await emailService.sendNewsletterConfirmationEmail(email);
    } catch (emailError) {
      console.error('Failed to send newsletter confirmation email:', emailError);
      // Continue even if email fails - subscription is still created
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for subscribing! Check your email for confirmation.' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to subscribe to newsletter. Please try again later.',
        success: false 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscription status (optional)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const subscription = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscription) {
      return NextResponse.json(
        { subscribed: false, message: 'Email not found in newsletter' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        subscribed: subscription.isActive,
        subscribedAt: subscription.subscribedAt,
        preferences: subscription.preferences 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}
