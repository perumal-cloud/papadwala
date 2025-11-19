import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Order } from '@/lib/models';
import { ORDER_STATUS_LABELS, ORDER_STATUS_DESCRIPTIONS, getOrderProgress } from '@/lib/constants/orderStatus';

// GET /api/orders/track/[orderNumber] - Track order by order number (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    await connectDB();

    const { orderNumber } = await params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    // Find the order by order number with enhanced tracking info
    const order = await Order.findOne({ orderNumber })
      .select(`
        orderNumber status statusHistory paymentStatus total 
        shippingAddress trackingInfo estimatedDelivery actualDelivery 
        createdAt items shippedAt outForDeliveryAt deliveredAt 
        customerNotes
      `)
      .populate('items.productId', 'name images');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Enhanced tracking information
    const trackingInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS],
      statusDescription: ORDER_STATUS_DESCRIPTIONS[order.status as keyof typeof ORDER_STATUS_DESCRIPTIONS],
      progress: getOrderProgress(order.status),
      paymentStatus: order.paymentStatus,
      total: order.total,
      estimatedDelivery: order.estimatedDelivery || order.getEstimatedDelivery?.(),
      actualDelivery: order.actualDelivery,
      createdAt: order.createdAt,
      shippedAt: order.shippedAt,
      outForDeliveryAt: order.outForDeliveryAt,
      deliveredAt: order.deliveredAt,
      customerNotes: order.customerNotes,
      tracking: {
        trackingNumber: order.trackingInfo?.trackingNumber,
        carrier: order.trackingInfo?.carrier,
        trackingUrl: order.trackingInfo?.trackingUrl,
        currentLocation: order.trackingInfo?.currentLocation,
        expectedDelivery: order.trackingInfo?.expectedDelivery,
        deliveryAttempts: order.trackingInfo?.deliveryAttempts || []
      },
      shippingAddress: {
        fullName: order.shippingAddress.fullName,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode
        // Don't expose full address for security
      },
      items: order.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      timeline: order.statusHistory
        .map((entry: any) => ({
          status: entry.status,
          statusLabel: ORDER_STATUS_LABELS[entry.status as keyof typeof ORDER_STATUS_LABELS],
          timestamp: entry.timestamp,
          notes: entry.notes,
          location: entry.location
        }))
        .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    };

    return NextResponse.json({
      success: true,
      tracking: trackingInfo
    });

  } catch (error: any) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    );
  }
}