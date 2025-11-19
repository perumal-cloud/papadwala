import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Order from '@/lib/models/Order';
import { User } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { invoiceServiceJsPDF } from '@/lib/services';

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

// POST /api/orders/[id]/invoice - Generate and send invoice for an order
export async function POST(request: NextRequest, { params }: RouteParams) {
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
      .populate('userId', 'name email phone');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare invoice data
    const invoiceData = {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customer: {
        name: order.userId.name || 'N/A',
        email: order.userId.email || 'N/A',
        phone: order.userId.phone || 'N/A'
      },
      shippingAddress: order.shippingAddress || {
        fullName: order.userId.name || 'N/A',
        addressLine1: 'Address not available',
        city: 'N/A',
        state: 'N/A',
        postalCode: 'N/A',
        country: 'India',
        phoneNumber: order.userId.phone || 'N/A'
      },
      items: (order.items || []).map((item: any) => ({
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
      paymentMethod: order.paymentMethod || 'cod',
      status: order.status || 'pending'
    };

    // Generate PDF invoice using the invoice service
    const pdfBuffer = await invoiceServiceJsPDF.generateInvoicePDF(invoiceData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      }
    });

  } catch (error: any) {
    console.error('Generate invoice error:', error);
    
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
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}

// GET /api/orders/[id]/invoice - Download invoice PDF
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
      .populate('userId', 'name email phone');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare invoice data
    const invoiceData = {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customer: {
        name: order.userId.name || 'N/A',
        email: order.userId.email || 'N/A',
        phone: order.userId.phone || 'N/A'
      },
      shippingAddress: order.shippingAddress || {
        fullName: order.userId.name || 'N/A',
        addressLine1: 'Address not available',
        city: 'N/A',
        state: 'N/A',
        postalCode: 'N/A',
        country: 'India',
        phoneNumber: order.userId.phone || 'N/A'
      },
      items: (order.items || []).map((item: any) => ({
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
      paymentMethod: order.paymentMethod || 'cod',
      status: order.status || 'pending'
    };
    
    // Generate PDF invoice using the invoice service
    const pdfBuffer = await invoiceServiceJsPDF.generateInvoicePDF(invoiceData);
    
    // Return the PDF file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      }
    });

  } catch (error: any) {
    console.error('Download invoice error:', error);
    
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
      { error: error.message },
      { status: 500 }
    );
  }
}