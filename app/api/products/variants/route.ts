import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Product } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { validateVariantProduct, cloudinaryService } from '@/lib/services';

// POST /api/products/variants - Admin only route to create variant-based product
export async function POST(request: NextRequest) {
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

    // Handle images
    let allImageUrls: string[] = [];
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one product image is required' },
        { status: 400 }
      );
    }

    // Process images
    for (const imageData of images) {
      if (typeof imageData === 'string') {
        // Already a URL
        if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
          allImageUrls.push(imageData);
        } else {
          return NextResponse.json(
            { error: 'Invalid image URL format' },
            { status: 400 }
          );
        }
      } else if (imageData.base64) {
        // Base64 image - upload to Cloudinary
        try {
          const uploadResult = await cloudinaryService.uploadImage(imageData.base64);
          if (uploadResult && uploadResult.url) {
            allImageUrls.push(uploadResult.url);
          } else {
            return NextResponse.json(
              { error: 'Failed to upload image' },
              { status: 500 }
            );
          }
        } catch (uploadError: any) {
          return NextResponse.json(
            { error: `Failed to upload image: ${uploadError.message}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid image format' },
          { status: 400 }
        );
      }
    }

    // Create product with variants
    const product = new Product({
      ...validation.data!,
      images: allImageUrls
    });

    await product.save();

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Create variant product error:', error);

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
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// GET /api/products/variants - Public route to list variant-based products
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') === 'true';
    const isActive = searchParams.get('isActive') !== 'false'; // Default to true

    // Build query
    const query: any = { isActive };
    
    // Only return products with variants
    query.variants = { $exists: true, $not: { $size: 0 } };

    if (featured) {
      query.featured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Product.countDocuments(query)
    ]);

    // Calculate price ranges for each product
    const productsWithPriceRange = products.map(product => {
      const prices: number[] = [];
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant: any) => {
          if (variant.isActive !== false && variant.weights) {
            variant.weights.forEach((weight: any) => {
              if (weight.isActive !== false) {
                prices.push(weight.price);
              }
            });
          }
        });
      }

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      return {
        ...product,
        priceRange: minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`,
        minPrice,
        maxPrice
      };
    });

    return NextResponse.json({
      products: productsWithPriceRange,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });

  } catch (error: any) {
    console.error('Get variant products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
