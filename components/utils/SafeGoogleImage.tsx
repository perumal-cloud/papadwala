'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeGoogleImageProps {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

export default function SafeGoogleImage({ 
  src, 
  alt = 'Profile picture', 
  width = 40, 
  height = 40,
  className = '',
  fallbackSrc = '/images/placeholder-product.svg',
  priority = false
}: SafeGoogleImageProps) {
  const [imgSrc, setImgSrc] = useState(() => {
    if (!src) return fallbackSrc;
    
    // Always use proxy for Google images to avoid 429 errors
    if (src.includes('googleusercontent.com') || src.includes('graph.google.com')) {
      return `/api/images/proxy?url=${encodeURIComponent(src)}`;
    }
    
    return src;
  });
  
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.log('Image load error for:', imgSrc);
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    console.log('Image loaded successfully:', imgSrc);
  };

  // If no src or error with fallback, show icon
  if (!src || (hasError && imgSrc === fallbackSrc)) {
    return (
      <div 
        className={`bg-gray-200 rounded-full flex items-center justify-center text-gray-500 ${className}`}
        style={{ width, height }}
      >
        <svg 
          className="w-1/2 h-1/2" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={`object-cover ${className}`}
      onError={handleError}
      onLoad={handleLoad}
      priority={priority}
      unoptimized={imgSrc.startsWith('/api/images/proxy')} // Disable optimization for proxied images
    />
  );
}