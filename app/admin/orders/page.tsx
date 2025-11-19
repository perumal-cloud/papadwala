'use client';

import { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/auth/ApiClient';
import { 
  ORDER_STATUSES, 
  ORDER_STATUS_LABELS, 
  ORDER_STATUS_COLORS, 
  type OrderStatus 
} from '@/lib/constants/orderStatus';
import Link from 'next/link';

interface TrackingInfo {
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  currentLocation?: string;
  expectedDelivery?: string;
  deliveryAttempts?: {
    attemptDate: string;
    status: 'successful' | 'failed' | 'rescheduled';
    notes?: string;
    location?: string;
  }[];
}

interface StatusHistory {
  status: OrderStatus;
  timestamp: string;
  notes?: string;
  updatedBy?: string;
  location?: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  userDetails?: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingInfo?: TrackingInfo;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  shippedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  adminNotes?: string;
  customerNotes?: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await ApiClient.get('/api/admin/orders');

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders:', await response.text());
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    try {
      const payload: any = {
        orderId,
        status: newStatus
      };

      if (trackingNumber) {
        payload.trackingNumber = trackingNumber;
      }

      const response = await ApiClient.put('/api/admin/orders', payload);

      if (response.ok) {
        // Update local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { 
                  ...order, 
                  status: newStatus as OrderStatus,
                  trackingInfo: trackingNumber 
                    ? { ...order.trackingInfo, trackingNumber } 
                    : order.trackingInfo
                }
              : order
          )
        );
      } else {
        const error = await response.json();
        console.error('Failed to update order status:', error);
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: 'pending' | 'paid' | 'failed') => {
    try {
      const response = await ApiClient.makeRequest(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: newPaymentStatus
        }),
      });

      if (response.ok) {
        // Update local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
          )
        );
      } else {
        const error = await response.json();
        console.error('Failed to update payment status:', error);
        alert(`Failed to update payment status: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (newStatus === ORDER_STATUSES.SHIPPED) {
      const trackingNumber = prompt('Enter tracking number:');
      if (trackingNumber) {
        updateOrderStatus(orderId, newStatus, trackingNumber);
      }
    } else {
      updateOrderStatus(orderId, newStatus);
    }
  };

  const handlePaymentStatusChange = (orderId: string, newPaymentStatus: 'pending' | 'paid' | 'failed') => {
    updatePaymentStatus(orderId, newPaymentStatus);
  };

  // Filter orders based on search term and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
        <p className="text-gray-600">Manage and track customer orders</p>
      </div>

 {/* Summary Stats */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === ORDER_STATUSES.PENDING).length}
          </div>
          <div className="text-sm text-gray-500">Pending Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === ORDER_STATUSES.DELIVERED).length}
          </div>
          <div className="text-sm text-gray-500">Delivered Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}
          </div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by order number, customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value={ORDER_STATUSES.PENDING}>Pending</option>
              <option value={ORDER_STATUSES.CONFIRMED}>Confirmed</option>
              <option value={ORDER_STATUSES.PROCESSING}>Processing</option>
              <option value={ORDER_STATUSES.SHIPPED}>Shipped</option>
              <option value={ORDER_STATUSES.OUT_FOR_DELIVERY}>Out for Delivery</option>
              <option value={ORDER_STATUSES.DELIVERED}>Delivered</option>
              <option value={ORDER_STATUSES.CANCELLED}>Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="paymentStatusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              id="paymentStatusFilter"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPaymentStatusFilter('all');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </div>
                      {order.trackingInfo?.trackingNumber && (
                        <div className="text-sm text-gray-500">
                          Tracking: {order.trackingInfo.trackingNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.userDetails?.name || order.shippingAddress.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.userDetails?.email || order.shippingAddress.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items.length} item(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {ORDER_STATUS_LABELS[order.status] || order.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/orders/${order.orderNumber}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value={ORDER_STATUSES.PENDING}>Pending</option>
                          <option value={ORDER_STATUSES.CONFIRMED}>Confirmed</option>
                          <option value={ORDER_STATUSES.PROCESSING}>Processing</option>
                          <option value={ORDER_STATUSES.SHIPPED}>Shipped</option>
                          <option value={ORDER_STATUSES.OUT_FOR_DELIVERY}>Out for Delivery</option>
                          <option value={ORDER_STATUSES.DELIVERED}>Delivered</option>
                          <option value={ORDER_STATUSES.CANCELLED}>Cancelled</option>
                        </select>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handlePaymentStatusChange(order._id, e.target.value as 'pending' | 'paid' | 'failed')}
                          className={`text-sm border border-gray-300 rounded px-2 py-1 ${getPaymentStatusColor(order.paymentStatus)}`}
                          title="Payment Status"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-2 border rounded-md text-sm font-medium ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}

     
    </div>
  );
}