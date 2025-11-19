import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Order from '@/lib/models/Order';
import { User } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new Error('Access token required');
  }

  let decoded;
  try {
    decoded = TokenUtils.verifyAccessToken(token);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.isVerified) {
    throw new Error('User not found or not verified');
  }

  return { 
    id: user._id.toString(), 
    email: user.email, 
    role: user.role, 
    name: user.name 
  };
}

// GET /api/orders/[id] - Get specific order details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    // Verify authentication
    const user = await verifyAuth(request);

    const { id } = await params;

    let query: any = { orderNumber: id };

    // If not admin, only allow access to user's own orders
    if (user.role !== 'admin') {
      query.userId = user.id;
    }

    const order = await Order.findOne(query)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name slug images price');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        items: order.items,
        shippingAddress: order.shippingAddress,
        notes: order.notes,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax,
        total: order.total,
        totalAmount: order.total, // For consistency with other endpoints
        customer: order.userId,
        trackingNumber: order.trackingNumber,
        statusHistory: order.statusHistory,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Get order error:', error);
    
    // Handle authentication errors
    if (error.message === 'Access token required' || 
        error.message === 'Invalid or expired token') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    if (error.message === 'User not found or not verified') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order status (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    // Verify authentication and admin role
    const user = await verifyAuth(request);
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status, paymentStatus, trackingNumber, notes } = await request.json();

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ orderNumber: id });
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      updateData.$push = {
        statusHistory: {
          status,
          timestamp: new Date(),
          notes: notes || `Order status updated to ${status}`
        }
      };
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      updateData,
      { new: true }
    ).populate('userId', 'name email phone');

    return NextResponse.json({
      message: 'Order updated successfully',
      order: {
        id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        trackingNumber: updatedOrder.trackingNumber,
        statusHistory: updatedOrder.statusHistory,
        updatedAt: updatedOrder.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Update order error:', error);
    
    // Handle authentication errors
    if (error.message === 'Access token required' || 
        error.message === 'Invalid or expired token') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    if (error.message === 'User not found or not verified') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Cancel order (user or admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    // Verify authentication
    const user = await verifyAuth(request);

    const { id } = await params;

    let query: any = { orderNumber: id };

    // If not admin, only allow cancellation of user's own orders
    if (user.role !== 'admin') {
      query.userId = user.id;
    }

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot cancel order with status: ${order.status}` },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        status: 'cancelled',
        $push: {
          statusHistory: {
            status: 'cancelled',
            timestamp: new Date(),
            notes: `Order cancelled by ${user.role === 'admin' ? 'admin' : 'customer'}`
          }
        }
      },
      { new: true }
    );

    // TODO: Restore product stock when order is cancelled
    // This would require iterating through order items and updating product stock

    return NextResponse.json({
      message: 'Order cancelled successfully',
      order: {
        id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Cancel order error:', error);
    
    // Handle authentication errors
    if (error.message === 'Access token required' || 
        error.message === 'Invalid or expired token') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    if (error.message === 'User not found or not verified') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}