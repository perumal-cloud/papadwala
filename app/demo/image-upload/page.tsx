'use client';

import { useState } from 'react';
import ProductImageGallery from '@/components/gallery/ProductImageGallery';
import MultipleImageUpload from '@/components/admin/MultipleImageUpload';

// Sample product data
const sampleProduct = {
  name: "Traditional Masala Papad",
  images: [
    "/images/carosuel1.jpg",
    "/images/carosuel2.jpg", 
    "/images/carosuel3.jpg",
    "/images/gallery1.jpg",
    "/images/gallery4.jpg"
  ]
};

export default function ImageUploadDemo() {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>(sampleProduct.images);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      alert('Please select images to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            
            // Simulate successful upload
            setTimeout(() => {
              // Convert selected images to mock URLs (in real app, these would come from Cloudinary)
              const mockUrls = selectedImages.map((file, index) => 
                `/images/mock-upload-${Date.now()}-${index}.jpg`
              );
              
              setUploadedImages(prev => [...prev, ...mockUrls]);
              setSelectedImages([]);
              setIsUploading(false);
              setUploadProgress(0);
              
              alert(`Successfully uploaded ${mockUrls.length} image(s)!`);
            }, 500);
            
            return 100;
          }
          return newProgress;
        });
      }, 200);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Multi-Image Upload Demo
          </h1>
          <p className="text-lg text-gray-600">
            Enhanced multiple image upload and gallery system for products
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Product Image Gallery
            </h2>
            <p className="text-gray-600 mb-6">
              Interactive image gallery with thumbnails, navigation arrows, fullscreen modal, 
              and keyboard controls.
            </p>
            
            <ProductImageGallery
              images={uploadedImages}
              productName={sampleProduct.name}
              className="max-w-md mx-auto"
            />
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click thumbnails to switch images</li>
                <li>• Hover for navigation arrows</li>
                <li>• Click zoom icon for fullscreen</li>
                <li>• Keyboard: Left/Right arrows, Escape</li>
                <li>• Responsive design</li>
                <li>• Error handling with fallbacks</li>
              </ul>
            </div>
          </div>

          {/* Multiple Image Upload Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Multiple Image Upload
            </h2>
            <p className="text-gray-600 mb-6">
              Drag & drop multiple image upload with preview, reordering, 
              and progress tracking.
            </p>
            
            <MultipleImageUpload
              selectedImages={selectedImages}
              uploadedImages={uploadedImages}
              onImagesChange={setSelectedImages}
              onUploadedImagesChange={setUploadedImages}
              onUpload={handleUpload}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              maxImages={12}
              maxFileSize={5}
            />
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Drag & drop multiple files</li>
                <li>• File validation (type & size)</li>
                <li>• Image preview before upload</li>
                <li>• Reorder images with arrow buttons</li>
                <li>• Upload progress tracking</li>
                <li>• Remove individual images</li>
                <li>• Visual feedback and status</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Integration Example */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Integration Instructions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                1. Product Image Gallery
              </h3>
              <div className="bg-gray-100 rounded-lg p-4 text-sm">
                <pre className="whitespace-pre-wrap">
{`// In your product detail page
import ProductImageGallery from '@/components/gallery/ProductImageGallery';

<ProductImageGallery
  images={product.images}
  productName={product.name}
/>`}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                2. Admin Upload Component  
              </h3>
              <div className="bg-gray-100 rounded-lg p-4 text-sm">
                <pre className="whitespace-pre-wrap">
{`// In your admin add/edit product forms
import MultipleImageUpload from '@/components/admin/MultipleImageUpload';

<MultipleImageUpload
  selectedImages={selectedImages}
  uploadedImages={uploadedImages}
  onImagesChange={setSelectedImages}
  onUploadedImagesChange={setUploadedImages}
  onUpload={handleCloudinaryUpload}
  isUploading={isUploading}
  uploadProgress={uploadProgress}
/>`}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Implementation Notes:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Replace existing image upload sections in admin pages</li>
              <li>• Update product detail pages to use ProductImageGallery</li>
              <li>• Components are fully styled and responsive</li>
              <li>• Works with your existing Cloudinary upload logic</li>
              <li>• Maintains backward compatibility with current data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}