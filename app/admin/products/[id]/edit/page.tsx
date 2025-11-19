'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiClient } from '@/lib/auth/ApiClient';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  categoryId: {
    _id: string;
    name: string;
  };
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: string[];
  isActive: boolean;
  featured: boolean;
  weight?: number;
  ingredients?: string[];
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sodium?: number;
  };
  tags: string[];
}

interface ProductFormData {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number;
  compareAtPrice: number;
  stock: number;
  images: string[];
  isActive: boolean;
  featured: boolean;
  weight: number;
  ingredients: string[];
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
  tags: string[];
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [ingredient, setIngredient] = useState('');
  const [tag, setTag] = useState('');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    categoryId: '',
    description: '',
    price: 0,
    compareAtPrice: 0,
    stock: 0,
    images: [],
    isActive: true,
    featured: false,
    weight: 0,
    ingredients: [],
    nutritionInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
    },
    tags: [],
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchCategories();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await ApiClient.get(`/api/products/${productId}`);

      if (response.ok) {
        const data = await response.json();
        const product: Product = data.product;
        
        setFormData({
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId._id,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice || 0,
          stock: product.stock,
          images: product.images,
          isActive: product.isActive ?? true,
          featured: product.featured ?? false,
          weight: product.weight || 0,
          ingredients: product.ingredients || [],
          nutritionInfo: {
            calories: product.nutritionInfo?.calories || 0,
            protein: product.nutritionInfo?.protein || 0,
            carbs: product.nutritionInfo?.carbs || 0,
            fat: product.nutritionInfo?.fat || 0,
            fiber: product.nutritionInfo?.fiber || 0,
            sodium: product.nutritionInfo?.sodium || 0,
          },
          tags: product.tags || [],
        });
      } else {
        console.error('Failed to fetch product');
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await ApiClient.get('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.startsWith('nutritionInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        nutritionInfo: {
          ...prev.nutritionInfo,
          [field]: parseFloat(value) || 0
        }
      }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addIngredient = () => {
    if (ingredient.trim() && !formData.ingredients.includes(ingredient.trim())) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredient.trim()]
      }));
      setIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
      setTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedFiles(imageFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create FormData for the upload
      const uploadFormData = new FormData();
      selectedFiles.forEach((file) => {
        uploadFormData.append('images', file);
      });

      // Simulate progress (since we can't get real progress from FormData upload easily)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await ApiClient.post('/api/admin/products/upload-images', uploadFormData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.ok) {
        const data = await response.json();
        const uploadedUrls = data.imageUrls || [];
        
        // Add the uploaded URLs to the form data
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
        
        // Clear selected files
        setSelectedFiles([]);
        
        // Clear the file input
        const fileInput = document.getElementById('imageFiles') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        alert(`Successfully uploaded ${uploadedUrls.length} image(s)`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate description length
    if (formData.description.trim().length < 10) {
      alert('Description must be at least 10 characters long');
      return;
    }
    
    setIsSaving(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      if (formData.compareAtPrice) {
        formDataToSend.append('compareAtPrice', formData.compareAtPrice.toString());
      }
      formDataToSend.append('stock', formData.stock.toString());
      if (formData.weight) {
        formDataToSend.append('weight', formData.weight.toString());
      }
      formDataToSend.append('isActive', (formData.isActive ?? true).toString());
      formDataToSend.append('featured', (formData.featured ?? false).toString());
      
      // Add complex fields as JSON
      if (formData.ingredients.length > 0) {
        formDataToSend.append('ingredients', JSON.stringify(formData.ingredients));
      }
      if (formData.tags.length > 0) {
        formDataToSend.append('tags', JSON.stringify(formData.tags));
      }
      formDataToSend.append('nutritionInfo', JSON.stringify(formData.nutritionInfo));
      
      // Keep existing images
      formDataToSend.append('keepImages', JSON.stringify(formData.images));
      
      const response = await ApiClient.put(`/api/products/${productId}`, formDataToSend);

      if (response.ok) {
        router.push('/admin/products');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600">Update product information</p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., Masala Papad"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="masala-papad"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                Weight (grams)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="100"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description * (minimum 10 characters)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  formData.description.trim().length < 10 && formData.description.length > 0
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
                placeholder="Describe your papad product..."
              />
              <div className="mt-1 flex justify-between">
                <span className={`text-xs ${
                  formData.description.trim().length < 10 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {formData.description.trim().length < 10 && formData.description.length > 0 
                    ? `${10 - formData.description.trim().length} more characters needed`
                    : formData.description.trim().length >= 10 
                    ? '✓ Description looks good' 
                    : 'Minimum 10 characters required'
                  }
                </span>
                <span className="text-xs text-gray-400">
                  {formData.description.trim().length}/10 min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="50.00"
              />
            </div>

            <div>
              <label htmlFor="compareAtPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Compare at Price (₹)
              </label>
              <input
                type="number"
                id="compareAtPrice"
                name="compareAtPrice"
                value={formData.compareAtPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="60.00"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="100"
              />
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images - Cloudinary Upload</h2>
          
          <div className="space-y-6">
            {/* File Upload Section */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive ? 'border-teal-400 bg-teal-50' : 'border-gray-300'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Images</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop images here or select multiple images to upload to Cloudinary
                  </p>
                  
                  <div className="space-y-4 w-full">
                    <input
                      type="file"
                      id="imageFiles"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    />
                    
                    {selectedFiles.length > 0 && (
                      <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                        <strong>{selectedFiles.length} file(s) selected:</strong>
                        <div className="mt-1 text-xs">
                          {selectedFiles.map(f => f.name).join(', ')}
                        </div>
                      </div>
                    )}

                    {isUploading && (
                      <div className="w-full">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Uploading to Cloudinary...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={uploadImages}
                      disabled={selectedFiles.length === 0 || isUploading}
                      className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUploading ? 'Uploading...' : 'Upload to Cloudinary'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                placeholder="Add an ingredient"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add
              </button>
            </div>

            {formData.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.map((ing, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                  >
                    {ing}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="ml-2 text-teal-600 hover:text-teal-800"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nutrition Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Information (per 100g)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="nutritionInfo.calories" className="block text-sm font-medium text-gray-700 mb-1">
                Calories
              </label>
              <input
                type="number"
                id="nutritionInfo.calories"
                name="nutritionInfo.calories"
                value={formData.nutritionInfo.calories}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="nutritionInfo.protein" className="block text-sm font-medium text-gray-700 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                id="nutritionInfo.protein"
                name="nutritionInfo.protein"
                value={formData.nutritionInfo.protein}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="nutritionInfo.carbs" className="block text-sm font-medium text-gray-700 mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                id="nutritionInfo.carbs"
                name="nutritionInfo.carbs"
                value={formData.nutritionInfo.carbs}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="nutritionInfo.fat" className="block text-sm font-medium text-gray-700 mb-1">
                Fat (g)
              </label>
              <input
                type="number"
                id="nutritionInfo.fat"
                name="nutritionInfo.fat"
                value={formData.nutritionInfo.fat}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="nutritionInfo.fiber" className="block text-sm font-medium text-gray-700 mb-1">
                Fiber (g)
              </label>
              <input
                type="number"
                id="nutritionInfo.fiber"
                name="nutritionInfo.fiber"
                value={formData.nutritionInfo.fiber}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="nutritionInfo.sodium" className="block text-sm font-medium text-gray-700 mb-1">
                Sodium (mg)
              </label>
              <input
                type="number"
                id="nutritionInfo.sodium"
                name="nutritionInfo.sodium"
                value={formData.nutritionInfo.sodium}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((t, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Product is active and visible in store
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Feature this product on homepage
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}