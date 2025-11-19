import { NextRequest, NextResponse } from 'next/server';
import { createAuthMiddleware } from '@/lib/auth/middleware';
import { Product, Order, User } from '@/lib/models';
import connectDB from '@/lib/database/connection';

const authMiddleware = createAuthMiddleware({
  required: true,
  roles: ['admin']
});

async function getDashboardStats() {
  await connectDB();

  try {
    // Get counts
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    // Calculate total revenue
    const revenueAggregation = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAggregation[0]?.total || 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber total status createdAt userId');

    // Get low stock products (stock < 10)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .sort({ stock: 1 })
      .limit(10)
      .select('name stock price');

    // Get orders by status for chart
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Generate last 6 months with proper data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const monthData = monthlyRevenue.find(item => 
        item._id.year === year && item._id.month === month
      );

      monthlyData.push({
        month: monthNames[month - 1],
        revenue: monthData?.revenue || 0,
        orders: monthData?.orders || 0
      });
    }

    // Get order stats by status
    const orderStatsAgg = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$total' }
        }
      }
    ]);

    const orderStats = {
      pending: { count: 0, amount: 0 },
      confirmed: { count: 0, amount: 0 },
      processing: { count: 0, amount: 0 },
      shipped: { count: 0, amount: 0 },
      delivered: { count: 0, amount: 0 },
      completed: { count: 0, amount: 0 },
      cancelled: { count: 0, amount: 0 },
      refunded: { count: 0, amount: 0 }
    };

    orderStatsAgg.forEach(stat => {
      const status = stat._id as keyof typeof orderStats;
      if (orderStats[status]) {
        orderStats[status].count = stat.count;
        orderStats[status].amount = stat.amount;
      }
    });

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalSold: 1,
          revenue: 1,
          image: '$product.images.0'
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    return {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders: recentOrders.map(order => ({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: order.userId?.name || 'Unknown',
        customerEmail: order.userId?.email || '',
        amount: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString()
      })),
      lowStockProducts: lowStockProducts.map(product => ({
        id: product._id.toString(),
        name: product.name,
        stock: product.stock,
        price: product.price
      })),
      monthlyData,
      orderStats,
      topProducts
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    throw error;
  }
}

async function handler(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = (request: NextRequest) => authMiddleware(request, handler);