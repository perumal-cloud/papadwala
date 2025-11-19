import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ValidationUtils } from '@/lib/database';
import { Cart, Product } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { validateCartItem } from '@/lib/services';

// Helper function to authenticate user
async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new Error('ACCESS_TOKEN_REQUIRED');
  }

  try {
    const decoded = TokenUtils.verifyAccessToken(token);
    return decoded;
  } catch (error) {
    throw new Error('INVALID_TOKEN');
  }
}

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    let decoded;
    try {
      decoded = await authenticateUser(request);
    } catch (error: any) {
      if (error.message === 'ACCESS_TOKEN_REQUIRED') {
        return NextResponse.json(
          { error: 'Access token required' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Find user's cart
    const cart = await Cart.findOne({ userId: decoded.userId })
      .populate({
        path: 'items.productId',
        select: 'name slug price images stock isActive',
        populate: {
          path: 'categoryId',
          select: 'name slug'
        }
      });

    if (!cart) {
      return NextResponse.json(
        {
          cart: {
            items: [],
            totalItems: 0,
            uniqueItems: 0,
            totalAmount: 0
          }
        },
        { status: 200 }
      );
    }

    // Filter out inactive products and products that are out of stock
    const validItems = cart.items.filter((item: any) => {
      const product = item.productId as any;
      return product && product.isActive && product.stock > 0;
    });

    // Update cart if items were filtered out
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Calculate totals
    const totalItems = validItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const uniqueItems = validItems.length; // Number of unique products
    const totalAmount = validItems.reduce((sum: number, item: any) => sum + (item.quantity * item.priceSnapshot), 0);

    return NextResponse.json(
      {
        cart: {
          items: validItems,
          totalItems,
          uniqueItems,
          totalAmount
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get cart error:', error);

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

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    let decoded;
    try {
      decoded = await authenticateUser(request);
    } catch (error: any) {
      if (error.message === 'ACCESS_TOKEN_REQUIRED') {
        return NextResponse.json(
          { error: 'Access token required' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateCartItem(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { productId, quantity } = validation.data!;

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { 
          error: 'Insufficient stock',
          availableStock: product.stock 
        },
        { status: 400 }
      );
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ userId: decoded.userId });
    if (!cart) {
      cart = new Cart({ userId: decoded.userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { 
            error: 'Cannot add more items. Insufficient stock.',
            availableStock: product.stock,
            currentInCart: cart.items[existingItemIndex].quantity
          },
          { status: 400 }
        );
      }

      if (newQuantity > 50) {
        return NextResponse.json(
          { error: 'Cannot add more than 50 items of the same product' },
          { status: 400 }
        );
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].priceSnapshot = product.price; // Update with current price
    } else {
      // Add new item
      cart.items.push({
        productId: product._id,
        quantity,
        priceSnapshot: product.price
      });
    }

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.productId',
      select: 'name slug price images stock isActive',
      populate: {
        path: 'categoryId',
        select: 'name slug'
      }
    });

    // Calculate totals
    const totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const uniqueItems = cart.items.length; // Number of unique products
    const totalAmount = cart.items.reduce((sum: number, item: any) => sum + (item.quantity * item.priceSnapshot), 0);

    return NextResponse.json(
      {
        message: 'Item added to cart successfully',
        cart: {
          items: cart.items,
          totalItems,
          uniqueItems,
          totalAmount
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Add to cart error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: errors 
        },
        { status: 400 }
      );
    }

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

// PUT /api/cart - Update item quantity in cart
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    let decoded;
    try {
      decoded = await authenticateUser(request);
    } catch (error: any) {
      if (error.message === 'ACCESS_TOKEN_REQUIRED') {
        return NextResponse.json(
          { error: 'Access token required' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateCartItem(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { productId, quantity } = validation.data!;

    // Find user's cart
    const cart = await Cart.findOne({ userId: decoded.userId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    // Check product availability
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      // Remove item if product is not available
      cart.items.splice(itemIndex, 1);
      await cart.save();
      
      return NextResponse.json(
        { error: 'Product is no longer available and has been removed from cart' },
        { status: 400 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { 
          error: 'Insufficient stock',
          availableStock: product.stock 
        },
        { status: 400 }
      );
    }

    // Update item quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].priceSnapshot = product.price; // Update with current price

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.productId',
      select: 'name slug price images stock isActive',
      populate: {
        path: 'categoryId',
        select: 'name slug'
      }
    });

    // Calculate totals
    const totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const uniqueItems = cart.items.length; // Number of unique products
    const totalAmount = cart.items.reduce((sum: number, item: any) => sum + (item.quantity * item.priceSnapshot), 0);

    return NextResponse.json(
      {
        message: 'Cart updated successfully',
        cart: {
          items: cart.items,
          totalItems,
          uniqueItems,
          totalAmount
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Update cart error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: errors 
        },
        { status: 400 }
      );
    }

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

// DELETE /api/cart - Clear entire cart or remove specific item
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    let decoded;
    try {
      decoded = await authenticateUser(request);
    } catch (error: any) {
      if (error.message === 'ACCESS_TOKEN_REQUIRED') {
        return NextResponse.json(
          { error: 'Access token required' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    // Find user's cart
    const cart = await Cart.findOne({ userId: decoded.userId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    if (productId) {
      // Remove specific item
      if (!ValidationUtils.isValidObjectId(productId)) {
        return NextResponse.json(
          { error: 'Invalid product ID format' },
          { status: 400 }
        );
      }

      const itemIndex = cart.items.findIndex(
        (item: any) => item.productId.toString() === productId
      );

      if (itemIndex === -1) {
        return NextResponse.json(
          { error: 'Item not found in cart' },
          { status: 404 }
        );
      }

      cart.items.splice(itemIndex, 1);
      await cart.save();

      // Populate cart for response
      await cart.populate({
        path: 'items.productId',
        select: 'name slug price images stock isActive',
        populate: {
          path: 'categoryId',
          select: 'name slug'
        }
      });

      // Calculate totals
      const totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const uniqueItems = cart.items.length; // Number of unique products
      const totalAmount = cart.items.reduce((sum: number, item: any) => sum + (item.quantity * item.priceSnapshot), 0);

      return NextResponse.json(
        { 
          message: 'Item removed from cart successfully',
          cart: {
            items: cart.items,
            totalItems,
            uniqueItems,
            totalAmount
          }
        },
        { status: 200 }
      );
    } else {
      // Clear entire cart
      cart.items = [];
      await cart.save();

      return NextResponse.json(
        { 
          message: 'Cart cleared successfully',
          cart: {
            items: [],
            totalItems: 0,
            uniqueItems: 0,
            totalAmount: 0
          }
        },
        { status: 200 }
      );
    }

  } catch (error: any) {
    console.error('Delete cart error:', error);

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