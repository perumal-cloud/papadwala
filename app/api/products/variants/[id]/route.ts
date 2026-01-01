import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ValidationUtils } from '@/lib/database';
import { Product } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { validateVariantProduct, cloudinaryService } from '@/lib/services';

// GET /api/products/variants/[id] - Public route to get single variant product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!ValidationUtils.isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Find product
    const product: any = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // For public access, only return active products with variants
    if (!product.isActive || !product.variants || product.variants.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate price range
    const prices: number[] = [];
    product.variants.forEach((variant: any) => {
      if (variant.isActive !== false && variant.weights) {
        variant.weights.forEach((weight: any) => {
          if (weight.isActive !== false) {
            prices.push(weight.price);
          }
        });
      }
    });

    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return NextResponse.json({
      product: {
        ...product,
        priceRange: minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`,
        minPrice,
        maxPrice
      }
    });

  } catch (error: any) {
    console.error('Get variant product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/variants/[id] - Admin only route to update variant product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!ValidationUtils.isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { images, ...productData } = body;

    // Validate product data
    const validation = validateVariantProduct(productData);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Find existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Handle images
    let allImageUrls: string[] = [];
    
    if (images && Array.isArray(images) && images.length > 0) {
      for (const imageData of images) {
        if (typeof imageData === 'string') {
          // Already a URL
          if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
            allImageUrls.push(imageData);
          }
        } else if (imageData.base64) {
          // Base64 image - upload to Cloudinary
          try {
            const uploadResult = await cloudinaryService.uploadImage(imageData.base64);
            if (uploadResult && uploadResult.url) {
              allImageUrls.push(uploadResult.url);
            }
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
          }
        }
      }
    } else {
      // Keep existing images
      allImageUrls = existingProduct.images;
    }

    if (allImageUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one product image is required' },
        { status: 400 }
      );
    }

    // Update product
    Object.assign(existingProduct, {
      ...validation.data!,
      images: allImageUrls
    });

    await existingProduct.save();

    return NextResponse.json({
      message: 'Product updated successfully',
      product: existingProduct
    });

  } catch (error: any) {
    console.error('Update variant product error:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this name or slug already exists' },
        { status: 409 }
      );
    }

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
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/variants/[id] - Admin only route to delete variant product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!ValidationUtils.isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Find and delete product
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Product deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete variant product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
