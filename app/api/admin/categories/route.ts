import { NextRequest, NextResponse } from 'next/server';
import { connectDB, QueryUtils } from '@/lib/database';
import { Category } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { validateQueryParams } from '@/lib/services';

// GET /api/admin/categories - Admin only route to list all categories (including inactive)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const queryParams = validateQueryParams({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort: searchParams.get('sort'),
      order: searchParams.get('order'),
      search: searchParams.get('search')
    });

    // Additional filter parameters
    const isActive = searchParams.get('isActive');

    // Build query - Admin can see all categories
    let query: any = {};

    // Add active status filter
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

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

    // Get summary statistics for admin
    const [
      totalActiveCategories,
      totalInactiveCategories
    ] = await Promise.all([
      Category.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: false })
    ]);

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
        },
        filters: {
          isActive: isActive !== null ? isActive === 'true' : undefined,
          search: queryParams.search
        },
        summary: {
          totalActiveCategories,
          totalInactiveCategories
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get admin categories error:', error);

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