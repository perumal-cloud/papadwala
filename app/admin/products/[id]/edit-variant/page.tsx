'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiClient } from '@/lib/auth/ApiClient';
import { toast } from 'react-toastify';

interface WeightOption {
  weight: string;
  price: number;
  stock: number;
  sku?: string;
  isActive: boolean;
}

interface SizeVariant {
  size: string;
  weights: WeightOption[];
  isActive: boolean;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  variants: SizeVariant[];
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
  isActive: boolean;
  featured: boolean;
}

export default function EditVariantProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [ingredient, setIngredient] = useState('');
  const [tag, setTag] = useState('');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    variants: [],
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
    isActive: true,
    featured: false,
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    // Auto-generate slug from name
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await ApiClient.get(`/api/products/variants/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        const product = data.product;
        
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          variants: product.variants || [],
          ingredients: product.ingredients || [],
          nutritionInfo: product.nutritionInfo || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sodium: 0,
          },
          tags: product.tags || [],
          isActive: product.isActive !== undefined ? product.isActive : true,
          featured: product.featured !== undefined ? product.featured : false,
        });
        
        setExistingImages(product.images || []);
      } else {
        toast.error('Failed to load product');
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      router.push('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNutritionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      nutritionInfo: {
        ...prev.nutritionInfo,
        [name]: parseFloat(value) || 0
      }
    }));
  };

  // Variant management functions
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          size: '',
          weights: [{ weight: '', price: 0, stock: 0, sku: '', isActive: true }],
          isActive: true
        }
      ]
    }));
  };

  const removeVariant = (variantIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, index) => index !== variantIndex)
    }));
  };

  const updateVariantSize = (variantIndex: number, size: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, index) => 
        index === variantIndex ? { ...variant, size } : variant
      )
    }));
  };

  const addWeight = (variantIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, index) => 
        index === variantIndex
          ? {
              ...variant,
              weights: [
                ...variant.weights,
                { weight: '', price: 0, stock: 0, sku: '', isActive: true }
              ]
            }
          : variant
      )
    }));
  };

  const removeWeight = (variantIndex: number, weightIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, vIndex) => 
        vIndex === variantIndex
          ? {
              ...variant,
              weights: variant.weights.filter((_, wIndex) => wIndex !== weightIndex)
            }
          : variant
      )
    }));
  };

  const updateWeight = (variantIndex: number, weightIndex: number, field: keyof WeightOption, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, vIndex) => 
        vIndex === variantIndex
          ? {
              ...variant,
              weights: variant.weights.map((weight, wIndex) => 
                wIndex === weightIndex
                  ? { ...weight, [field]: value }
                  : weight
              )
            }
          : variant
      )
    }));
  };

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedImages.length + existingImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls((prev: string[]) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setSelectedImages((prev: File[]) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev: string[]) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Ingredients and tags
  const addIngredient = () => {
    if (ingredient.trim()) {
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
    if (tag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim().toLowerCase()]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (formData.variants.length === 0) {
      toast.error('At least one size variant is required');
      return;
    }

    for (let i = 0; i < formData.variants.length; i++) {
      const variant = formData.variants[i];
      if (!variant.size.trim()) {
        toast.error(`Size is required for variant ${i + 1}`);
        return;
      }
      if (variant.weights.length === 0) {
        toast.error(`At least one weight is required for ${variant.size}`);
        return;
      }
      for (let j = 0; j < variant.weights.length; j++) {
        const weight = variant.weights[j];
        if (!weight.weight.trim()) {
          toast.error(`Weight value is required for ${variant.size} option ${j + 1}`);
          return;
        }
        if (weight.price <= 0) {
          toast.error(`Price must be greater than 0 for ${variant.size} - ${weight.weight}`);
          return;
        }
        if (weight.stock < 0) {
          toast.error(`Stock cannot be negative for ${variant.size} - ${weight.weight}`);
          return;
        }
      }
    }

    if (existingImages.length === 0 && selectedImages.length === 0) {
      toast.error('At least one product image is required');
      return;
    }

    setIsSaving(true);

    try {
      // Prepare images array
      const imagesArray = [...existingImages];
      
      // Convert new images to base64
      for (const file of selectedImages) {
        const base64 = await fileToBase64(file);
        imagesArray.push(base64);
      }

      const payload = {
        ...formData,
        images: imagesArray.map(img => {
          if (img.startsWith('data:')) {
            return { base64: img };
          }
          return img;
        })
      };

      const response = await ApiClient.put(`/api/products/variants/${productId}`, payload);

      if (response.ok) {
        toast.success('Product updated successfully!');
        router.push('/admin/products');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-2 text-gray-600">Update product with variants (sizes and weights)</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Garlic Papad"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                placeholder="Auto-generated from name"
                readOnly
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your product..."
                required
              />
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Images</h2>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Images (Max 5 total)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={existingImages.length + selectedImages.length >= 5}
            />
            
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Variants Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Product Variants *</h2>
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Size Variant
            </button>
          </div>

          {formData.variants.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No variants added</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a size variant</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.variants.map((variant, variantIndex) => (
                <div key={variantIndex} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                  {/* Variant Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size {variantIndex + 1} *
                      </label>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => updateVariantSize(variantIndex, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 2.5 inch, 3.5 inch, 4.5 inch"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(variantIndex)}
                      className="mt-7 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Weights */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Weight Options *
                      </label>
                      <button
                        type="button"
                        onClick={() => addWeight(variantIndex)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Weight
                      </button>
                    </div>

                    <div className="space-y-3">
                      {variant.weights.map((weight, weightIndex) => (
                        <div key={weightIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-white rounded-lg border border-gray-200">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Weight *</label>
                            <input
                              type="text"
                              value={weight.weight}
                              onChange={(e) => updateWeight(variantIndex, weightIndex, 'weight', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., 100g, 1kg"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹) *</label>
                            <input
                              type="number"
                              value={weight.price}
                              onChange={(e) => updateWeight(variantIndex, weightIndex, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Stock *</label>
                            <input
                              type="number"
                              value={weight.stock}
                              onChange={(e) => updateWeight(variantIndex, weightIndex, 'stock', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                              min="0"
                              required
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeWeight(variantIndex, weightIndex)}
                              className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                              disabled={variant.weights.length === 1}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Ingredients (Optional)</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter ingredient and press Add"
            />
            <button
              type="button"
              onClick={addIngredient}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          {formData.ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.ingredients.map((ing, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {ing}
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Nutrition Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Nutrition Information (per 100g)</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(formData.nutritionInfo).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {key} (g)
                </label>
                <input
                  type="number"
                  name={key}
                  value={value}
                  onChange={handleNutritionChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Tags (Optional)</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tag and press Add"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((t, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Product Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Status</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Active</div>
                <div className="text-sm text-gray-500">Product will be visible to customers</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Featured Product</div>
                <div className="text-sm text-gray-500">Show in featured section</div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
