import { NextRequest, NextResponse } from 'next/server';
import { connectDB, QueryUtils } from '@/lib/database';
import { Category } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { validateCategory, validateQueryParams } from '@/lib/services';

// GET /api/categories - Public route to list categories
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

    // Build query
    let query: any = {};
    
    // Only show active categories for public access
    query.isActive = true;

    // Add search if provided
    if (queryParams.search) {
      query = {
        ...query,
        ...QueryUtils.buildSearchQuery(queryParams.search, ['name', 'description'])
      };
    }

    // Build sort options
    const sortOptions: { [key: string]: 1 | -1 } = QueryUtils.buildSortOptions(queryParams.sort, queryParams.order) as { [key: string]: 1 | -1 };

    // Execute query with pagination
    const categories = await Category.find(query)
      .sort(sortOptions)
      .limit(queryParams.limit)
      .skip((queryParams.page - 1) * queryParams.limit)
      .lean();

    // Get total count for pagination
    const totalCategories = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalCategories / queryParams.limit);

    return NextResponse.json(
      {
        categories,
        pagination: {
          page: queryParams.page,
          limit: queryParams.limit,
          total: totalCategories,
          totalPages,
          hasNext: queryParams.page < totalPages,
          hasPrev: queryParams.page > 1
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get categories error:', error);

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

// POST /api/categories - Admin only route to create category
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

    // Parse and validate request body
    const body = await request.json();
    const validation = validateCategory(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { name, description, isActive } = validation.data!;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .trim() || `category-${Date.now()}`; // Fallback if slug is empty

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    // Check if slug already exists
    const existingSlug = await Category.findOne({ slug });
    let finalSlug = slug;
    if (existingSlug) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Create category
    const category = new Category({
      name,
      slug: finalSlug,
      description,
      isActive
    });

    await category.save();

    return NextResponse.json(
      {
        message: 'Category created successfully',
        category
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Create category error:', error);

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