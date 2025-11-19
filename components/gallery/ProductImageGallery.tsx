'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export default function ProductImageGallery({
  images,
  productName,
  className = ''
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setSelectedImage(0);
    setImageError([]);
    setIsLoading(true);
  }, [images]);

  const handleImageError = (index: number) => {
    setImageError(prev => [...prev, index]);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isModalOpen) return;
    
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') setIsModalOpen(false);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  if (!images || images.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="relative aspect-square bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-6xl font-bold">
            {productName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Main Image */}
        <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden group">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {!imageError.includes(selectedImage) ? (
            <Image
              src={images[selectedImage]}
              alt={`${productName} - Image ${selectedImage + 1}`}
              fill
              className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              onError={() => handleImageError(selectedImage)}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={selectedImage === 0}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <span className="text-white text-6xl font-bold">
                {productName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Navigation arrows for multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Zoom button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="Zoom image"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {selectedImage + 1} / {images.length}
            </div>
          )}
        </div>
        
        {/* Thumbnail Images */}
        {images.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  selectedImage === index 
                    ? 'border-teal-600 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {!imageError.includes(index) ? (
                  <Image
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    onError={() => handleImageError(index)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Image indicators */}
        {images.length > 1 && (
          <div className="flex justify-center space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  selectedImage === index 
                    ? 'bg-teal-600 w-4' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Main image */}
            <div 
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {!imageError.includes(selectedImage) ? (
                <Image
                  src={images[selectedImage]}
                  alt={`${productName} - Full size`}
                  width={1200}
                  height={1200}
                  className="max-w-full max-h-full object-contain"
                  onError={() => handleImageError(selectedImage)}
                />
              ) : (
                <div className="w-96 h-96 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-6xl font-bold">
                    {productName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-3 py-1 rounded">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}