import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/database';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';
import Product from '@/lib/models/Product';
import { User } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { invoiceServiceJsPDF, emailService } from '@/lib/services';

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

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const user = await verifyAuth(request);

    const { items, shippingAddress, paymentMethod, orderNotes, totalAmount } = await request.json();

    // Validate required fields
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.email ||
        !shippingAddress.addressLine1 || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.phoneNumber) {
      return NextResponse.json(
        { error: 'Complete shipping address is required' },
        { status: 400 }
      );
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    // Validate cart items and calculate totals
    let orderTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Product ${product?.name || 'Unknown'} is no longer available` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
          { status: 400 }
        );
      }

      const itemTotal = (item.priceSnapshot || product.price) * item.quantity;
      orderTotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: item.priceSnapshot || product.price,
        quantity: item.quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.jpg'
      });

      // Update product stock
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `PAP-${Date.now()}-${orderCount + 1}`;

    // Create order
    const orderData = {
      orderNumber,
      userId: new mongoose.Types.ObjectId(user.id),
      items: orderItems,
      shippingAddress: {
        ...shippingAddress,
        country: shippingAddress.country || 'India'
      },
      paymentMethod: paymentMethod || 'cod',
      notes: orderNotes,
      subtotal: orderTotal,
      tax: 0, // No tax for now
      shippingCost: orderTotal < 500 ? 50 : 0, // Free shipping for orders above ₹500
      total: orderTotal + (orderTotal < 500 ? 50 : 0),
      status: 'pending',
      paymentStatus: 'pending',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        notes: 'Order placed'
      }]
    };

    const order = new Order(orderData);
    await order.save();

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(user.id) },
      { $set: { items: [] } }
    );

    // Populate order for response
    await order.populate('userId', 'name email phone');

    console.log('Order created successfully, ID:', order._id);

    // Send order placed email (not confirmation - that comes after admin confirms)
    try {
      await emailService.sendOrderPlacedEmail(user.email, {
        orderNumber: order.orderNumber,
        customerName: user.name || 'Customer',
        items: order.items,
        total: order.total,
        shippingAddress: order.shippingAddress
      });
      console.log('Order placed email sent successfully');
    } catch (emailError) {
      console.error('Error sending order placed email:', emailError);
      // Don't fail the order creation if email fails
    }

    // Generate and send invoice email
    try {
      const invoiceData = {
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        customer: {
          name: user.name || 'N/A',
          email: user.email || 'N/A',
          phone: order.userId.phone || 'N/A'
        },
        shippingAddress: order.shippingAddress || {
          fullName: user.name || 'N/A',
          addressLine1: 'Address not available',
          city: 'N/A',
          state: 'N/A',
          postalCode: 'N/A',
          country: 'India',
          phoneNumber: order.userId.phone || 'N/A'
        },
        items: order.items.map((item: any) => ({
          name: item.name || 'Product name not available',
          quantity: item.quantity || 1,
          price: item.price || 0,
          total: (item.price || 0) * (item.quantity || 1),
          image: item.image || ''
        })),
        subtotal: order.subtotal || 0,
        shippingCost: order.shippingCost || 0,
        tax: order.tax || 0,
        total: order.total || 0,
        paymentMethod: order.paymentMethod || 'COD',
        status: order.status || 'pending'
      };

      await invoiceServiceJsPDF.generateAndSendInvoice(invoiceData);
      console.log('Invoice generated and sent successfully for order:', order.orderNumber);
    } catch (invoiceError) {
      console.error('Error generating/sending invoice:', invoiceError);
      // Don't fail the order creation if invoice fails
    }

    return NextResponse.json({
      message: 'Order placed successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.total,
        items: order.items,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create order error:', error);
    
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
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET /api/orders - Get user's orders or all orders for admin
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const user = await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    let query: any = {};

    // If not admin, only show user's orders
    if (user.role !== 'admin') {
      query.userId = user.id;
    }

    // Filter by status if provided
    if (status && ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.total,
        itemCount: order.items.length,
        customer: order.userId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error: any) {
    console.error('Get orders error:', error);
    
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
      { error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}