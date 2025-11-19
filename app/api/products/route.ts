import { NextRequest, NextResponse } from 'next/server';
import { connectDB, QueryUtils } from '@/lib/database';
import { Product, Category } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { validateProduct, validateQueryParams, cloudinaryService } from '@/lib/services';

// GET /api/products - Public route to list products
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const queryParams = validateQueryParams({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort: searchParams.get('sort'),
      order: searchParams.get('order'),
      search: searchParams.get('search')
    });

    // Additional filter parameters
    const categoryId = searchParams.get('categoryId');
    const category = searchParams.get('category'); // This will be the category slug from frontend
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');

    // Build query
    let query: any = { isActive: true };

    // Add category filter
    if (categoryId) {
      query.categoryId = categoryId;
    } else if (category) {
      // Find category by slug and use its ID
      try {
        const categoryDoc = await Category.findOne({ slug: category, isActive: true });
        if (categoryDoc) {
          query.categoryId = categoryDoc._id;
        } else {
          // Return empty results if category doesn't exist
          return NextResponse.json(
            {
              products: [],
              pagination: {
                page: queryParams.page,
                limit: queryParams.limit,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false
              },
              filters: {
                categoryId,
                category,
                featured: featured === 'true',
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                inStock: inStock === 'true',
                search: queryParams.search
              }
            },
            { status: 200 }
          );
        }
      } catch (categoryError) {
        console.error('Error finding category:', categoryError);
      }
    }

    // Add featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Add stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Add search if provided
    if (queryParams.search) {
      query.$text = { $search: queryParams.search };
    }

    // Build sort options
    const sortOptions: { [key: string]: 1 | -1 } = QueryUtils.buildSortOptions(queryParams.sort, queryParams.order) as { [key: string]: 1 | -1 };

    // Execute query with pagination
    const products = await Product.find(query)
      .populate('categoryId', 'name slug')
      .sort(sortOptions)
      .limit(queryParams.limit)
      .skip((queryParams.page - 1) * queryParams.limit)
      .lean();

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / queryParams.limit);

    return NextResponse.json(
      {
        products,
        pagination: {
          page: queryParams.page,
          limit: queryParams.limit,
          total: totalProducts,
          totalPages,
          hasNext: queryParams.page < totalPages,
          hasPrev: queryParams.page > 1
        },
        filters: {
          categoryId,
          category,
          featured: featured === 'true',
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          inStock: inStock === 'true',
          search: queryParams.search
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get products error:', error);

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

// POST /api/products - Admin only route to create product
export async function POST(request: NextRequest) {
  try {
    await connectDB();

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

    // Parse form data (for file uploads)
    const formData = await request.formData();
    
    // Extract product data
    const productData = {
      name: formData.get('name') as string,
      categoryId: formData.get('categoryId') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      compareAtPrice: formData.get('compareAtPrice') ? parseFloat(formData.get('compareAtPrice') as string) : undefined,
      stock: parseInt(formData.get('stock') as string),
      weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
      ingredients: formData.get('ingredients') ? JSON.parse(formData.get('ingredients') as string) : undefined,
      nutritionInfo: formData.get('nutritionInfo') ? JSON.parse(formData.get('nutritionInfo') as string) : undefined,
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : undefined,
      isActive: formData.get('isActive') ? formData.get('isActive') === 'true' : true,
      featured: formData.get('featured') ? formData.get('featured') === 'true' : false
    };

    // Generate slug from name
    const baseSlug = productData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .trim() || `product-${Date.now()}`; // Fallback if slug is empty

    // Check if slug already exists and make it unique
    let slug = baseSlug;
    let slugCounter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Add slug to product data
    const productDataWithSlug = {
      ...productData,
      slug
    };

    // Validate product data
    const validation = validateProduct(productDataWithSlug);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await Category.findById(productData.categoryId);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    const uploadedImageUrls = formData.get('uploadedImageUrls');
    
    // Parse uploaded URLs if they exist
    let existingImageUrls: string[] = [];
    if (uploadedImageUrls) {
      try {
        existingImageUrls = JSON.parse(uploadedImageUrls as string);
      } catch (e) {
        // If parsing fails, ignore and continue
      }
    }

    // Check if we have any images at all
    if ((!images || images.length === 0) && existingImageUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one product image is required' },
        { status: 400 }
      );
    }

    // Validate image files (only if there are files to validate)
    const imageValidationErrors: string[] = [];
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const validation = cloudinaryService.validateImageFile(images[i]);
        if (!validation.isValid) {
          imageValidationErrors.push(`Image ${i + 1}: ${validation.errors.join(', ')}`);
        }
      }

      if (imageValidationErrors.length > 0) {
        return NextResponse.json(
          { 
            error: 'Image validation failed',
            details: imageValidationErrors 
          },
          { status: 400 }
        );
      }
    }

    // Upload new images to Cloudinary (if any)
    const newImageUrls: string[] = [];
    if (images && images.length > 0) {
      try {
        for (const image of images) {
          const dataUrl = await cloudinaryService.fileToDataUrl(image);
          const uploadResult = await cloudinaryService.uploadImage(dataUrl, {
            folder: 'papad-store/products',
            quality: 'auto:good',
            format: 'webp'
          });
          newImageUrls.push(uploadResult.secureUrl);
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload images. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Combine existing uploaded URLs with new uploads
    const allImageUrls = [...existingImageUrls, ...newImageUrls];

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${validation.data!.name}$`, 'i') } 
    });

    if (existingProduct) {
      // Clean up uploaded images (only the newly uploaded ones)
      try {
        const publicIds = newImageUrls.map(url => cloudinaryService.extractPublicId(url)).filter(Boolean) as string[];
        if (publicIds.length > 0) {
          await cloudinaryService.deleteMultipleImages(publicIds);
        }
      } catch (cleanupError) {
        console.error('Failed to clean up images:', cleanupError);
      }

      return NextResponse.json(
        { error: 'Product with this name already exists' },
        { status: 409 }
      );
    }

    // Create product
    const product = new Product({
      ...validation.data!,
      images: allImageUrls
    });

    await product.save();

    // Populate category for response
    await product.populate('categoryId', 'name slug');

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Create product error:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this name already exists' },
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
      { 
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message 
      },
      { status: 500 }
    );
  }
}