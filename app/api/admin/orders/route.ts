import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Order } from '@/lib/models';
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

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build filter query
    const filter: any = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get orders with user details
    const orders = await Order.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $addFields: {
          userDetails: { $arrayElemAt: ['$userDetails', 0] }
        }
      },
      {
        $project: {
          orderNumber: 1,
          userId: 1,
          items: 1,
          subtotal: 1,
          tax: 1,
          shippingCost: 1,
          total: 1,
          shippingAddress: 1,
          status: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          trackingNumber: 1,
          notes: 1,
          estimatedDelivery: 1,
          actualDelivery: 1,
          createdAt: 1,
          updatedAt: 1,
          'userDetails.name': 1,
          'userDetails.email': 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);

    // Get total count for pagination
    const totalCount = await Order.countDocuments(filter);

    // Get summary statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          }
        }
      }
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        pendingPayments: 0,
        completedPayments: 0
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
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

    const { orderId, status, trackingNumber, notes, estimatedDelivery } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    await connectDB();

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prepare update object
    const updateData: any = {
      updatedAt: new Date()
    };

    // Update status if provided
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      updateData.status = status;
      
      // Auto-update payment status for delivered orders
      if (status === 'delivered' && order.paymentMethod === 'cod') {
        updateData.paymentStatus = 'paid';
        updateData.actualDelivery = new Date();
      }

      // Set estimated delivery for shipped orders
      if (status === 'shipped' && !order.estimatedDelivery) {
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + 3); // 3 days from ship date
        updateData.estimatedDelivery = estimatedDate;
      }
    }

    // Update tracking number if provided
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    // Update notes if provided
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update estimated delivery if provided
    if (estimatedDelivery) {
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    // Update status history separately if status was changed
    if (status) {
      await Order.findByIdAndUpdate(
        orderId,
        {
          $push: {
            statusHistory: {
              status,
              timestamp: new Date(),
              notes: notes || `Status updated to ${status} by admin`
            }
          }
        }
      );
    }

    // TODO: Send email notification to customer about status update
    // TODO: Send SMS notification if phone number is available

    return NextResponse.json({
      message: 'Order updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
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

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    await connectDB();

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow deletion of cancelled orders or very recent pending orders
    const canDelete = order.status === 'cancelled' || 
                     (order.status === 'pending' && 
                      (new Date().getTime() - new Date(order.createdAt).getTime()) < 24 * 60 * 60 * 1000); // 24 hours

    if (!canDelete) {
      return NextResponse.json({ 
        error: 'Can only delete cancelled orders or pending orders within 24 hours' 
      }, { status: 400 });
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    return NextResponse.json({
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}