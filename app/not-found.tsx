'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search, ShoppingBag, Package } from 'lucide-react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-red-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated 404 Number */}
        <div className="relative mb-8">
          <div className="text-[12rem] md:text-[16rem] font-bold text-teal-100 select-none animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-teal-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <Package className="w-16 h-16 md:w-24 md:h-24 text-white" />
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 animate-[fade-in_0.8s_ease-out]">
            Page Not Found
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-6 animate-[fade-in_0.8s_ease-out_0.2s_both]">
            Oops! The papad you're looking for seems to have crumbled away.
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto animate-[fade-in_0.8s_ease-out_0.4s_both]">
            Don't worry, there are plenty of delicious papads waiting for you on our homepage. 
            Let's get you back to browsing our authentic handcrafted collection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/"
            className="group bg-gradient-to-r from-teal-500 to-red-500 hover:from-teal-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-2"
          >
            <Home className="w-5 h-5 group-hover:animate-bounce" />
            <span>Back to Home</span>
          </Link>
          
          <Link
            href="/products"
            className="group bg-white hover:bg-gray-50 text-teal-600 border-2 border-teal-500 hover:border-teal-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-2"
          >
            <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" />
            <span>Browse Products</span>
          </Link>
        </div>

        {/* Suggested Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">What would you like to do?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/products"
              className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-xl p-6 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">Browse Products</h4>
                  <p className="text-sm text-gray-600">Explore our papad collection</p>
                </div>
              </div>
            </Link>

            <Link
              href="/categories"
              className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-xl p-6 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">Categories</h4>
                  <p className="text-sm text-gray-600">Find papads by type</p>
                </div>
              </div>
            </Link>

            <Link
              href="/contact"
              className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-xl p-6 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">Contact Us</h4>
                  <p className="text-sm text-gray-600">Need help? Reach out</p>
                </div>
              </div>
            </Link>

            <Link
              href="/about"
              className="group bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border border-yellow-200 rounded-xl p-6 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">About Us</h4>
                  <p className="text-sm text-gray-600">Learn our story</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            🥨 Did you know? We've crafted over 10,000 papads with love and tradition!
          </p>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-200 rounded-full opacity-20 animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/4 -left-10 w-32 h-32 bg-red-200 rounded-full opacity-20 animate-[float-delay_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-yellow-200 rounded-full opacity-20 animate-[float_6s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );
}