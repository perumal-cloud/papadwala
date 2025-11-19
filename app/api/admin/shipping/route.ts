import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { ShippingZone } from '@/lib/models';
import { TokenUtils } from '@/lib/auth/utils';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = TokenUtils.verifyAccessToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build filter
    const filter: any = {};
    if (!includeInactive) {
      filter.isActive = true;
    }

    // Fetch shipping zones
    const shippingZones = await ShippingZone.find(filter)
      .sort({ priority: -1, name: 1 })
      .lean();

    // Get statistics
    const stats = await ShippingZone.aggregate([
      {
        $group: {
          _id: null,
          totalZones: { $sum: 1 },
          activeZones: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalMethods: { $sum: { $size: '$methods' } },
          activeMethods: {
            $sum: {
              $size: {
                $filter: {
                  input: '$methods',
                  cond: { $eq: ['$$this.isActive', true] }
                }
              }
            }
          }
        }
      }
    ]);

    return NextResponse.json({
      shippingZones,
      stats: stats[0] || {
        totalZones: 0,
        activeZones: 0,
        totalMethods: 0,
        activeMethods: 0
      }
    });

  } catch (error) {
    console.error('Error fetching shipping zones:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = TokenUtils.verifyAccessToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { name, description, regions, methods, isActive, priority } = await request.json();

    // Validation
    if (!name || !regions || !Array.isArray(regions) || regions.length === 0) {
      return NextResponse.json({ 
        error: 'Name and at least one region are required' 
      }, { status: 400 });
    }

    if (!methods || !Array.isArray(methods) || methods.length === 0) {
      return NextResponse.json({ 
        error: 'At least one shipping method is required' 
      }, { status: 400 });
    }

    await connectDB();

    // Check if zone name already exists
    const existingZone = await ShippingZone.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingZone) {
      return NextResponse.json({ 
        error: 'Shipping zone with this name already exists' 
      }, { status: 400 });
    }

    // Create new shipping zone
    const newZone = new ShippingZone({
      name,
      description,
      regions,
      methods,
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 0
    });

    await newZone.save();

    return NextResponse.json({
      message: 'Shipping zone created successfully',
      shippingZone: newZone
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating shipping zone:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        error: 'Validation error',
        details: Object.values(error.errors).map((err: any) => err.message)
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = TokenUtils.verifyAccessToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { zoneId, name, description, regions, methods, isActive, priority } = await request.json();

    if (!zoneId) {
      return NextResponse.json({ error: 'Zone ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(zoneId)) {
      return NextResponse.json({ error: 'Invalid zone ID' }, { status: 400 });
    }

    await connectDB();

    // Find the zone
    const zone = await ShippingZone.findById(zoneId);
    if (!zone) {
      return NextResponse.json({ error: 'Shipping zone not found' }, { status: 404 });
    }

    // Check if name conflicts with another zone
    if (name && name !== zone.name) {
      const existingZone = await ShippingZone.findOne({ 
        _id: { $ne: zoneId },
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
      });

      if (existingZone) {
        return NextResponse.json({ 
          error: 'Shipping zone with this name already exists' 
        }, { status: 400 });
      }
    }

    // Update fields
    if (name !== undefined) zone.name = name;
    if (description !== undefined) zone.description = description;
    if (regions !== undefined) zone.regions = regions;
    if (methods !== undefined) zone.methods = methods;
    if (isActive !== undefined) zone.isActive = isActive;
    if (priority !== undefined) zone.priority = priority;

    await zone.save();

    return NextResponse.json({
      message: 'Shipping zone updated successfully',
      shippingZone: zone
    });

  } catch (error: any) {
    console.error('Error updating shipping zone:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        error: 'Validation error',
        details: Object.values(error.errors).map((err: any) => err.message)
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = TokenUtils.verifyAccessToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { zoneId } = await request.json();

    if (!zoneId) {
      return NextResponse.json({ error: 'Zone ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(zoneId)) {
      return NextResponse.json({ error: 'Invalid zone ID' }, { status: 400 });
    }

    await connectDB();

    // Find and delete the zone
    const zone = await ShippingZone.findByIdAndDelete(zoneId);
    if (!zone) {
      return NextResponse.json({ error: 'Shipping zone not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Shipping zone deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting shipping zone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}