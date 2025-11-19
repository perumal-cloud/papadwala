import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/services/email';
import { validateContactForm } from '@/lib/services/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate input
    const validation = validateContactForm({ name, email, subject, message });
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Send contact email
    await emailService.sendContactEmail({
      name,
      email,
      subject,
      message,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your message! We will get back to you soon.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send message. Please try again later or contact us directly.',
        success: false 
      },
      { status: 500 }
    );
  }
}