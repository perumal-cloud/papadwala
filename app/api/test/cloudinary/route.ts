import { NextRequest, NextResponse } from 'next/server';
import { cloudinaryService } from '@/lib/services';

export async function GET() {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Check environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    console.log('Env vars:', {
      cloudName: cloudName ? 'Set' : 'Missing',
      apiKey: apiKey ? 'Set' : 'Missing', 
      apiSecret: apiSecret ? 'Set' : 'Missing'
    });

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({
        error: 'Cloudinary environment variables are not properly configured',
        missing: {
          cloudName: !cloudName,
          apiKey: !apiKey,
          apiSecret: !apiSecret
        }
      }, { status: 500 });
    }

    // Test connection
    const isConnected = await cloudinaryService.testConnection();
    
    return NextResponse.json({
      success: true,
      connected: isConnected,
      config: {
        cloudName,
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret
      }
    });
  } catch (error) {
    console.error('Cloudinary test error:', error);
    return NextResponse.json({
      error: 'Failed to test Cloudinary connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}