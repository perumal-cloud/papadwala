'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CartEvents } from '@/lib/auth/cartEvents';
import { toast } from 'react-toastify';

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
  };
  quantity: number;
  priceSnapshot: number;
}

interface Cart {
  _id: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
      } else if (response.status === 401) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);

        // Dispatch cart events for real-time updates
        const cartData = {
          totalItems: data.cart.totalItems,
          uniqueItems: data.cart.uniqueItems,
          totalAmount: data.cart.totalAmount
        };
        CartEvents.dispatchQuantityUpdated(productId, quantity, cartData);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
      toast.error('Failed to update cart');
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (productId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);

        // Dispatch cart events for real-time updates
        const cartData = {
          totalItems: data.cart?.totalItems || 0,
          uniqueItems: data.cart?.uniqueItems || 0,
          totalAmount: data.cart?.totalAmount || 0
        };
        CartEvents.dispatchItemRemoved(productId, cartData);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="w-24 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-6">
              <img
                src="/images/no-cart.png"
                alt="Empty cart"
                className="mx-auto max-w-md w-full h-auto"
              />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-base text-gray-500">Start shopping to add items to your cart.</p>
            <div className="mt-8">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors shadow-md"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, index) => (
                <div key={`${item.productId._id}-${index}`} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <Link href={`/products/${item.productId.slug}`} className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                        {item.productId.images && item.productId.images.length > 0 ? (
                          <Image
                            src={item.productId.images[0]}
                            alt={item.productId.name}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                            <span className="text-white text-lg font-bold">
                              {item.productId.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.productId.slug}`}>
                        <h3 className="text-lg font-medium text-gray-900 hover:text-teal-600 transition-colors">
                          {item.productId.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        Price: ₹{item.priceSnapshot}
                      </p>
                      {item.productId.stock < item.quantity && (
                        <p className="text-sm text-red-600 mt-1">
                          Only {item.productId.stock} left in stock
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                        disabled={isUpdating || item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                        disabled={isUpdating || item.quantity >= item.productId.stock}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{item.priceSnapshot * item.quantity}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.productId._id)}
                      disabled={isUpdating}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({cart.totalItems})</span>
                    <span className="font-medium">₹{cart.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold text-teal-600">₹{cart.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/products"
                  className="block w-full text-center text-teal-600 py-3 px-4 border border-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors mt-3"
                >
                  Continue Shopping
                </Link>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure Checkout</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Cash on Delivery Available
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}