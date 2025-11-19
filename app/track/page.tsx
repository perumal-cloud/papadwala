'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your order number to see real-time tracking information
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                You can find your order number in your confirmation email
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error === 'not-found' ? 'Order not found' : 'Error tracking order'}
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Tracking...' : 'Track Order'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-white py-6 px-6 shadow rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Status Guide</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-sm">Order Placed</p>
                <p className="text-xs text-gray-500">Your order has been received and confirmed</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-sm">Processing</p>
                <p className="text-xs text-gray-500">Your order is being prepared for shipment</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-sm">Shipped</p>
                <p className="text-xs text-gray-500">Your order is on its way to you</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-sm">Out for Delivery</p>
                <p className="text-xs text-gray-500">Your order will arrive soon</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-sm">Delivered</p>
                <p className="text-xs text-gray-500">Your order has been delivered</p>
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