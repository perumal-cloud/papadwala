import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/lib/models';
import mongoose from 'mongoose';

// Test endpoint to debug user IDs
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all users and their IDs
    const users = await User.find({}).select('_id name email').limit(3);
    
    const userInfo = users.map(user => ({
      id: user._id,
      idString: user._id.toString(),
      idType: typeof user._id,
      idLength: user._id.toString().length,
      name: user.name,
      email: user.email,
      isValidObjectId: mongoose.Types.ObjectId.isValid(user._id.toString())
    }));

    return NextResponse.json({
      message: 'User ID debugging info',
      users: userInfo,
      sampleId: userInfo[0]?.idString || 'No users found'
    });

  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}