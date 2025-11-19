'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ORDER_STATUS_LABELS, ORDER_STATUSES, ORDER_STATUS_DESCRIPTIONS, ORDER_STATUS_COLORS, getOrderProgress, OrderStatus } from '../../../lib/constants/orderStatus';

interface TrackingData {
  orderNumber: string;
  status: string;
  statusLabel: string;
  statusDescription: string;
  progress: number;
  paymentStatus: string;
  total: number;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  shippedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  customerNotes?: string;
  tracking: {
    trackingNumber?: string;
    carrier?: string;
    trackingUrl?: string;
    currentLocation?: string;
    expectedDelivery?: string;
    deliveryAttempts: Array<{
      attemptDate: string;
      status: 'successful' | 'failed' | 'rescheduled';
      notes?: string;
      location?: string;
    }>;
  };
  shippingAddress: {
    fullName: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  timeline: Array<{
    status: string;
    statusLabel: string;
    timestamp: string;
    notes?: string;
    location?: string;
  }>;
}

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const orderNumber = params?.orderNumber as string;

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!orderNumber) return;

      try {
        const response = await fetch(`/api/orders/track/${orderNumber}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            router.push('/track?error=not-found');
            return;
          }
          throw new Error(data.error || 'Failed to fetch tracking data');
        }

        setTrackingData(data.tracking);
      } catch (err: any) {
        console.error('Error fetching tracking data:', err);
        setError(err.message || 'Failed to load tracking information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackingData();
  }, [orderNumber, router]);

  // Auto-refresh for active orders every 30 seconds
  useEffect(() => {
    if (!trackingData) return;

    const activeStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out-for-delivery'];
    if (!activeStatuses.includes(trackingData.status)) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/track/${orderNumber}`);
        if (response.ok) {
          const data = await response.json();
          setTrackingData(data.tracking);
        }
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [trackingData?.status, orderNumber]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-red-800">Error</h2>
            <p className="mt-2 text-red-600">{error}</p>
            <Link
              href="/track"
              className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return null;
  }

  const progress = getOrderProgress(trackingData.status as OrderStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
          <p className="mt-2 text-lg text-gray-600">Order #{trackingData.orderNumber}</p>
        </div>

        {/* Current Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Current Status</h2>
              <p className="text-sm text-gray-500">
                Order placed on {new Date(trackingData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${ORDER_STATUS_COLORS[trackingData.status as OrderStatus] || 'text-gray-600 bg-gray-100'}`}>
                {trackingData.statusLabel}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live tracking active"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">{trackingData.statusDescription}</p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {trackingData.tracking.trackingNumber && (
              <div>
                <span className="font-medium">Tracking Number:</span> {trackingData.tracking.trackingNumber}
              </div>
            )}
            {trackingData.tracking.carrier && (
              <div>
                <span className="font-medium">Carrier:</span> {trackingData.tracking.carrier}
              </div>
            )}
            {trackingData.tracking.currentLocation && (
              <div>
                <span className="font-medium">Current Location:</span> {trackingData.tracking.currentLocation}
              </div>
            )}
            <div>
              <span className="font-medium">Payment Status:</span>{' '}
              <span className={`capitalize ${trackingData.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {trackingData.paymentStatus}
              </span>
            </div>
            {trackingData.estimatedDelivery && (
              <div>
                <span className="font-medium">Estimated Delivery:</span>{' '}
                {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
              </div>
            )}
            {trackingData.actualDelivery && (
              <div>
                <span className="font-medium">Delivered On:</span>{' '}
                {new Date(trackingData.actualDelivery).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Timeline</h2>
          
          <div className="space-y-4">
            {trackingData.timeline.map((event, index) => (
              <div key={index} className="flex items-start">
                <div className="flex items-center mr-4">
                  <div className={`w-3 h-3 rounded-full ${
                    event.status === trackingData.status 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                  }`}></div>
                  {index < trackingData.timeline.length - 1 && (
                    <div className="w-px h-8 bg-gray-200 ml-1.5"></div>
                  )}
                </div>
                
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{event.statusLabel}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {event.notes && (
                    <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                  )}
                  {event.location && (
                    <p className="text-xs text-blue-600 mt-1">📍 {event.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Notes */}
        {trackingData.customerNotes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Important Update</h3>
            <p className="text-blue-800">{trackingData.customerNotes}</p>
          </div>
        )}

        {/* Delivery Attempts */}
        {trackingData.tracking.deliveryAttempts.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Attempts</h2>
            <div className="space-y-4">
              {trackingData.tracking.deliveryAttempts.map((attempt, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      attempt.status === 'successful' ? 'bg-green-100 text-green-800' :
                      attempt.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(attempt.attemptDate).toLocaleString()}
                    </span>
                  </div>
                  {attempt.notes && (
                    <p className="text-sm text-gray-600 mb-2">{attempt.notes}</p>
                  )}
                  {attempt.location && (
                    <p className="text-xs text-blue-600">📍 {attempt.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Tracking */}
        {trackingData.tracking.trackingUrl && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">External Tracking</h2>
            <p className="text-gray-600 mb-4">
              Get more detailed tracking information from {trackingData.tracking.carrier || 'the carrier'}.
            </p>
            <a
              href={trackingData.tracking.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Track on {trackingData.tracking.carrier || 'Carrier Website'}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Items */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Items Ordered</h3>
              <div className="space-y-3">
                {trackingData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 border-b pb-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Delivery Address</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{trackingData.shippingAddress.fullName}</p>
                <p>{trackingData.shippingAddress.city}, {trackingData.shippingAddress.state}</p>
                <p>{trackingData.shippingAddress.postalCode}</p>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>₹{trackingData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center">
          <Link
            href="/track"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Track Another Order
          </Link>
          <Link
            href="/orders"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}