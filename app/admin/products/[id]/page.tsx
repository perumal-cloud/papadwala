'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ApiClient } from '@/lib/auth/ApiClient';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  weight?: number;
  images: string[];
  ingredients?: string[];
  tags?: string[];
  nutritionInfo?: any;
  isActive: boolean;
  featured: boolean;
  categoryId: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      fetchProduct(params.id as string);
    }
  }, [params?.id]);

  const fetchProduct = async (productId: string) => {
    try {
      const response = await ApiClient.get(`/api/products/${productId}`);

      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else if (response.status === 404) {
        setError('Product not found');
      } else {
        setError('Failed to fetch product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to fetch product');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProductStatus = async () => {
    if (!product) return;

    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('categoryId', product.categoryId._id);
      formData.append('description', product.description);
      formData.append('price', product.price.toString());
      if (product.compareAtPrice) {
        formData.append('compareAtPrice', product.compareAtPrice.toString());
      }
      formData.append('stock', product.stock.toString());
      if (product.weight) {
        formData.append('weight', product.weight.toString());
      }
      formData.append('isActive', (!product.isActive).toString());
      formData.append('featured', product.featured.toString());
      
      if (product.ingredients?.length) {
        formData.append('ingredients', JSON.stringify(product.ingredients));
      }
      if (product.tags?.length) {
        formData.append('tags', JSON.stringify(product.tags));
      }
      if (product.nutritionInfo) {
        formData.append('nutritionInfo', JSON.stringify(product.nutritionInfo));
      }
      
      formData.append('keepImages', JSON.stringify(product.images));
      
      const response = await ApiClient.put(`/api/products/${product._id}`, formData);

      if (response.ok) {
        setProduct(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update product status');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Failed to update product status');
    }
  };

  const deleteProduct = async () => {
    if (!product) return;
    
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await ApiClient.delete(`/api/products/${product._id}`);

      if (response.ok) {
        alert('Product deleted successfully');
        router.push('/admin/products');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Product not found'}</h2>
            <Link
              href="/admin/products"
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/products"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleProductStatus}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  product.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {product.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <Link
                href={`/admin/products/${product._id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Edit Product
              </Link>
              <button
                onClick={deleteProduct}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Images */}
            <div className="p-8">
              <div className="space-y-6">
                {/* Main Image */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {product.images.map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`${product.name} - ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Information */}
            <div className="p-8 border-l border-gray-200">
              <div className="space-y-8">
                {/* Basic Info */}
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {product.featured && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Category:</span> {product.categoryId?.name || 'Uncategorized'}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-6">
                    <span className="font-medium">URL Slug:</span> 
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">{product.slug}</code>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                {/* Pricing */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-green-600">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.compareAtPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {product.compareAtPrice && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
                        {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock & Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock & Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                      <span className={`text-2xl font-bold ${
                        product.stock <= 5 ? 'text-red-600' : 
                        product.stock <= 20 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {product.stock} units
                      </span>
                    </div>
                    {product.weight && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                        <span className="text-lg font-semibold text-gray-900">{product.weight}g</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                {(product.ingredients?.length || product.tags?.length || product.nutritionInfo) && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                    <div className="space-y-4">
                      {product.ingredients && product.ingredients.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                          <div className="flex flex-wrap gap-2">
                            {product.ingredients.map((ingredient, index) => (
                              <span key={index} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                                {ingredient}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {product.tags && product.tags.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                          <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex space-x-4">
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors text-center font-medium"
                    >
                      View on Store →
                    </Link>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="border-t border-gray-200 pt-6 text-sm text-gray-500">
                  <div className="space-y-1">
                    <div><span className="font-medium">Created:</span> {new Date(product.createdAt).toLocaleString('en-IN')}</div>
                    <div><span className="font-medium">Last Updated:</span> {new Date(product.updatedAt).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}