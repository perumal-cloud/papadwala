'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AddVariantProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [ingredient, setIngredient] = useState('');
  const [tag, setTag] = useState('');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    variants: [
      {
        size: '',
        weights: [{ weight: '', price: 0, stock: 0, sku: '', isActive: true }],
        isActive: true
      }
    ],
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

  // Auto-generate slug from name
  useEffect(() => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  // Variant management functions
  const addSizeVariant = () => {
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

  const removeSizeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }));
    }
  };

  const updateSizeVariant = (index: number, field: keyof SizeVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const addWeightOption = (variantIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === variantIndex
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

  const removeWeightOption = (variantIndex: number, weightIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              weights: variant.weights.filter((_, wi) => wi !== weightIndex)
            }
          : variant
      )
    }));
  };

  const updateWeightOption = (
    variantIndex: number,
    weightIndex: number,
    field: keyof WeightOption,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              weights: variant.weights.map((weight, wi) =>
                wi === weightIndex ? { ...weight, [field]: value } : weight
              )
            }
          : variant
      )
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);

    // Generate preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls((prev: string[]) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev: File[]) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev: string[]) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Product description is required');
      return;
    }

    if (selectedImages.length === 0) {
      toast.error('At least one product image is required');
      return;
    }

    if (formData.variants.length === 0) {
      toast.error('At least one size variant is required');
      return;
    }

    // Validate each variant
    for (let i = 0; i < formData.variants.length; i++) {
      const variant = formData.variants[i];
      if (!variant.size.trim()) {
        toast.error(`Size is required for variant ${i + 1}`);
        return;
      }

      if (variant.weights.length === 0) {
        toast.error(`At least one weight option is required for ${variant.size}`);
        return;
      }

      for (let j = 0; j < variant.weights.length; j++) {
        const weight = variant.weights[j];
        if (!weight.weight.trim()) {
          toast.error(`Weight value is required for ${variant.size}, option ${j + 1}`);
          return;
        }
        if (weight.price <= 0) {
          toast.error(`Valid price is required for ${variant.size} - ${weight.weight}`);
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      // Convert images to base64
      const imagePromises = selectedImages.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const base64Images = await Promise.all(imagePromises);

      const productData = {
        ...formData,
        images: base64Images.map(base64 => ({ base64 }))
      };

      const response = await ApiClient.post('/api/products/variants', productData);

      if (response.ok) {
        toast.success('Product created successfully!');
        router.push('/admin/products');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Create product error:', error);
      toast.error('Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product (Variant-Based)</h1>
        <p className="text-gray-600 mt-2">Create a product with multiple size and weight variants</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (Auto-generated)
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Product Images *</h2>

          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition"
              >
                Select Images (Max 5)
              </label>
            </div>

            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
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

        {/* Variants */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Size & Weight Variants *</h2>
            <button
              type="button"
              onClick={addSizeVariant}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              + Add Size
            </button>
          </div>

          <div className="space-y-6">
            {formData.variants.map((variant, variantIndex) => (
              <div key={variantIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size (e.g., "2.5 inch", "3.5 inch") *
                    </label>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => updateSizeVariant(variantIndex, 'size', e.target.value)}
                      placeholder="Enter size"
                      className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSizeVariant(variantIndex)}
                      className="ml-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Remove Size
                    </button>
                  )}
                </div>

                <div className="ml-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Weight Options</h4>
                    <button
                      type="button"
                      onClick={() => addWeightOption(variantIndex)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                    >
                      + Add Weight
                    </button>
                  </div>

                  {variant.weights.map((weight, weightIndex) => (
                    <div key={weightIndex} className="flex flex-wrap gap-3 items-end bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Weight *
                        </label>
                        <input
                          type="text"
                          value={weight.weight}
                          onChange={(e) =>
                            updateWeightOption(variantIndex, weightIndex, 'weight', e.target.value)
                          }
                          placeholder="e.g., 100g, 1kg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>

                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          value={weight.price}
                          onChange={(e) =>
                            updateWeightOption(variantIndex, weightIndex, 'price', parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>

                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Stock *
                        </label>
                        <input
                          type="number"
                          value={weight.stock}
                          onChange={(e) =>
                            updateWeightOption(variantIndex, weightIndex, 'stock', parseInt(e.target.value) || 0)
                          }
                          placeholder="0"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>

                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          SKU (Optional)
                        </label>
                        <input
                          type="text"
                          value={weight.sku || ''}
                          onChange={(e) =>
                            updateWeightOption(variantIndex, weightIndex, 'sku', e.target.value)
                          }
                          placeholder="Auto-generated"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      {variant.weights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWeightOption(variantIndex, weightIndex)}
                          className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ingredients (Optional)</h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                placeholder="Add an ingredient"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>

            {formData.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.map((ing, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {ing}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nutrition Info */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Nutrition Information (Optional, per 100g)</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(formData.nutritionInfo).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key} (g)
                </label>
                <input
                  type="number"
                  name={key}
                  value={formData.nutritionInfo[key as keyof typeof formData.nutritionInfo]}
                  onChange={handleNutritionChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Tags (Optional)</h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((t, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Options */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Product Status</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Product'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
