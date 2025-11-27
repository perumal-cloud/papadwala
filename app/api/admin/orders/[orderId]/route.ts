import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '../../../../../lib/database';
import { Order } from '../../../../../lib/models';
import { TokenUtils } from '../../../../../lib/auth/utils';
import { ORDER_STATUSES, isValidStatusTransition, type OrderStatus } from '../../../../../lib/constants/orderStatus';
import { emailService } from '../../../../../lib/services';

// Helper function to verify admin authentication
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Authorization header required');
  }

  const token = authHeader.split(' ')[1];
  const decoded = TokenUtils.verifyAccessToken(token);
  
  if (!decoded || decoded.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return decoded;
}

// PATCH /api/admin/orders/[orderId] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminAuth(request);

    try {
      await connectDB();
      
      // Verify database connection health
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database connection is not ready');
      }
      
    } catch (dbConnectionError: any) {
      console.error('Database connection error:', {
        error: dbConnectionError.message,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host
      });
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: process.env.NODE_ENV === 'development' ? dbConnectionError.message : undefined
        },
        { status: 503 }
      );
    }

    const { 
      status, 
      notes, 
      trackingNumber, 
      carrier,
      trackingUrl,
      currentLocation,
      expectedDelivery,
      estimatedDelivery,
      adminNotes,
      customerNotes,
      deliveryAttempt,
      paymentStatus
    } = await request.json();

    const { orderId } = await params;

    // Validate orderId format - more flexible validation for MongoDB ObjectId
    if (!orderId || typeof orderId !== 'string' || orderId.trim().length < 12) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // Validate status
    if (status && !Object.values(ORDER_STATUSES).includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // Validate payment status
    if (paymentStatus && !['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status. Must be pending, paid, or failed' },
        { status: 400 }
      );
    }

    // Find the order
    let order;
    try {
      order = await Order.findById(orderId);
    } catch (dbError: any) {
      console.error('Database error while fetching order:', dbError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if status transition is valid (allow admin override for special cases)
    if (status && status !== order.status && !isValidStatusTransition(order.status, status)) {
      // Log the invalid transition but allow it with a warning note
      console.warn(`Admin ${adminUser.userId} performed invalid status transition from ${order.status} to ${status} for order ${order.orderNumber}`);
    }

    // Store previous status for email logic
    const previousStatus = order.status;

    // Update order status using enhanced method
    if (status && status !== order.status) {
      // Validate expectedDelivery date if provided
      let parsedExpectedDelivery: Date | undefined;
      if (expectedDelivery) {
        parsedExpectedDelivery = new Date(expectedDelivery);
        if (isNaN(parsedExpectedDelivery.getTime())) {
          return NextResponse.json(
            { error: 'Invalid expected delivery date' },
            { status: 400 }
          );
        }
      }

      try {
        await order.updateStatus(status, {
          notes: notes || `Status updated to ${status} by admin`,
          updatedBy: adminUser.userId,
          location: currentLocation,
          trackingInfo: {
            ...(trackingNumber && { trackingNumber }),
            ...(carrier && { carrier }),
            ...(trackingUrl && { trackingUrl }),
            ...(currentLocation && { currentLocation }),
            ...(parsedExpectedDelivery && { expectedDelivery: parsedExpectedDelivery })
          },
          adminNotes
        });

        // Send order confirmation email when status changes to 'confirmed'
        if (previousStatus === 'pending' && status === 'confirmed') {
          try {
            // Populate userId to get user details
            await order.populate('userId', 'name email');
            const user = order.userId as any;
            
            if (user && user.email) {
              await emailService.sendOrderConfirmationEmail(user.email, {
                orderNumber: order.orderNumber,
                customerName: user.name || 'Customer',
                items: order.items,
                total: order.total,
                shippingAddress: order.shippingAddress
              });
              console.log('Order confirmation email sent successfully to:', user.email);
            }
          } catch (emailError) {
            console.error('Error sending order confirmation email:', emailError);
            // Don't fail the status update if email fails
          }
        }
      } catch (updateError: any) {
        console.error('Error updating order status:', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          fromStatus: order.status,
          toStatus: status,
          error: updateError.message,
          stack: updateError.stack,
          validation: updateError.errors
        });
        
        let errorMessage = 'Failed to update order status';
        if (updateError.name === 'ValidationError') {
          const validationErrors = Object.values(updateError.errors).map((err: any) => err.message);
          errorMessage = `Status update validation failed: ${validationErrors.join(', ')}`;
        } else if (updateError.name === 'CastError') {
          errorMessage = `Invalid status data format: ${updateError.message}`;
        } else if (updateError.code === 11000) {
          errorMessage = 'Status update conflict: Please try again';
        } else if (updateError.message.includes('connection')) {
          errorMessage = 'Database connection error during status update';
        }
        
        return NextResponse.json(
          { 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? updateError.message : undefined
          },
          { status: 500 }
        );
      }
    } else {
      // Update tracking info without status change
      let hasChanges = false;
      
      if (trackingNumber || carrier || trackingUrl || currentLocation || expectedDelivery) {
        if (!order.trackingInfo) {
          order.trackingInfo = {
            deliveryAttempts: []
          };
        }
        
        if (trackingNumber !== undefined && trackingNumber !== order.trackingInfo.trackingNumber) {
          order.trackingInfo.trackingNumber = trackingNumber;
          hasChanges = true;
        }
        if (carrier !== undefined && carrier !== order.trackingInfo.carrier) {
          order.trackingInfo.carrier = carrier;
          hasChanges = true;
        }
        if (trackingUrl !== undefined && trackingUrl !== order.trackingInfo.trackingUrl) {
          order.trackingInfo.trackingUrl = trackingUrl;
          hasChanges = true;
        }
        if (currentLocation !== undefined && currentLocation !== order.trackingInfo.currentLocation) {
          order.trackingInfo.currentLocation = currentLocation;
          hasChanges = true;
        }
        if (expectedDelivery) {
          const parsedDate = new Date(expectedDelivery);
          if (isNaN(parsedDate.getTime())) {
            return NextResponse.json(
              { error: 'Invalid expected delivery date' },
              { status: 400 }
            );
          }
          if (!order.trackingInfo.expectedDelivery || order.trackingInfo.expectedDelivery.getTime() !== parsedDate.getTime()) {
            order.trackingInfo.expectedDelivery = parsedDate;
            hasChanges = true;
          }
        }
        order.markModified('trackingInfo');
      }
      
      if (adminNotes !== undefined && adminNotes !== order.adminNotes) {
        order.adminNotes = adminNotes;
        hasChanges = true;
      }
      if (customerNotes !== undefined && customerNotes !== order.customerNotes) {
        order.customerNotes = customerNotes;
        hasChanges = true;
      }
      if (paymentStatus !== undefined && paymentStatus !== order.paymentStatus) {
        order.paymentStatus = paymentStatus;
        hasChanges = true;
      }
      if (estimatedDelivery) {
        const parsedDate = new Date(estimatedDelivery);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid estimated delivery date' },
            { status: 400 }
          );
        }
        if (!order.estimatedDelivery || order.estimatedDelivery.getTime() !== parsedDate.getTime()) {
          order.estimatedDelivery = parsedDate;
          hasChanges = true;
        }
      }
      
      // Only save if there are actual changes
      if (hasChanges) {
        try {
          // Use findByIdAndUpdate for atomic updates to prevent race conditions
          const updatedOrder = await Order.findByIdAndUpdate(
            order._id,
            {
              $set: {
                ...(order.trackingInfo && { trackingInfo: order.trackingInfo }),
                ...(adminNotes !== undefined && { adminNotes: order.adminNotes }),
                ...(customerNotes !== undefined && { customerNotes: order.customerNotes }),
                ...(paymentStatus !== undefined && { paymentStatus: order.paymentStatus }),
                ...(order.estimatedDelivery && { estimatedDelivery: order.estimatedDelivery })
              }
            },
            { 
              new: true,
              runValidators: true,
              lean: false
            }
          );
          
          if (!updatedOrder) {
            return NextResponse.json(
              { error: 'Order not found during update' },
              { status: 404 }
            );
          }
          
          // Update the order object for response
          Object.assign(order, updatedOrder);
        } catch (saveError: any) {
          console.error('Error saving order changes:', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            error: saveError.message,
            stack: saveError.stack,
            validation: saveError.errors
          });
          
          // Provide specific error messages based on error type
          let errorMessage = 'Failed to save order changes';
          if (saveError.name === 'ValidationError') {
            const validationErrors = Object.values(saveError.errors).map((err: any) => err.message);
            errorMessage = `Validation failed: ${validationErrors.join(', ')}`;
          } else if (saveError.name === 'CastError') {
            errorMessage = `Invalid data format: ${saveError.message}`;
          } else if (saveError.code === 11000) {
            errorMessage = 'Duplicate key error: Order number already exists';
          } else if (saveError.message.includes('connection')) {
            errorMessage = 'Database connection error';
          }
          
          return NextResponse.json(
            { 
              error: errorMessage,
              details: process.env.NODE_ENV === 'development' ? saveError.message : undefined
            },
            { status: 500 }
          );
        }
      }
    }

    // Add delivery attempt if provided
    if (deliveryAttempt) {
      // Validate delivery attempt data
      if (!deliveryAttempt.status || !['successful', 'failed', 'rescheduled'].includes(deliveryAttempt.status)) {
        return NextResponse.json(
          { error: 'Invalid delivery attempt status' },
          { status: 400 }
        );
      }

      try {
        await order.addDeliveryAttempt(
          deliveryAttempt.status,
          deliveryAttempt.notes,
          deliveryAttempt.location
        );
      } catch (attemptError: any) {
        console.error('Error adding delivery attempt:', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          attemptStatus: deliveryAttempt.status,
          error: attemptError.message,
          stack: attemptError.stack,
          validation: attemptError.errors
        });
        
        let errorMessage = 'Failed to add delivery attempt';
        if (attemptError.name === 'ValidationError') {
          const validationErrors = Object.values(attemptError.errors).map((err: any) => err.message);
          errorMessage = `Delivery attempt validation failed: ${validationErrors.join(', ')}`;
        } else if (attemptError.name === 'CastError') {
          errorMessage = `Invalid delivery attempt data format: ${attemptError.message}`;
        } else if (attemptError.message.includes('connection')) {
          errorMessage = 'Database connection error while adding delivery attempt';
        }
        
        return NextResponse.json(
          { 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? attemptError.message : undefined
          },
          { status: 500 }
        );
      }
    }

    // Populate user details for response
    try {
      await order.populate('userId', 'name email');
    } catch (populateError: any) {
      console.error('Error populating user details:', populateError);
      // Continue without user details if population fails
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        statusHistory: order.statusHistory,
        trackingInfo: order.trackingInfo,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery,
        shippedAt: order.shippedAt,
        outForDeliveryAt: order.outForDeliveryAt,
        deliveredAt: order.deliveredAt,
        paymentStatus: order.paymentStatus,
        total: order.total,
        adminNotes: order.adminNotes,
        customerNotes: order.customerNotes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        user: order.userId
      }
    });

  } catch (error: any) {
    console.error('Error updating order:', error);
    
    if (error.message === 'Authorization header required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// GET /api/admin/orders/[orderId] - Get order details for admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request);

    try {
      await connectDB();
    } catch (dbConnectionError: any) {
      console.error('Database connection error:', dbConnectionError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const { orderId } = await params;

    // Validate orderId format - more flexible validation for MongoDB ObjectId
    if (!orderId || typeof orderId !== 'string' || orderId.trim().length < 12) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // Find the order with user details
    let order;
    try {
      order = await Order.findById(orderId)
        .populate('userId', 'name email phone')
        .populate('items.productId', 'name images category');
    } catch (dbError: any) {
      console.error('Database error while fetching order:', dbError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        statusHistory: order.statusHistory,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        shippingCost: order.shippingCost,
        total: order.total,
        shippingAddress: order.shippingAddress,
        trackingInfo: order.trackingInfo,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery,
        shippedAt: order.shippedAt,
        outForDeliveryAt: order.outForDeliveryAt,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
        cancellationReason: order.cancellationReason,
        notes: order.notes,
        adminNotes: order.adminNotes,
        customerNotes: order.customerNotes,
        invoiceUrl: order.invoiceUrl,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        user: order.userId
      }
    });

  } catch (error: any) {
    console.error('Error fetching order:', error);
    
    if (error.message === 'Authorization header required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}