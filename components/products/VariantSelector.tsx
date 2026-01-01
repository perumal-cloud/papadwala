'use client';

import { useState, useEffect } from 'react';

interface WeightOption {
  weight: string;
  price: number;
  stock: number;
  sku?: string;
  isActive?: boolean;
}

interface SizeVariant {
  size: string;
  weights: WeightOption[];
  isActive?: boolean;
}

interface VariantSelectorProps {
  variants: SizeVariant[];
  onSelectionChange: (size: string, weight: string, price: number, stock: number, sku?: string) => void;
}

export default function VariantSelector({ variants, onSelectionChange }: VariantSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedWeight, setSelectedWeight] = useState<string>('');
  const [availableWeights, setAvailableWeights] = useState<WeightOption[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [currentSku, setCurrentSku] = useState<string | undefined>();

  // Get active variants only
  const activeVariants = variants.filter(v => v.isActive !== false);

  // Auto-select first size on mount
  useEffect(() => {
    if (activeVariants.length > 0 && !selectedSize) {
      handleSizeChange(activeVariants[0].size);
    }
  }, []);

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    
    const variant = activeVariants.find(v => v.size === size);
    if (variant) {
      // Filter active weights
      const activeWeights = variant.weights.filter(w => w.isActive !== false);
      setAvailableWeights(activeWeights);
      
      // Auto-select first weight
      if (activeWeights.length > 0) {
        handleWeightChange(size, activeWeights[0].weight);
      } else {
        resetSelection();
      }
    } else {
      resetSelection();
    }
  };

  const handleWeightChange = (size: string, weight: string) => {
    setSelectedWeight(weight);
    
    const variant = activeVariants.find(v => v.size === size);
    const weightOption = variant?.weights.find(w => w.weight === weight && w.isActive !== false);
    
    if (weightOption) {
      setCurrentPrice(weightOption.price);
      setCurrentStock(weightOption.stock);
      setCurrentSku(weightOption.sku);
      
      // Notify parent component
      onSelectionChange(size, weight, weightOption.price, weightOption.stock, weightOption.sku);
    } else {
      resetSelection();
    }
  };

  const resetSelection = () => {
    setSelectedWeight('');
    setAvailableWeights([]);
    setCurrentPrice(0);
    setCurrentStock(0);
    setCurrentSku(undefined);
  };

  if (activeVariants.length === 0) {
    return (
      <div className="text-red-600 font-medium">
        This product is currently unavailable
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Select Size
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {activeVariants.map((variant) => (
            <button
              key={variant.size}
              type="button"
              onClick={() => handleSizeChange(variant.size)}
              className={`
                px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all
                ${selectedSize === variant.size
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }
              `}
            >
              {variant.size}
            </button>
          ))}
        </div>
      </div>

      {/* Weight Selection */}
      {availableWeights.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Select Weight
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableWeights.map((weightOption) => {
              const isOutOfStock = weightOption.stock === 0;
              
              return (
                <button
                  key={weightOption.weight}
                  type="button"
                  onClick={() => !isOutOfStock && handleWeightChange(selectedSize, weightOption.weight)}
                  disabled={isOutOfStock}
                  className={`
                    px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all relative
                    ${selectedWeight === weightOption.weight
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : isOutOfStock
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="flex flex-col items-center">
                    <span>{weightOption.weight}</span>
                    <span className="text-xs mt-1">₹{weightOption.price}</span>
                  </div>
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
                      <span className="text-xs font-semibold text-red-600">Out of Stock</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Variant Info */}
      {selectedSize && selectedWeight && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">Selected Variant</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedSize} - {selectedWeight}
              </p>
              {currentSku && (
                <p className="text-xs text-gray-500 mt-1">SKU: {currentSku}</p>
              )}
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">₹{currentPrice}</p>
              <p className="text-sm text-gray-600 mt-1">
                {currentStock > 0 ? (
                  <span className="text-green-600">
                    {currentStock} in stock
                  </span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stock Warning */}
      {selectedSize && selectedWeight && currentStock > 0 && currentStock <= 5 && (
        <div className="flex items-center gap-2 text-orange-600 text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Only {currentStock} left in stock!</span>
        </div>
      )}
    </div>
  );
}
