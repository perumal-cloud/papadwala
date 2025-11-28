import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User, Order } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/admin/users/[id] - Get detailed user information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    // Verify token and check admin role
    let decoded;
    try {
      decoded = TokenUtils.verifyAccessToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Await params as it's now a Promise in Next.js 16
    const resolvedParams = await params;
    const userId = resolvedParams.id.trim(); // Remove any whitespace

    console.log('Received user ID:', userId);
    console.log('User ID length:', userId.length);
    console.log('User ID type:', typeof userId);

    // Simplified ObjectId validation - just check if mongoose can handle it
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(userId);
      console.log('ObjectId created successfully:', objectId);
    } catch (error) {
      console.log('ObjectId creation failed:', error);
      return NextResponse.json(
        { 
          error: 'Invalid user ID format', 
          receivedId: userId, 
          length: userId.length,
          details: 'ID must be a valid MongoDB ObjectId'
        },
        { status: 400 }
      );
    }

    console.log('Fetching user details for ID:', userId);

    // Get user details
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      console.log('User not found in database:', userId);
      return NextResponse.json(
        { error: 'User not found', userId: userId },
        { status: 404 }
      );
    }

    // Get user's order history with details
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Get monthly order statistics for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Order.aggregate([
      {
        $match: {
          userId: user._id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          orders: { $sum: 1 },
          spent: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0
    };

    return NextResponse.json(
      {
        user: {
          ...user.toObject(),
          status: user.isVerified ? 'active' : 'unverified'
        },
        orders: orders.slice(0, 5), // Last 5 orders for preview
        statistics: {
          ...stats,
          monthlyStats
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get user details error:', error);

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

// PUT /api/admin/users/[id] - Update specific user details  
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    // Verify token and check admin role
    let decoded;
    try {
      decoded = TokenUtils.verifyAccessToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Await params as it's now a Promise in Next.js 16
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const updates = await request.json();

    // Validate updates - allow more fields for individual user edit
    const allowedUpdates = ['name', 'email', 'role', 'isVerified', 'phone'];
    const updateKeys = Object.keys(updates);
    const isValidOperation = updateKeys.every(key => allowedUpdates.includes(key));

    if (!isValidOperation) {
      return NextResponse.json(
        { error: 'Invalid update fields' },
        { status: 400 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (updates.email) {
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: {
          ...updatedUser.toObject(),
          status: updatedUser.isVerified ? 'active' : 'unverified'
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Update user details error:', error);

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