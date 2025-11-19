import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ValidationUtils } from '@/lib/database';
import { Product, Category } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { validateProduct, cloudinaryService } from '@/lib/services';

// GET /api/products/[id] - Public route to get single product
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
    const product = await Product.findById(id)
      .populate('categoryId', 'name slug')
      .lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // For public access, only return active products
    if (!(product as any).isActive) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { product },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get product error:', error);

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

// PUT /api/products/[id] - Admin only route to update product
export async function PUT(
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

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
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

    // Generate slug from name if it has changed
    let slug = existingProduct.slug; // Keep existing slug by default
    if (productData.name !== existingProduct.name) {
      const baseSlug = productData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .trim() || `product-${Date.now()}`; // Fallback if slug is empty

      // Check if slug already exists (excluding current product)
      slug = baseSlug;
      let slugCounter = 1;
      while (await Product.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${slugCounter}`;
        slugCounter++;
      }
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

    // Check if another product with same name exists (excluding current)
    const duplicateProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${validation.data!.name}$`, 'i') },
      _id: { $ne: id }
    });

    if (duplicateProduct) {
      return NextResponse.json(
        { error: 'Product with this name already exists' },
        { status: 409 }
      );
    }

    // Handle image uploads
    const newImages = formData.getAll('images') as File[];
    const keepImages = formData.get('keepImages') ? JSON.parse(formData.get('keepImages') as string) : [];
    
    let finalImageUrls = [...keepImages];

    // Upload new images if provided
    if (newImages && newImages.length > 0) {
      // Validate new image files
      const imageValidationErrors: string[] = [];
      for (let i = 0; i < newImages.length; i++) {
        const validation = cloudinaryService.validateImageFile(newImages[i]);
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

      // Upload new images to Cloudinary
      try {
        for (const image of newImages) {
          const dataUrl = await cloudinaryService.fileToDataUrl(image);
          const uploadResult = await cloudinaryService.uploadImage(dataUrl, {
            folder: 'papad-store/products',
            quality: 'auto:good',
            format: 'webp'
          });
          finalImageUrls.push(uploadResult.secureUrl);
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload images. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Ensure at least one image
    if (finalImageUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one product image is required' },
        { status: 400 }
      );
    }

    // Delete removed images from Cloudinary
    const removedImages = (existingProduct as any).images.filter((img: any) => !keepImages.includes(img));
    if (removedImages.length > 0) {
      try {
        const publicIds = removedImages.map((url: any) => cloudinaryService.extractPublicId(url)).filter(Boolean) as string[];
        if (publicIds.length > 0) {
          await cloudinaryService.deleteMultipleImages(publicIds);
        }
      } catch (deleteError) {
        console.error('Failed to delete old images:', deleteError);
        // Continue with update even if image deletion fails
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...productDataWithSlug,
        images: finalImageUrls,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('categoryId', 'name');

    return NextResponse.json(
      {
        message: 'Product updated successfully',
        product: updatedProduct
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Update product error:', error);

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

// DELETE /api/products/[id] - Admin only route to delete product
export async function DELETE(
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

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is in any carts or orders
    const { Cart, Order } = await import('@/lib/models');
    
    const [cartCount, orderCount] = await Promise.all([
      Cart.countDocuments({ 'items.productId': id }),
      Order.countDocuments({ 'items.productId': id })
    ]);
    
    if (cartCount > 0 || orderCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete product with existing cart items or orders',
          details: `This product is referenced in ${cartCount} cart(s) and ${orderCount} order(s). Consider deactivating the product instead.`
        },
        { status: 409 }
      );
    }

    // Delete product images from Cloudinary
    if ((product as any).images && (product as any).images.length > 0) {
      try {
        const publicIds = (product as any).images.map((url: any) => cloudinaryService.extractPublicId(url)).filter(Boolean) as string[];
        if (publicIds.length > 0) {
          await cloudinaryService.deleteMultipleImages(publicIds);
        }
      } catch (deleteError) {
        console.error('Failed to delete product images:', deleteError);
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete product
    await Product.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Delete product error:', error);

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