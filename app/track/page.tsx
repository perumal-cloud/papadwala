'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';

function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const error = searchParams?.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    
    setIsLoading(true);
    router.push(`/track/${orderNumber.trim()}`);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/images/track-order.jpg')"
      }}
    >
      {/* Background Overlay */}
      <div className="min-h-screen bg-white/90 backdrop-blur-sm">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative py-20 bg-cover bg-center" style={{ backgroundImage: "url('/images/track-order.jpg')" }}>
        <div className="absolute inset-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto mb-6 text-white" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">Track Your Order</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white">
              Enter your order number to see real-time tracking information
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Enter Order Details</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <div className="mt-1">
                <input
                  id="orderNumber"
                  name="orderNumber"
                  type="text"
                  placeholder="e.g., ORD-123456-0001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                You can find your order number in your confirmation email
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div>
                    <h3 className="text-sm font-semibold text-red-800 mb-1">
                      {error === 'not-found' ? 'Order not found' : 'Error tracking order'}
                    </h3>
                    <div className="text-sm text-red-700">
                      {error === 'not-found' 
                        ? 'Please check your order number and try again.'
                        : 'Something went wrong. Please try again later.'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={!orderNumber.trim() || isLoading}
                className="w-full flex justify-center py-3 px-6 border border-transparent text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Tracking...' : 'Track Order'}
              </button>
            </div>
          </form>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Status Guide</h2>
          <div className="space-y-4">
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-4 mt-1"></div>
              <div>
                <p className="font-semibold text-base text-gray-900">Order Placed</p>
                <p className="text-sm text-gray-600 mt-1">Your order has been received and confirmed</p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-4 mt-1"></div>
              <div>
                <p className="font-semibold text-base text-gray-900">Processing</p>
                <p className="text-sm text-gray-600 mt-1">Your order is being prepared for shipment</p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-purple-50 rounded-lg">
              <div className="w-4 h-4 bg-purple-500 rounded-full mr-4 mt-1"></div>
              <div>
                <p className="font-semibold text-base text-gray-900">Shipped</p>
                <p className="text-sm text-gray-600 mt-1">Your order is on its way to you</p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-teal-50 rounded-lg">
              <div className="w-4 h-4 bg-teal-500 rounded-full mr-4 mt-1"></div>
              <div>
                <p className="font-semibold text-base text-gray-900">Out for Delivery</p>
                <p className="text-sm text-gray-600 mt-1">Your order will arrive soon</p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-green-50 rounded-lg">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-4 mt-1"></div>
              <div>
                <p className="font-semibold text-base text-gray-900">Delivered</p>
                <p className="text-sm text-gray-600 mt-1">Your order has been delivered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackOrderForm />
    </Suspense>
  );
}