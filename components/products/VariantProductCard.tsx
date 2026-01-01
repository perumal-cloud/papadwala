'use client';

import Link from 'next/link';
import Image from 'next/image';

interface VariantProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    priceRange?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    variants: Array<{
      size: string;
      weights: Array<{
        weight: string;
        price: number;
        stock: number;
        isActive?: boolean;
      }>;
      isActive?: boolean;
    }>;
  };
}

export default function VariantProductCard({ product }: VariantProductCardProps) {
  // Calculate total stock
  const totalStock = product.variants.reduce((total, variant) => {
    if (variant.isActive !== false) {
      return total + variant.weights.reduce((sum, weight) => {
        return weight.isActive !== false ? sum + weight.stock : sum;
      }, 0);
    }
    return total;
  }, 0);

  const isInStock = totalStock > 0;
  const isLowStock = totalStock > 0 && totalStock <= 10;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {product.featured && (
              <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded">
                Featured
              </span>
            )}
            {!isInStock && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                Out of Stock
              </span>
            )}
            {isLowStock && (
              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded">
                Low Stock
              </span>
            )}
          </div>

          {/* Quick View Icon */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
            {product.description}
          </p>

          {/* Variant Info */}
          <div className="mb-3 text-xs text-gray-500">
            <span className="font-medium">
              {product.variants.length} size{product.variants.length > 1 ? 's' : ''} available
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              {product.priceRange ? (
                <p className="text-lg font-bold text-blue-600">
                  {product.priceRange}
                </p>
              ) : (
                <p className="text-lg font-bold text-blue-600">
                  ₹{product.minPrice || 0}
                </p>
              )}
              <p className="text-xs text-gray-500">Multiple options</p>
            </div>

            {/* Stock Indicator */}
            {isInStock ? (
              <div className="flex items-center gap-1 text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">In Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Size Options Preview */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {product.variants.slice(0, 4).map((variant, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {variant.size}
                </span>
              ))}
              {product.variants.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                  +{product.variants.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hover Action */}
        <div className="p-4 pt-0">
          <button
            type="button"
            className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700"
          >
            View Options
          </button>
        </div>
      </div>
    </Link>
  );
}
