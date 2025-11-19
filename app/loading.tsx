export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        {/* Main Loading Animation */}
        <div className="relative mb-8">
          {/* Outer spinning ring */}
          <div className="flex justify-center items-center">
            <div className="w-20 h-20 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" ></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 animate-pulse">
            Preparing Your Papads
          </h2>
          <p className="text-gray-600 animate-pulse">
            Please wait while we get everything ready...
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Progress Steps */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center space-x-2 animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connecting to kitchen...</span>
            </div>
            <div className="flex items-center space-x-2 animate-pulse">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-ping"></div>
              <span>Preparing fresh papads...</span>
            </div>
            <div className="flex items-center space-x-2 opacity-50">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>Serving your order...</span>
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-200 rounded-full opacity-10 animate-[float_4s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-10 -left-10 w-32 h-32 bg-cyan-200 rounded-full opacity-10 animate-[float-delay_6s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
}