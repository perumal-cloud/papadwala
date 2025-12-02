'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface OrderItem {
  productId?: {
    _id: string;
    name: string;
    images: string[];
  };
  name?: string; // Snapshot field
  image?: string; // Snapshot field
  price?: number; // Snapshot field
  quantity: number;
  priceSnapshot?: number; // Legacy field
}

interface Order {
  _id?: string;
  id?: string;
  orderNumber: string;
  items?: OrderItem[]; // Optional since list API doesn't include this
  totalAmount: number;
  itemCount?: number; // Available in list API
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  customer?: {
    _id: string;
    name: string;
    email: string;
  };
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    // Legacy fields for backward compatibility
    address?: string;
    pincode?: string;
  };
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else if (response.status === 401) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadInvoice = async (orderNumber: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please log in to download invoice');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderNumber}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to download invoice');
        } else {
          toast.error('Failed to download invoice. Please try again.');
        }
      }
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast.error('Failed to download invoice. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-6">
              <img 
                src="/images/no-order.jpg" 
                alt="No orders" 
                className="mx-auto max-w-md w-full h-auto"
              />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">No orders found</h3>
            <p className="mt-2 text-base text-gray-500">You haven't placed any orders yet.</p>
            <div className="mt-8">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors shadow-md"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id || order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {order.paymentStatus && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                        )}
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-6">
                    {order.items && order.items.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                              {(item.image || (item.productId?.images && item.productId.images.length > 0)) ? (
                                <img
                                  src={item.image || item.productId?.images[0]}
                                  alt={item.name || item.productId?.name || 'Product'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    {(item.name || item.productId?.name)?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name || item.productId?.name || 'Product Not Available'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} × ₹{(item.price || item.priceSnapshot) || 0}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {order.itemCount ? `${order.itemCount} items` : 'Items information not available'}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          <Link href={`/orders/${order.orderNumber}`} className="underline hover:no-underline">
                            View order details for complete information
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Customer & Shipping Address */}
                  {order.shippingAddress ? (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.fullName}<br />
                        {order.shippingAddress.addressLine1 || order.shippingAddress.address}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode || order.shippingAddress.pincode}
                      </p>
                    </div>
                  ) : order.customer ? (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Customer</h4>
                      <p className="text-sm text-gray-600">
                        {order.customer.name}<br />
                        {order.customer.email}
                      </p>
                    </div>
                  ) : null}

                  {/* Order Actions */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href={`/orders/${order.orderNumber}`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </Link>
                    
                    {(order.status === 'delivered' || order.status === 'confirmed') && (
                      <button
                        onClick={() => downloadInvoice(order.orderNumber)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors"
                      >
                        Download Invoice
                      </button>
                    )}

                    {order.status === 'delivered' && (
                      <button className="inline-flex items-center justify-center px-4 py-2 border border-teal-600 text-teal-600 text-sm font-medium rounded-md hover:bg-teal-50 transition-colors">
                        Reorder
                      </button>
                    )}
                  </div>

                  {/* Estimated Delivery */}
                  {order.estimatedDelivery && order.status !== 'delivered' && (
                    <div className="mt-4 text-sm text-gray-500">
                      Estimated delivery: {formatDate(order.estimatedDelivery)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}