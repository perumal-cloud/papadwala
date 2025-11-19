import { NextRequest, NextResponse } from 'next/server';
import { createAuthMiddleware } from '@/lib/auth/middleware';
import { Product, Order, User } from '@/lib/models';
import connectDB from '@/lib/database/connection';

const authMiddleware = createAuthMiddleware({
  required: true,
  roles: ['admin']
});

async function getAnalyticsData(period: number = 30) {
  await connectDB();

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - period);

    const previousStartDate = new Date();
    previousStartDate.setDate(startDate.getDate() - period);

    // Current period data
    const currentOrders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Previous period data for comparison
    const previousOrders = await Order.find({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });

    // Calculate revenue
    const currentRevenue = currentOrders
      .filter(order => ['completed', 'delivered'].includes(order.status))
      .reduce((sum, order) => sum + order.total, 0);

    const previousRevenue = previousOrders
      .filter(order => ['completed', 'delivered'].includes(order.status))
      .reduce((sum, order) => sum + order.total, 0);

    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : currentRevenue > 0 ? 100 : 0;

    // Calculate orders
    const currentOrdersCount = currentOrders.length;
    const previousOrdersCount = previousOrders.length;
    const ordersGrowth = previousOrdersCount > 0 
      ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100 
      : currentOrdersCount > 0 ? 100 : 0;

    // Order status breakdown
    const orderStatusCounts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
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

    orderStatusCounts.forEach(stat => {
      const status = stat._id as keyof typeof orderStats;
      if (orderStats[status]) {
        orderStats[status].count = stat.count;
        orderStats[status].amount = stat.totalAmount;
      }
    });

    // Total orders and amounts
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    const allTimeRevenue = totalRevenue[0]?.total || 0;

    // Calculate customers
    const currentCustomers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      role: 'customer'
    });

    const previousCustomers = await User.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate },
      role: 'customer'
    });

    const customersGrowth = previousCustomers > 0 
      ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 
      : currentCustomers > 0 ? 100 : 0;

    // Monthly revenue data (last 6 months)
    const monthlyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { 
            $sum: {
              $cond: {
                if: { $in: ['$status', ['completed', 'delivered']] },
                then: '$total',
                else: 0
              }
            }
          },
          orders: { $sum: 1 },
          completedOrders: {
            $sum: {
              $cond: {
                if: { $in: ['$status', ['completed', 'delivered']] },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Generate last 6 months with proper data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const monthlyRevenue = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const monthData = monthlyData.find(item => 
        item._id.year === year && item._id.month === month
      );

      monthlyRevenue.push({
        month: monthNames[month - 1],
        revenue: monthData?.revenue || 0,
        orders: monthData?.orders || 0,
        completedOrders: monthData?.completedOrders || 0
      });
    }

    // Top products by sales
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
      {
        $project: {
          id: '$_id',
          name: 1,
          sales: 1,
          revenue: 1,
          _id: 0
        }
      }
    ]);

    // Customer segments
    const totalUsers = await User.countDocuments({ role: 'user' });
    const newCustomers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      role: 'user'
    });

    const returningCustomers = await Order.aggregate([
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 }
        }
      },
      {
        $match: { orderCount: { $gt: 1 } }
      },
      {
        $count: 'returningCustomers'
      }
    ]);

    const returningCustomersCount = returningCustomers[0]?.returningCustomers || 0;

    // VIP customers (customers with high order value)
    const vipCustomers = await Order.aggregate([
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$total' }
        }
      },
      {
        $match: { totalSpent: { $gte: 10000 } } // VIP threshold
      },
      {
        $count: 'vipCustomers'
      }
    ]);

    const vipCustomersCount = vipCustomers[0]?.vipCustomers || 0;

    const customerSegments = [
      {
        segment: 'New Customers',
        count: newCustomers,
        percentage: totalUsers > 0 ? (newCustomers / totalUsers) * 100 : 0
      },
      {
        segment: 'Returning Customers',
        count: returningCustomersCount,
        percentage: totalUsers > 0 ? (returningCustomersCount / totalUsers) * 100 : 0
      },
      {
        segment: 'VIP Customers',
        count: vipCustomersCount,
        percentage: totalUsers > 0 ? (vipCustomersCount / totalUsers) * 100 : 0
      }
    ];

    // Traffic sources (you can replace this with real analytics integration)
    const trafficSources = [
      { source: 'Direct', visitors: Math.floor(Math.random() * 800) + 400, percentage: 35.0 },
      { source: 'Organic Search', visitors: Math.floor(Math.random() * 600) + 300, percentage: 25.0 },
      { source: 'Social Media', visitors: Math.floor(Math.random() * 400) + 200, percentage: 20.0 },
      { source: 'Email', visitors: Math.floor(Math.random() * 300) + 100, percentage: 15.0 },
      { source: 'Ads', visitors: Math.floor(Math.random() * 200) + 50, percentage: 5.0 }
    ];

    return {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        growth: revenueGrowth
      },
      orders: {
        current: currentOrdersCount,
        previous: previousOrdersCount,
        growth: ordersGrowth
      },
      customers: {
        current: currentCustomers,
        previous: previousCustomers,
        growth: customersGrowth
      },
      orderStats,
      totalStats: {
        totalOrders,
        allTimeRevenue,
        confirmedOrders: orderStats.confirmed.count,
        confirmedAmount: orderStats.confirmed.amount,
        completedOrders: orderStats.completed.count + orderStats.delivered.count,
        completedAmount: orderStats.completed.amount + orderStats.delivered.amount
      },
      monthlyRevenue,
      topProducts,
      customerSegments,
      trafficSources
    };

  } catch (error) {
    console.error('Analytics data error:', error);
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
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');

    const analyticsData = await getAnalyticsData(period);

    return NextResponse.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data' 
      },
      { status: 500 }
    );
  }
}

export const GET = (request: NextRequest) => authMiddleware(request, handler);