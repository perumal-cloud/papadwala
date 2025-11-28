import Image from 'next/image';
import { useState } from 'react';

interface ProfilePictureProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallbackSrc?: string;
}

export default function ProfilePicture({ 
  src, 
  alt = 'Profile picture', 
  size = 40, 
  className = '',
  fallbackSrc = '/images/placeholder-product.svg'
}: ProfilePictureProps) {
  const [imgSrc, setImgSrc] = useState(() => {
    if (!src) return fallbackSrc;
    
    // If it's a Google image URL, use our proxy to avoid rate limiting
    if (src.includes('googleusercontent.com') || src.includes('graph.google.com')) {
      return `/api/images/proxy?url=${encodeURIComponent(src)}`;
    }
    
    return src;
  });
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      
      // If proxy failed and it was a Google URL, try the original URL
      if (imgSrc.includes('/api/images/proxy') && src) {
        setImgSrc(src);
      } else {
        setImgSrc(fallbackSrc);
      }
    }
  };

  // If no src or error, show fallback
  if (!src || hasError) {
    return (
      <div 
        className={`bg-gray-300 rounded-full flex items-center justify-center text-gray-600 ${className}`}
        style={{ width: size, height: size }}
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
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      onError={handleError}
      // Add referrerPolicy to help with Google images
      referrerPolicy="strict-origin-when-cross-origin"
      // Add priority for above-the-fold images
      priority={size >= 100}
      // Add placeholder
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
}