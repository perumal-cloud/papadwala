import { NextRequest, NextResponse } from 'next/server';
import { connectDB, QueryUtils } from '@/lib/database';
import { Product } from '@/lib/models';
import { TokenUtils } from '@/lib/auth';
import { validateQueryParams } from '@/lib/services';

// GET /api/admin/products - Admin only route to list all products (including inactive)
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
    const categoryId = searchParams.get('categoryId');
    const isActive = searchParams.get('isActive');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const lowStock = searchParams.get('lowStock');

    // Build query - Admin can see all products
    let query: any = {};

    // Add category filter
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Add active status filter
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Add featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Add low stock filter
    if (lowStock === 'true') {
      query.stock = { $lte: 10 }; // Consider products with 10 or less as low stock
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

    // Get summary statistics for admin
    const [
      totalActiveProducts,
      totalInactiveProducts,
      lowStockProducts,
      totalRevenue
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),
      Product.countDocuments({ stock: { $lte: 10 } }),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } }
      ])
    ]);

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
          isActive: isActive !== null ? isActive === 'true' : undefined,
          featured: featured === 'true',
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          lowStock: lowStock === 'true',
          search: queryParams.search
        },
        summary: {
          totalActiveProducts,
          totalInactiveProducts,
          lowStockProducts,
          totalInventoryValue: totalRevenue[0]?.total || 0
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get admin products error:', error);

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