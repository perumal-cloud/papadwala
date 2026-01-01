'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/auth/ApiClient';
import { toast } from 'react-toastify';
import VariantSelector from '@/components/products/VariantSelector';
import ImageGallery from '@/components/gallery/ImageGallery';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  variants: Array<{
    size: string;
    weights: Array<{
      weight: string;
      price: number;
      stock: number;
      sku?: string;
      isActive?: boolean;
    }>;
    isActive?: boolean;
  }>;
  ingredients?: string[];
  nutritionInfo?: any;
  tags: string[];
  isActive: boolean;
  featured: boolean;
  priceRange?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface VariantProductPageProps {
  productId: string;
}

export default function VariantProductPage({ productId }: VariantProductPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Variant selection state
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedWeight, setSelectedWeight] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedStock, setSelectedStock] = useState(0);
  const [selectedSku, setSelectedSku] = useState<string | undefined>();
  
  // Quantity
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await ApiClient.get(`/api/products/variants/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else {
        toast.error('Product not found');
        router.push('/products');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantChange = (
    size: string,
    weight: string,
    price: number,
    stock: number,
    sku?: string
  ) => {
    setSelectedSize(size);
    setSelectedWeight(weight);
    setSelectedPrice(price);
    setSelectedStock(stock);
    setSelectedSku(sku);
    
    // Reset quantity if it exceeds new stock
    if (quantity > stock) {
      setQuantity(Math.min(1, stock));
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > selectedStock) {
      setQuantity(selectedStock);
      toast.warning(`Only ${selectedStock} items available`);
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedWeight) {
      toast.error('Please select size and weight');
      return;
    }

    if (selectedStock === 0) {
      toast.error('This variant is out of stock');
      return;
    }

    if (quantity > selectedStock) {
      toast.error('Selected quantity exceeds available stock');
      return;
    }

    setAddingToCart(true);

    try {
      const response = await ApiClient.post('/api/cart', {
        productId: product!._id,
        size: selectedSize,
        weight: selectedWeight,
        quantity: quantity
      });

      if (response.ok) {
        toast.success('Added to cart!');
        // Optionally refresh cart count
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (!addingToCart) {
      router.push('/cart');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Product Name & Price Range */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            {product.priceRange && !selectedSize && (
              <p className="text-2xl font-semibold text-blue-600">
                {product.priceRange}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Variant Selector */}
          <VariantSelector
            variants={product.variants}
            onSelectionChange={handleVariantChange}
          />

          {/* Quantity & Add to Cart */}
          {selectedSize && selectedWeight && selectedStock > 0 && (
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                    disabled={quantity <= 1}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <input
                    type="number"
                    min="1"
                    max={selectedStock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-20 h-10 text-center border border-gray-300 rounded-lg font-medium"
                  />
                  
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                    disabled={quantity >= selectedStock}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                  className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Total Price */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total Price:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{(selectedPrice * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Out of Stock */}
          {selectedSize && selectedWeight && selectedStock === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">This variant is currently out of stock</p>
            </div>
          )}

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition Info */}
          {product.nutritionInfo && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Nutrition Information (per 100g)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(product.nutritionInfo).map(([key, value]) => {
                  const numValue = Number(value);
                  return numValue > 0 ? (
                    <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="font-medium text-gray-900">{numValue}g</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
