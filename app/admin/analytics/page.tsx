'use client';

import { useEffect, useState } from 'react';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  orders: {
    current: number;
    previous: number;
    growth: number;
  };
  customers: {
    current: number;
    previous: number;
    growth: number;
  };
  orderStats: {
    pending: { count: number; amount: number };
    confirmed: { count: number; amount: number };
    processing: { count: number; amount: number };
    shipped: { count: number; amount: number };
    delivered: { count: number; amount: number };
    completed: { count: number; amount: number };
    cancelled: { count: number; amount: number };
    refunded: { count: number; amount: number };
  };
  totalStats: {
    totalOrders: number;
    allTimeRevenue: number;
    confirmedOrders: number;
    confirmedAmount: number;
    completedOrders: number;
    completedAmount: number;
  };
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
    completedOrders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // days
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAuthError(true);
      setIsLoading(false);
      return;
    }
    
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No access token found');
      }
      
      const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login or handle authentication error
          localStorage.removeItem('accessToken');
          window.location.href = '/auth/login';
          return;
        }
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (authError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Authentication Required</h3>
            <p className="text-yellow-600 mb-4">Please log in to access analytics data.</p>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Analytics</h3>
            <p className="text-red-600 mb-4">Unable to fetch analytics data. Please try again.</p>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your store's performance and insights</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.revenue.current)}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${analytics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.revenue.growth)}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs previous period</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-500 bg-opacity-10">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
              <p className="text-3xl font-bold text-gray-900">{analytics.orders.current}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${analytics.orders.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.orders.growth)}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs previous period</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500 bg-opacity-10">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">New Customers</h3>
              <p className="text-3xl font-bold text-gray-900">{analytics.customers.current}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${analytics.customers.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.customers.growth)}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs previous period</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-500 bg-opacity-10">
              <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Period Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Period Summary (Last {selectedPeriod} days)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {analytics.monthlyRevenue.reduce((sum, month) => sum + month.orders, 0)}
            </div>
            <div className="text-sm text-blue-700">Total Orders</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {analytics.monthlyRevenue.reduce((sum, month) => sum + month.completedOrders, 0)}
            </div>
            <div className="text-sm text-green-700">Completed Orders</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(analytics.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0))}
            </div>
            <div className="text-sm text-purple-700">Total Revenue</div>
          </div>
          <div className="text-center p-4 bg-teal-50 rounded-lg">
            <div className="text-2xl font-bold text-teal-900">
              {analytics.monthlyRevenue.length > 0 ? 
                Math.round(analytics.monthlyRevenue.reduce((sum, month) => sum + month.orders, 0) / analytics.monthlyRevenue.length) : 0}
            </div>
            <div className="text-sm text-teal-700">Avg Orders/Month</div>
          </div>
        </div>
      </div>

      {/* Revenue and Orders Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Trend Line</h2>
          <div className="h-80 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 relative overflow-hidden">
            {/* Chart SVG */}
            <svg viewBox="0 0 600 250" className="w-full h-full">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <g key={i}>
                  <line
                    x1={i * 100 + 70}
                    y1={30}
                    x2={i * 100 + 70}
                    y2={220}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.6"
                  />
                  <line
                    x1={50}
                    y1={30 + i * 32}
                    x2={570}
                    y2={30 + i * 32}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.4"
                  />
                </g>
              ))}
              
              {/* Area under the line */}
              <path
                d={(() => {
                  const maxRevenue = Math.max(...analytics.monthlyRevenue.map(m => m.revenue), 1000);
                  const points = analytics.monthlyRevenue.map((month, index) => {
                    const x = index * 100 + 70;
                    const y = 210 - ((month.revenue / maxRevenue) * 160);
                    return `${x},${y}`;
                  }).join(' L ');
                  return `M 70,210 L ${points} L ${(analytics.monthlyRevenue.length - 1) * 100 + 70},210 Z`;
                })()}
                fill="url(#areaGradient)"
                className="opacity-40"
              />
              
              {/* Revenue Line with animation */}
              <path
                d={(() => {
                  const maxRevenue = Math.max(...analytics.monthlyRevenue.map(m => m.revenue), 1000);
                  const points = analytics.monthlyRevenue.map((month, index) => {
                    const x = index * 100 + 70;
                    const y = 210 - ((month.revenue / maxRevenue) * 160);
                    return `${x},${y}`;
                  }).join(' L ');
                  return `M ${points}`;
                })()}
                fill="none"
                stroke="url(#revenueGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-lg"
                style={{
                  strokeDasharray: "1000",
                  strokeDashoffset: "1000",
                  animation: "drawLine 2s ease-in-out forwards"
                }}
              />
              
              {/* Data Points with animation */}
              {analytics.monthlyRevenue.map((month, index) => {
                const maxRevenue = Math.max(...analytics.monthlyRevenue.map(m => m.revenue), 1000);
                const x = index * 100 + 70;
                const y = 210 - ((month.revenue / maxRevenue) * 160);
                
                return (
                  <g key={index}>
                    {/* Outer glow circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      opacity="0.3"
                      className="animate-pulse"
                    />
                    {/* Main circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="white"
                      stroke="#10b981"
                      strokeWidth="3"
                      className="hover:r-7 transition-all duration-300 cursor-pointer drop-shadow-md"
                      style={{
                        animation: `fadeInPoint 0.5s ease-out ${index * 0.2}s both`
                      }}
                    />
                    {/* Inner dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r="2"
                      fill="#10b981"
                    />
                    
                    {/* Value labels */}
                    <text
                      x={x}
                      y={y - 20}
                      textAnchor="middle"
                      className="text-xs font-bold fill-green-800"
                      style={{
                        animation: `fadeInText 0.5s ease-out ${index * 0.2 + 0.5}s both`,
                        opacity: 0
                      }}
                    >
                      {formatCurrency(month.revenue)}
                    </text>
                    
                    {/* Month labels */}
                    <text
                      x={x}
                      y={240}
                      textAnchor="middle"
                      className="text-sm font-semibold fill-gray-700"
                    >
                      {month.month}
                    </text>
                  </g>
                );
              })}
              
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* CSS Animations */}
            <style jsx>{`
              @keyframes drawLine {
                to {
                  stroke-dashoffset: 0;
                }
              }
              
              @keyframes fadeInPoint {
                from {
                  opacity: 0;
                  transform: scale(0);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              
              @keyframes fadeInText {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
            
            {/* Chart Legend */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-green-200 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                <span className="text-xs font-semibold text-gray-700">Revenue Trend</span>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Total: {formatCurrency(analytics.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0))}
              </div>
            </div>
            
            {/* Chart Stats */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-green-200 shadow-lg">
              <div className="text-xs text-gray-600 mb-1">Trend Analysis</div>
              <div className="flex items-center space-x-3">
                <div className="text-xs">
                  <span className="text-green-600 font-semibold">Peak:</span> {
                    (() => {
                      const maxMonth = analytics.monthlyRevenue.reduce((max, month) => 
                        month.revenue > max.revenue ? month : max
                      );
                      return `${maxMonth.month} ${formatCurrency(maxMonth.revenue)}`;
                    })()
                  }
                </div>
                <div className="text-xs">
                  <span className="text-blue-600 font-semibold">Avg:</span> {
                    formatCurrency(analytics.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0) / analytics.monthlyRevenue.length)
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Orders</h2>
          <div className="h-80 flex items-end justify-between space-x-1 bg-gray-50 rounded-lg p-4">
            {analytics.monthlyRevenue.map((month, index) => {
              const maxOrders = Math.max(...analytics.monthlyRevenue.map(m => m.orders));
              // Calculate height as percentage of chart area (max 85% to leave space)
              const height = maxOrders > 0 ? Math.max((month.orders / maxOrders) * 85, month.orders > 0 ? 8 : 3) : 3;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex flex-col items-center w-full h-72">
                    {/* Value label above bar */}
                  
                    <div className="flex-1 flex items-end w-full">
                      <div 
                        className={`w-full rounded-t-md transition-all duration-500 hover:scale-105 cursor-pointer shadow-sm ${
                          month.orders > 0 
                            ? 'bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500' 
                            : 'bg-gray-300'
                        }`}
                        style={{ height: `${height}%`, minHeight: month.orders > 0 ? '24px' : '12px' }}
                        title={`${month.month}: ${month.orders} total orders, ${month.completedOrders} completed`}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-xs font-medium text-gray-700">{month.month}</div>
                    <div className="text-sm font-bold text-blue-900">{month.orders}</div>
                    <div className="text-xs text-gray-600">{month.completedOrders} completed</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(analytics.orderStats).map(([status, data]) => (
              <div key={status} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    status === 'confirmed' ? 'bg-green-500' :
                    status === 'pending' ? 'bg-yellow-500' :
                    status === 'processing' ? 'bg-blue-500' :
                    status === 'shipped' ? 'bg-purple-500' :
                    status === 'delivered' ? 'bg-emerald-500' :
                    status === 'completed' ? 'bg-teal-500' :
                    status === 'cancelled' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{status}</p>
                    <p className="text-sm text-gray-600">{data.count} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(data.amount)}</p>
                  <p className="text-sm text-gray-600">Total Value</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Order Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Order Metrics</h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-green-800">Confirmed Orders</h3>
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-green-900">{analytics.totalStats.confirmedOrders}</p>
              <p className="text-sm text-green-700 mt-1">
                Total Amount: {formatCurrency(analytics.totalStats.confirmedAmount)}
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-blue-800">Completed Orders</h3>
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-blue-900">{analytics.totalStats.completedOrders}</p>
              <p className="text-sm text-blue-700 mt-1">
                Total Amount: {formatCurrency(analytics.totalStats.completedAmount)}
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-purple-800">All Time Stats</h3>
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-purple-900">{analytics.totalStats.totalOrders}</p>
              <p className="text-sm text-purple-700 mt-1">
                Total Revenue: {formatCurrency(analytics.totalStats.allTimeRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Selling Products</h2>
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-600 rounded-full text-sm font-medium">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.sales} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Segments</h2>
          <div className="space-y-4">
            {analytics.customerSegments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{segment.segment}</span>
                    <span className="text-sm text-gray-600">{segment.count} customers</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${segment.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{segment.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Traffic Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {analytics.trafficSources.map((source, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">{source.visitors}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">{source.source}</div>
              <div className="text-xs text-gray-500">{source.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium mb-1">Average Order Value</div>
            <div className="text-xl font-bold text-blue-900">
              {analytics.orders.current > 0 
                ? formatCurrency(analytics.revenue.current / analytics.orders.current)
                : formatCurrency(0)
              }
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium mb-1">Conversion Rate</div>
            <div className="text-xl font-bold text-green-900">
              {(() => {
                const totalVisitors = analytics.trafficSources.reduce((sum, source) => sum + source.visitors, 0);
                return totalVisitors > 0 
                  ? ((analytics.orders.current / totalVisitors) * 100).toFixed(1)
                  : '0.0';
              })()}%
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium mb-1">Customer Lifetime Value</div>
            <div className="text-xl font-bold text-purple-900">
              {analytics.customers.current > 0 
                ? formatCurrency(analytics.revenue.current / analytics.customers.current * 3)
                : formatCurrency(0)
              }
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg">
            <div className="text-sm text-teal-600 font-medium mb-1">Monthly Growth</div>
            <div className="text-xl font-bold text-teal-900">
              {formatPercentage((analytics.revenue.growth + analytics.orders.growth + analytics.customers.growth) / 3)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}