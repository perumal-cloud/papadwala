import Link from 'next/link';
import { ServerCrash, Home, RefreshCw } from 'lucide-react';

export default function Custom500() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Server Error Icon */}
        <div className="relative mb-8">
          <div className="text-[8rem] md:text-[10rem] font-bold text-red-100 select-none animate-pulse">
            500
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <ServerCrash className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Server Error
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Our kitchen is experiencing some technical difficulties.
          </p>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            We're working hard to fix this issue. Please try again later or contact our support team if the problem persists.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={() => window.location.reload()}
            className="group bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5 group-hover:animate-spin" />
            <span>Try Again</span>
          </button>
          
          <Link
            href="/"
            className="group bg-white hover:bg-gray-50 text-red-600 border-2 border-red-500 hover:border-red-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-2"
          >
            <Home className="w-5 h-5 group-hover:animate-bounce" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Need Immediate Help?</h3>
          <p className="text-gray-600 mb-4">
            If you need urgent assistance, please contact our support team directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center text-red-600 hover:text-red-700 font-medium transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg"
            >
              Contact Support
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="mailto:support@papadshop.com"
              className="inline-flex items-center justify-center text-teal-600 hover:text-teal-700 font-medium transition-colors bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg"
            >
              Email Us
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>We're aware of this issue and working on a fix</span>
          </p>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-200 rounded-full opacity-20 animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/4 -left-10 w-32 h-32 bg-teal-200 rounded-full opacity-20 animate-[float-delay_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-red-300 rounded-full opacity-20 animate-[float_6s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );
}