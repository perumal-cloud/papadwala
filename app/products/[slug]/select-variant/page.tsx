'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CartEvents } from '@/lib/auth/cartEvents';
import Link from 'next/link';
import LoginModal from '@/components/modals/LoginModal';
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

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price?: number;
  images: string[];
  stock?: number;
  variants?: SizeVariant[];
  categoryId: {
    _id: string;
    name: string;
    slug: string;
  };
}

export default function SelectVariantPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedWeight, setSelectedWeight] = useState('');
  const [selectedVariantPrice, setSelectedVariantPrice] = useState(0);
  const [selectedVariantStock, setSelectedVariantStock] = useState(0);
  
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products?search=${slug}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        const foundProduct = data.products?.find((p: Product) => p.slug === slug);
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          router.push('/products');
        }
      } else {
        router.push('/products');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      router.push('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (!product) return;

    // Validate variant selection
    if (!selectedSize || !selectedWeight) {
      toast.error('Please select size and weight');
      return;
    }
    
    if (selectedVariantStock === 0) {
      toast.error('This variant is out of stock');
      return;
    }
    
    if (quantity > selectedVariantStock) {
      toast.error('Selected quantity exceeds available stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      const requestBody: any = {
        productId: product._id,
        quantity,
        size: selectedSize,
        weight: selectedWeight
      };

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        const cartData = {
          totalItems: data.cart.totalItems,
          uniqueItems: data.cart.uniqueItems,
          totalAmount: data.cart.totalAmount
        };
        CartEvents.dispatchItemAdded(product._id, quantity, cartData);
        
        toast.success('Product added to cart successfully!');
        // Redirect to cart page after adding
        setTimeout(() => {
          router.push('/cart');
        }, 1000);
      } else if (response.status === 401) {
        localStorage.removeItem('accessToken');
        setShowLoginModal(true);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link href="/products" className="text-teal-600 hover:text-teal-700 font-medium">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link href="/products" className="text-gray-500 hover:text-gray-700">
                  Products
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link href={`/products/${product.slug}`} className="text-gray-500 hover:text-gray-700">
                  {product.name}
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-900 font-medium">Select Options</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                    <span className="text-white text-6xl font-bold">
                      {product.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-teal-600' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selection Form */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="text-sm text-teal-600 mb-4">
                  {product.categoryId?.name}
                </div>
                
                {selectedVariantPrice > 0 && (
                  <div className="text-4xl font-bold text-teal-600 mb-4">
                    ₹{selectedVariantPrice}
                  </div>
                )}
              </div>

              {/* Stock Status */}
              {selectedSize && selectedWeight && (
                <div className={`px-4 py-2 rounded-lg inline-block text-sm font-medium ${
                  selectedVariantStock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedVariantStock > 0 ? `${selectedVariantStock} in stock` : 'Out of stock'}
                </div>
              )}

              {/* Variant Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="border-2 border-teal-200 rounded-lg p-6 bg-teal-50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Select Size & Weight
                  </h3>
                  
                  {product.variants.map((variant, vIndex) => (
                    <div key={vIndex} className="mb-6">
                      <div className="font-semibold text-gray-800 mb-4 text-lg">
                        Size: {variant.size}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {variant.weights.map((weightOption, wIndex) => (
                          <button
                            key={wIndex}
                            onClick={() => {
                              setSelectedSize(variant.size);
                              setSelectedWeight(weightOption.weight);
                              setSelectedVariantPrice(weightOption.price);
                              setSelectedVariantStock(weightOption.stock);
                              if (quantity > weightOption.stock) {
                                setQuantity(Math.min(1, weightOption.stock));
                              }
                            }}
                            disabled={weightOption.stock === 0}
                            className={`p-5 border-2 rounded-lg text-left transition-all ${
                              selectedSize === variant.size && selectedWeight === weightOption.weight
                                ? 'border-teal-600 bg-white shadow-lg scale-105'
                                : weightOption.stock === 0
                                ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                                : 'border-gray-300 hover:border-teal-400 bg-white hover:shadow-md'
                            }`}
                          >
                            <div className="font-bold text-lg mb-1">{weightOption.weight}</div>
                            <div className="text-teal-600 font-bold text-xl">₹{weightOption.price}</div>
                            {weightOption.stock === 0 && (
                              <div className="text-xs text-red-600 mt-2 font-medium">Out of stock</div>
                            )}
                            {weightOption.stock > 0 && weightOption.stock < 10 && (
                              <div className="text-xs text-orange-600 mt-2 font-medium">
                                Only {weightOption.stock} left
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selection */}
              {selectedSize && selectedWeight && selectedVariantStock > 0 && (
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <label htmlFor="quantity" className="text-lg font-medium text-gray-700">
                      Quantity:
                    </label>
                    <select
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="border-2 border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {[...Array(Math.min(selectedVariantStock, 10))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || selectedVariantStock === 0}
                      className="flex-1 bg-teal-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                    >
                      {isAddingToCart 
                        ? 'Adding to Cart...' 
                        : 'Add to Cart'
                      }
                    </button>
                    
                    <Link 
                      href={`/products/${product.slug}`}
                      className="px-6 py-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center flex items-center justify-center"
                    >
                      <span className="font-medium">View Details</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Instruction Message */}
              {(!selectedSize || !selectedWeight) && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium text-center">
                    👆 Please select a size and weight option above to continue
                  </p>
                </div>
              )}

              {/* Product Description */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">About This Product</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login Required"
        message="Please login to add items to your cart and start shopping!"
      />
    </div>
  );
}
