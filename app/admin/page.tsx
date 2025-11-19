'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Package, AlertTriangle, Eye } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    price: number;
  }>;
  monthlyData?: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  orderStats?: {
    pending: { count: number; amount: number };
    confirmed: { count: number; amount: number };
    processing: { count: number; amount: number };
    delivered: { count: number; amount: number };
    cancelled: { count: number; amount: number };
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number | null | undefined) => {
    // Handle null, undefined, or NaN values
    if (amount == null || isNaN(Number(amount))) {
      return '₹0.00';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
    
      {/* Enhanced Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">Total Products</p>
              <p className="text-3xl font-bold text-blue-900 mb-2">{stats?.totalProducts || 0}</p>
              <div className="flex items-center">
                <div className="flex items-center text-sm text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
                  <Package className="w-3 h-3 mr-1" />
                  Active
                </div>
              </div>
            </div>
            <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-green-900 mb-2">{stats?.totalOrders || 0}</p>
              <div className="flex items-center">
                <div className="flex items-center text-sm text-green-700 bg-green-200 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  This month
                </div>
              </div>
            </div>
            <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-1">Total Users</p>
              <p className="text-3xl font-bold text-purple-900 mb-2">{stats?.totalUsers || 0}</p>
              <div className="flex items-center">
                <div className="flex items-center text-sm text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
                  <Users className="w-3 h-3 mr-1" />
                  Registered
                </div>
              </div>
            </div>
            <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl shadow-lg border border-teal-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-teal-900 mb-2">{formatCurrency(stats?.totalRevenue || 0)}</p>
              <div className="flex items-center">
                <div className="flex items-center text-sm text-teal-700 bg-teal-200 px-2 py-1 rounded-full">
                  <DollarSign className="w-3 h-3 mr-1" />
                  All time
                </div>
              </div>
            </div>
            <div className="w-14 h-14 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Revenue Trend</h3>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
              Last 6 months
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.monthlyData || [
                  { month: 'May', revenue: 0, orders: 0 },
                  { month: 'Jun', revenue: 0, orders: 0 },
                  { month: 'Jul', revenue: 0, orders: 0 },
                  { month: 'Aug', revenue: 0, orders: 0 },
                  { month: 'Sep', revenue: 0, orders: 0 },
                  { month: 'Oct', revenue: 0, orders: 0 },
                ]}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Order Status</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Eye className="w-4 h-4 mr-1" />
              Current period
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Delivered', value: stats?.orderStats?.delivered?.count || 0, color: '#10b981' },
                    { name: 'Processing', value: stats?.orderStats?.processing?.count || 0, color: '#3b82f6' },
                    { name: 'Pending', value: stats?.orderStats?.pending?.count || 0, color: '#f59e0b' },
                    { name: 'Cancelled', value: stats?.orderStats?.cancelled?.count || 0, color: '#ef4444' }
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: 'Delivered', value: stats?.orderStats?.delivered?.count || 0, color: '#10b981' },
                    { name: 'Processing', value: stats?.orderStats?.processing?.count || 0, color: '#3b82f6' },
                    { name: 'Pending', value: stats?.orderStats?.pending?.count || 0, color: '#f59e0b' },
                    { name: 'Cancelled', value: stats?.orderStats?.cancelled?.count || 0, color: '#ef4444' }
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Delivered ({stats?.orderStats?.delivered?.count || 0})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Processing ({stats?.orderStats?.processing?.count || 0})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>Pending ({stats?.orderStats?.pending?.count || 0})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Cancelled ({stats?.orderStats?.cancelled?.count || 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ShoppingBag className="w-5 h-5 text-blue-500 mr-2" />
                  Recent Orders
                </h2>
                <Link 
                  href="/admin/orders" 
                  className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors bg-teal-50 px-3 py-1 rounded-full"
                >
                  View All
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-gray-100 hover:to-blue-100 transition-all duration-200 border border-gray-100 hover:shadow-md">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg flex items-center justify-center shadow-sm">
                          <ShoppingBag className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-600 font-medium">{order.customerName}</p>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">{formatCurrency(order.amount)}</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} shadow-sm`}>
                          {order.status === 'completed' || order.status === 'delivered' ? (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : order.status === 'pending' ? (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No recent orders</p>
                  <p className="text-gray-400 text-sm">Orders will appear here once customers start purchasing</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alert - Takes 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  Stock Alert
                </h2>
                <Link 
                  href="/admin/products" 
                  className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Manage
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-teal-50 border border-red-200 rounded-lg hover:shadow-md transition-all duration-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">{formatCurrency(product.price)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          product.stock <= 2 
                            ? 'bg-red-100 text-red-800' 
                            : product.stock <= 5 
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {product.stock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-green-600 font-medium text-lg">All Good!</p>
                  <p className="text-gray-500 text-sm">All products have sufficient stock</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 text-teal-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h2>
          <div className="text-sm text-gray-500">
            Manage your store efficiently
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/products/add"
            className="group bg-gradient-to-br from-teal-100 to-teal-200 hover:from-teal-200 hover:to-teal-300 border-2 border-teal-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-teal-300 rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Add Product</h3>
              <p className="text-sm text-gray-600">Create new product listing</p>
            </div>
          </Link>
          
          <Link
            href="/admin/orders"
            className="group bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border-2 border-blue-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-300 rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Manage Orders</h3>
              <p className="text-sm text-gray-600">View and update orders</p>
            </div>
          </Link>
          
          <Link
            href="/admin/users"
            className="group bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 border-2 border-purple-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-300 rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage customers</p>
            </div>
          </Link>
          
          <Link
            href="/admin/analytics"
            className="group bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 border-2 border-green-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-300 rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">View Analytics</h3>
              <p className="text-sm text-gray-600">Sales and performance data</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}