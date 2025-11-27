'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CartEvents } from '@/lib/auth/cartEvents';
import LoginModal from '@/components/modals/LoginModal';
import Testimonials from '@/components/testimonials/Testimonials';
import ImageCarousel from '@/components/carousel/ImageCarousel';
import ProductCarousel from '@/components/carousel/ProductCarousel';
import ImageGallery from '@/components/gallery/ImageGallery';
import { toast } from 'react-toastify';


interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  description: string;
  stock: number;
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
  featured: boolean;
  categoryId: {
    name: string;
    slug: string;
  };
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=8');
      if (response.ok) {
        const data = await response.json();
        setFeaturedProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        const cartData = await response.json();
        // Dispatch cart update event with the correct cart data structure
        const cartInfo = {
          totalItems: cartData.cart.totalItems,
          uniqueItems: cartData.cart.uniqueItems,
          totalAmount: cartData.cart.totalAmount
        };
        CartEvents.dispatchItemAdded(productId, 1, cartInfo);
        toast.success('Product added to cart!');
      } else if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('accessToken');
        setShowLoginModal(true);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous messages
    setSubscriptionMessage('');
    
    // Validate email
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setSubscriptionMessage('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newsletterEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscriptionMessage('Thank you for subscribing! Check your email for confirmation.');
        setNewsletterEmail('');
      } else {
        setSubscriptionMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setSubscriptionMessage('Failed to subscribe. Please try again later.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
    >
      {/* Background Overlay */}
      <div className="min-h-screen bg-white/90 backdrop-blur-sm">
      {/* Hero Carousel */}
      <ImageCarousel
        slides={[
          {
            id: 1,
            image: '/images/carosuel1.jpg',
            title: 'Authentic Handcrafted Papads',
            subtitle: 'Traditional Taste',
            description: 'Discover the taste of tradition with our premium collection of handcrafted papads. Made with love, served with pride.',
            primaryButton: { text: 'Shop Now', href: '/products' },
            secondaryButton: { text: 'Our Story', href: '/about' },
            textPosition: 'left',
            overlay: true
          },
          {
            id: 2,
            image: '/images/carosuel2.jpg',
            title: '100% Natural Ingredients',
            subtitle: 'Pure & Healthy',
            description: 'Made with the finest natural ingredients and traditional recipes passed down through generations.',
            primaryButton: { text: 'Explore Products', href: '/products' },
            secondaryButton: { text: 'Learn More', href: '/about' },
            textPosition: 'center',
            overlay: true
          },
          {
            id: 3,
            image: '/images/carosule3.jpg',
            title: 'Fresh Delivery to Your Door',
            subtitle: 'Fast & Reliable',
            description: 'Quick and secure delivery to your doorstep. Fresh papads delivered with care and precision.',
            primaryButton: { text: 'Order Now', href: '/products' },
            textPosition: 'right',
            overlay: true
          }
        ]}
        autoPlay={true}
        autoPlayInterval={5000}
        showDots={true}
        showArrows={true}
      />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 hover:rotate-6 transition-transform duration-300">
                <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Natural</h3>
              <p className="text-gray-600">Made with pure ingredients and traditional recipes passed down through generations.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 hover:rotate-6 transition-transform duration-300">
                <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and secure delivery to your doorstep. Fresh papads delivered with care.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 hover:rotate-6 transition-transform duration-300">
                <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Made with Love</h3>
              <p className="text-gray-600">Every papad is handcrafted with passion and attention to detail by our skilled artisans.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hand-picked selection of our most popular and delicious papads.
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse h-[580px] flex flex-col"
                >
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between mb-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="flex gap-1 mb-3">
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="flex-1"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ProductCarousel
              products={featuredProducts}
              onAddToCart={handleAddToCart}
              slidesToShow={3}
              autoPlay={true}
            />
          )}
          
          <div className="text-center mt-20">
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
            >
              View All Products
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <ImageGallery />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Newsletter Section */}
      <section 
        className="py-40 bg-cover bg-center relative"
        style={{
          backgroundImage: "url('/images/carosuel1.jpg')"
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-7xl font-bold text-white mb-6">
              Stay Updated
            </h2>
            <p className="text-white mb-8 text-xl leading-relaxed">
              Subscribe to our newsletter and be the first to know about new products, special offers, and papad recipes.
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="max-w-lg">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full px-0 py-3 bg-transparent text-white placeholder-white/80 border-0 border-b-2 border-white focus:outline-none focus:border-b-teal-300 focus:ring-0 text-lg"
                    disabled={isSubscribing}
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubscribing}
                  className="px-8 py-3 bg-teal-500 text-white font-semibold hover:bg-teal-600 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {subscriptionMessage && (
                <p className={`mt-4 text-lg ${subscriptionMessage.includes('Thank you') ? 'text-teal-300' : 'text-red-300'}`}>
                  {subscriptionMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

 {/* Shipping Benefits Bar */}
      <div className="border-b border-gray-200 bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Worldwide Free Shipping */}
            <div className="flex items-center space-x-3 ">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  WORLDWIDE FREE SHIPPING
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="underline cursor-pointer hover:text-gray-700">Find out more</span>
                </p>
              </div>
            </div>

            {/* Free In Store Returns */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  FREE IN STORE RETURNS
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="underline cursor-pointer hover:text-gray-700">Find out more</span>
                </p>
              </div>
            </div>

            {/* Secure Shopping */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 6h2v7h-2V8zm0-3h2v2h-2V5z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  SECURE SHOPPING
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="underline cursor-pointer hover:text-gray-700">Find out more</span>
                </p>
              </div>
            </div>

            {/* Free Gift Wrapping */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 7h-3.17l-1.24-3.71c-.33-.99-1.26-1.69-2.32-1.69s-1.99.7-2.32 1.69L9.71 9H6.5c-.83 0-1.5.67-1.5 1.5S5.67 12 6.5 12H8v8c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-8h1.5c.83 0 1.5-.67 1.5-1.5S20.83 9 20 9z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  FREE GIFT WRAPPING
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="underline cursor-pointer hover:text-gray-700">Find out more</span>
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
    </div>
  );
}