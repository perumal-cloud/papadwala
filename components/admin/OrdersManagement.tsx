'use client';
import { toast } from 'react-toastify';

import { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/auth/ApiClient';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, getNextOrderStatus, isValidStatusTransition, type OrderStatus } from '../../lib/constants/orderStatus';
import Link from 'next/link';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  notes?: string;
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
  statusHistory?: StatusHistoryEntry[];
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus, notes?: string, trackingNumber?: string, estimatedDelivery?: string) => void;
}

interface UpdatePaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdatePaymentStatus: (orderId: string, newPaymentStatus: 'pending' | 'paid' | 'failed', notes?: string) => void;
}

function UpdateStatusModal({ isOpen, onClose, order, onUpdateStatus }: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(ORDER_STATUSES.PENDING);
  const [notes, setNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setTrackingNumber(order.trackingNumber || '');
      setEstimatedDelivery(order.estimatedDelivery ? order.estimatedDelivery.split('T')[0] : '');
      setNotes('');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(
      order._id, 
      selectedStatus, 
      notes || undefined, 
      trackingNumber || undefined,
      estimatedDelivery || undefined
    );
    onClose();
  };

  const availableStatuses = Object.values(ORDER_STATUSES).filter(status => 
    status === order.status || isValidStatusTransition(order.status, status)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
        <p className="text-sm text-gray-600 mb-4">Order #{order.orderNumber}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableStatuses.map((status: OrderStatus) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this status update..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {(selectedStatus === ORDER_STATUSES.SHIPPED || selectedStatus === ORDER_STATUSES.OUT_FOR_DELIVERY) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {(selectedStatus === ORDER_STATUSES.PROCESSING || selectedStatus === ORDER_STATUSES.SHIPPED) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Delivery Date
              </label>
              <input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update Status
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdatePaymentStatusModal({ isOpen, onClose, order, onUpdatePaymentStatus }: UpdatePaymentStatusModalProps) {
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (order) {
      setSelectedPaymentStatus(order.paymentStatus);
      setNotes('');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePaymentStatus(
      order._id, 
      selectedPaymentStatus, 
      notes || undefined
    );
    onClose();
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Update Payment Status</h3>
        <p className="text-sm text-gray-600 mb-2">Order #{order.orderNumber}</p>
        <p className="text-sm text-gray-500 mb-4">
          Current Payment Status: 
          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </span>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value as 'pending' | 'paid' | 'failed')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this payment status update..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update Payment Status
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ApiClient.makeRequest('/api/admin/orders');
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders');
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string, 
    newStatus: OrderStatus, 
    notes?: string, 
    trackingNumber?: string,
    estimatedDelivery?: string
  ) => {
    try {
      const response = await ApiClient.makeRequest(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes,
          trackingNumber,
          estimatedDelivery
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(orders =>
          orders.map(order =>
            order._id === orderId ? { ...order, ...data.order } : order
          )
        );
      } else {
        const error = await response.json();
        console.error('Failed to update order status:', error);
        toast.error(`Failed to update order status: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const updatePaymentStatus = async (
    orderId: string, 
    newPaymentStatus: 'pending' | 'paid' | 'failed', 
    notes?: string
  ) => {
    try {
      const response = await ApiClient.makeRequest(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: newPaymentStatus,
          notes
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(orders =>
          orders.map(order =>
            order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
          )
        );
      } else {
        const error = await response.json();
        console.error('Failed to update payment status:', error);
        toast.error(`Failed to update payment status: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleQuickStatusUpdate = (order: Order, newStatus: OrderStatus) => {
    if (isValidStatusTransition(order.status, newStatus)) {
      updateOrderStatus(order._id, newStatus);
    }
  };

  const handleDetailedStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setShowUpdateModal(true);
  };

  const handlePaymentStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Orders Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track all customer orders with real-time status updates.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search orders, customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {Object.values(ORDER_STATUSES).map((status: OrderStatus) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:w-48">
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {currentOrders.map((order) => {
            const nextStatus = getNextOrderStatus(order.status);
            
            return (
              <li key={order._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          #{order.orderNumber}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.paymentStatus === 'paid' ? 'text-green-600 bg-green-100' :
                          order.paymentStatus === 'failed' ? 'text-red-600 bg-red-100' :
                          'text-yellow-600 bg-yellow-100'
                        }`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.userDetails?.name || order.shippingAddress.fullName} • ₹{order.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                      </p>
                      {order.trackingNumber && (
                        <p className="text-xs text-blue-600">
                          Tracking: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Quick next status button */}
                    {nextStatus && (
                      <button
                        onClick={() => handleQuickStatusUpdate(order, nextStatus)}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        Mark as {ORDER_STATUS_LABELS[nextStatus]}
                      </button>
                    )}
                    
                    {/* Payment status update button */}
                    <button
                      onClick={() => handlePaymentStatusUpdate(order)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : order.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </button>
                    
                    {/* Detailed update button */}
                    <button
                      onClick={() => handleDetailedStatusUpdate(order)}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      Update Status
                    </button>
                    
                    {/* View order details */}
                    <button
                      onClick={() => handleDetailedStatusUpdate(order)}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      <UpdateStatusModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        order={selectedOrder}
        onUpdateStatus={updateOrderStatus}
      />

      {/* Update Payment Status Modal */}
      <UpdatePaymentStatusModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        order={selectedOrder}
        onUpdatePaymentStatus={updatePaymentStatus}
      />
    </div>
  );
}