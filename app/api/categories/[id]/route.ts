import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ValidationUtils } from '@/lib/database';
import { Category } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { validateCategory, validateCategoryPartial } from '@/lib/services';

// GET /api/categories/[id] - Public route to get single category
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
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // For public access, only return active categories
    if (!category.isActive) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { category },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get category error:', error);

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

// PUT /api/categories/[id] - Admin only route to update category
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
        { error: 'Invalid category ID format' },
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

    // Parse and validate request body
    const body = await request.json();
    const validation = validateCategoryPartial(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const updateData = validation.data!;

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if another category with same name exists (only if name is being updated)
    if (updateData.name) {
      const duplicateCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: id }
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update category with only the provided fields
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        message: 'Category updated successfully',
        category: updatedCategory
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Update category error:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
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

// DELETE /api/categories/[id] - Admin only route to delete category
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
        { error: 'Invalid category ID format' },
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

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has associated products
    const { Product } = await import('@/lib/models');
    const productCount = await Product.countDocuments({ categoryId: id });
    
    if (productCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with associated products',
          details: `This category has ${productCount} associated products. Please move or delete the products first.`
        },
        { status: 409 }
      );
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Delete category error:', error);

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