'use client';
import { toast } from 'react-toastify';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface MultipleImageUploadProps {
  selectedImages: File[];
  uploadedImages: string[];
  onImagesChange: (images: File[]) => void;
  onUploadedImagesChange: (images: string[]) => void;
  onUpload: () => Promise<void>;
  isUploading?: boolean;
  uploadProgress?: number;
  maxImages?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
}

export default function MultipleImageUpload({
  selectedImages,
  uploadedImages,
  onImagesChange,
  onUploadedImagesChange,
  onUpload,
  isUploading = false,
  uploadProgress = 0,
  maxImages = 10,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxFileSize = 5
}: MultipleImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = selectedImages.length + uploadedImages.length;
  const canAddMore = totalImages < maxImages;

  // Create preview URLs when selectedImages change
  useEffect(() => {
    const urls = selectedImages.map(file => URL.createObjectURL(file));
    setPreviewImages(urls);
    
    // Cleanup URLs on unmount
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size too large. Maximum size is ${maxFileSize}MB`;
    }
    
    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !canAddMore) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else if (totalImages + validFiles.length < maxImages) {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast.error(`Some files were skipped:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      onImagesChange([...selectedImages, ...validFiles]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (canAddMore) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [canAddMore, totalImages]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canAddMore) {
      setDragActive(true);
    }
  }, [canAddMore]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const removeSelectedImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const removeUploadedImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    onUploadedImagesChange(newImages);
  };

  const reorderSelectedImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...selectedImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const reorderUploadedImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...uploadedImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onUploadedImagesChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Stats */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{totalImages}</span> of{' '}
          <span className="font-medium">{maxImages}</span> images
          {uploadedImages.length > 0 && (
            <span className="text-green-600 ml-2">
              ({uploadedImages.length} uploaded, {selectedImages.length} pending)
            </span>
          )}
        </div>
        
        {selectedImages.length > 0 && !isUploading && (
          <button
            onClick={onUpload}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            Upload {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="w-full">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading to Cloudinary...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Uploaded Images ({uploadedImages.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedImages.map((imageUrl, index) => (
              <div
                key={`uploaded-${index}`}
                className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
              >
                <Image
                  src={imageUrl}
                  alt={`Uploaded ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
                
                {/* Image controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeUploadedImage(index)}
                      className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Reorder buttons */}
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    {index > 0 && (
                      <button
                        onClick={() => reorderUploadedImages(index, index - 1)}
                        className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        title="Move left"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    {index < uploadedImages.length - 1 && (
                      <button
                        onClick={() => reorderUploadedImages(index, index + 1)}
                        className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        title="Move right"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Index badge */}
                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Images (Pending Upload) */}
      {selectedImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Selected Images ({selectedImages.length}) - Pending Upload
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {selectedImages.map((file, index) => (
              <div
                key={`selected-${index}-${file.name}`}
                className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
              >
                <Image
                  src={previewImages[index]}
                  alt={file.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
                
                {/* Image controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeSelectedImage(index)}
                      className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Reorder buttons */}
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    {index > 0 && (
                      <button
                        onClick={() => reorderSelectedImages(index, index - 1)}
                        className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        title="Move left"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    {index < selectedImages.length - 1 && (
                      <button
                        onClick={() => reorderSelectedImages(index, index + 1)}
                        className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        title="Move right"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2">
                  <div className="truncate">{file.name}</div>
                  <div className="text-gray-300">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </div>
                </div>
                
                {/* Index badge */}
                <div className="absolute top-2 left-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                  {uploadedImages.length + index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive 
                ? 'border-teal-400 bg-teal-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${!canAddMore ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={openFileDialog}
          >
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {dragActive ? 'Drop images here' : 'Upload Product Images'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop multiple images here or click to select files
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <div>• Maximum {maxImages} images total</div>
                <div>• Maximum {maxFileSize}MB per image</div>
                <div>• Supported: {acceptedTypes.map(type => type.split('/')[1]).join(', ')}</div>
                <div>• Images can be reordered after upload</div>
              </div>
              
              <button
                type="button"
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
              >
                Choose Files
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleInputChange}
              className="hidden"
              disabled={!canAddMore}
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      {totalImages === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Image Upload Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• First image will be the main product image</li>
                <li>• Images can be reordered using the arrow buttons</li>
                <li>• High quality images work best (at least 800x800px)</li>
                <li>• Square images display better in galleries</li>
                <li>• Upload images to Cloudinary for better performance</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}