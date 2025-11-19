import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Empty turbopack config to silence the warning
  turbopack: {},
  
  // Webpack configuration to handle PDFKit issues (for when using --webpack flag)
  webpack: (config, { isServer }) => {
    // Handle PDFKit font loading issues
    if (isServer) {
      // Add node polyfills for browser compatibility
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      
      // Mark problematic modules as external
      config.externals = config.externals || [];
      config.externals.push('pdfkit/js/data/*');
    }
    
    return config;
  },
};

export default nextConfig;
