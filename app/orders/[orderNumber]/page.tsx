'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  productId?: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
  };
  name?: string; // Snapshot field
  image?: string; // Snapshot field
  price?: number; // Snapshot field
  quantity: number;
  priceSnapshot?: number; // Legacy field
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  customer?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    fullName: string;
    email: string;
    phoneNumber: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
    // Legacy fields for backward compatibility
    phone?: string;
    address?: string;
    pincode?: string;
  };
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  statusHistory: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

export default function OrderDetailPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const fetchOrder = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else if (response.status === 404) {
        router.push('/orders');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return statusOrder.indexOf(status);
  };

  const isStatusCompleted = (status: string, currentStatus: string) => {
    const currentIndex = getStatusIndex(currentStatus);
    const statusIndex = getStatusIndex(status);
    return statusIndex <= currentIndex; // All completed statuses including pending get ticks
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadInvoice = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !order) return;

    try {
      const response = await fetch(`/api/orders/${order.orderNumber}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order.orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Link
            href="/orders"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link href="/orders" className="text-gray-500 hover:text-gray-700">
                  Orders
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-900 font-medium">#{order.orderNumber}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span className="text-2xl font-bold text-teal-600">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-4">
            {(order.status === 'delivered' || order.status === 'confirmed') && (
              <button
                onClick={downloadInvoice}
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoice
              </button>
            )}
            
            {order.trackingNumber && (
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Track Package
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {(item.image || (item.productId?.images && item.productId.images.length > 0)) ? (
                        <img
                          src={item.image || item.productId?.images[0]}
                          alt={item.name || item.productId?.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-400 to-red-500 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {(item.name || item.productId?.name)?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.productId?.slug || '#'}`}
                        className="text-lg font-medium text-gray-900 hover:text-teal-600 transition-colors"
                      >
                        {item.name || item.productId?.name || 'Product Not Available'}
                      </Link>
                      <p className="text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-gray-500">Price: ₹{item.price || item.priceSnapshot} each</p>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{((item.price || item.priceSnapshot) || 0) * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Timeline</h2>
              <div className="relative">
                {(() => {
                  const allStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                  const statusHistoryMap = new Map(order.statusHistory?.map(s => [s.status, s]) || []);
                  
                  return allStatuses.map((statusName, index) => {
                    const statusData = statusHistoryMap.get(statusName);
                    const hasOccurred = !!statusData;
                    const isCompleted = isStatusCompleted(statusName, order.status);
                    
                    return (
                      <div key={statusName} className="relative flex items-start space-x-4 pb-8 last:pb-0">
                        {/* Connecting Line */}
                        {index < allStatuses.length - 1 && (
                          <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
                        )}
                        
                        {/* Status Circle */}
                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          isCompleted
                            ? 'bg-green-600 border-green-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          )}
                        </div>
                        
                        {/* Status Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className={`font-medium ${
                              isCompleted 
                                ? 'text-green-600' 
                                : 'text-gray-500'
                            }`}>
                              {statusName.charAt(0).toUpperCase() + statusName.slice(1)}
                            </p>
                            {statusName === order.status && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Current
                              </span>
                            )}
                          </div>
                          {hasOccurred && statusData ? (
                            <>
                              <p className="text-sm text-gray-500 mt-1">{formatDate(statusData.timestamp)}</p>
                              {statusData.note && (
                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-md">{statusData.note}</p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-gray-400 mt-1">Not yet reached</p>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Order Summary & Shipping */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">
                    {order.shippingCost > 0 ? `₹${order.shippingCost}` : 'Free'}
                  </span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₹{order.tax}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold text-teal-600">₹{order.total || order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1 || order.shippingAddress.address}</p>
                {order.shippingAddress.landmark && (
                  <p>Near {order.shippingAddress.landmark}</p>
                )}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.postalCode || order.shippingAddress.pincode}</p>
                <p className="pt-2 border-t">
                  <span className="text-md text-gray-500">Phone: </span>
                  {order.shippingAddress.phoneNumber || order.shippingAddress.phone || 'Not available'}
                </p>
                <p>
                  <span className="text-md text-gray-500">Email: </span>
                  {order.shippingAddress.email || order.customer?.email || 'Not available'}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h10a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2.18" />
                </svg>
                <span className="font-medium">Cash on Delivery</span>
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.estimatedDelivery && order.status !== 'delivered' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
                    <p className="text-sm text-blue-700">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}