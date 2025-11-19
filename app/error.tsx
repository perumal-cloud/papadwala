'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
            <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Something Went Wrong
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Oops! It looks like there was an error while preparing your papads.
          </p>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Don't worry, our kitchen staff is already working to fix this issue. 
            Please try again or return to our homepage.
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left max-w-lg mx-auto">
            <h3 className="font-semibold text-red-800 mb-2">Development Error Details:</h3>
            <code className="text-sm text-red-700 break-all">
              {error.message}
            </code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={reset}
            className="group bg-gradient-to-r from-teal-500 to-red-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5 group-hover:animate-spin" />
            <span>Try Again</span>
          </button>
          
          <Link
            href="/"
            className="group bg-white hover:bg-gray-50 text-teal-600 border-2 border-teal-500 hover:border-teal-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-2"
          >
            <Home className="w-5 h-5 group-hover:animate-bounce" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Still having trouble?</h3>
          <p className="text-gray-600 mb-4">
            If this error persists, please contact our support team and we'll help you right away.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            Contact Support
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-200 rounded-full opacity-20 animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/4 -left-10 w-32 h-32 bg-teal-200 rounded-full opacity-20 animate-[float-delay_8s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );
}