import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  role: string;
}

// Mock settings storage - in production, this would be stored in database
let siteSettings = {
  siteName: 'Your Store',
  siteDescription: 'Your amazing online store',
  contactEmail: 'contact@yourstore.com',
  phoneNumber: '+91 12345 67890',
  address: '123 Business Street, City, State - 123456',
  currency: 'INR',
  taxRate: 18,
  shippingFee: 50,
  freeShippingThreshold: 500,
  notificationsEnabled: true,
  emailNotifications: true,
  smsNotifications: false,
};

// GET - Get current settings
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      
      if (decoded.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        settings: siteSettings
      });

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      
      if (decoded.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      const body = await request.json();
      
      // Validate required fields
      const requiredFields = ['siteName', 'contactEmail'];
      for (const field of requiredFields) {
        if (!body[field] || body[field].trim() === '') {
          return NextResponse.json(
            { error: `${field} is required` },
            { status: 400 }
          );
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.contactEmail)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Validate numeric fields
      if (body.taxRate < 0 || body.taxRate > 100) {
        return NextResponse.json(
          { error: 'Tax rate must be between 0 and 100' },
          { status: 400 }
        );
      }

      if (body.shippingFee < 0) {
        return NextResponse.json(
          { error: 'Shipping fee cannot be negative' },
          { status: 400 }
        );
      }

      if (body.freeShippingThreshold < 0) {
        return NextResponse.json(
          { error: 'Free shipping threshold cannot be negative' },
          { status: 400 }
        );
      }

      // Update settings
      siteSettings = {
        ...siteSettings,
        ...body,
        // Ensure certain fields are properly typed
        taxRate: parseFloat(body.taxRate) || 0,
        shippingFee: parseFloat(body.shippingFee) || 0,
        freeShippingThreshold: parseFloat(body.freeShippingThreshold) || 0,
      };

      // TODO: In production, save to database
      // Example:
      // await connectDB();
      // await Settings.findOneAndUpdate({}, siteSettings, { upsert: true });

      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully',
        settings: siteSettings
      });

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}