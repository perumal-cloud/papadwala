'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Users, Award, Truck, Heart, Star, Leaf } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  categoryId: {
    name: string;
  };
}

export default function AboutPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=6');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Helper function to split description into points
  const getDescriptionPoints = (description: string) => {
    // Split by common delimiters like periods, commas, semicolons, or new lines
    const points = description
      .split(/[.,;]|\n/)
      .map(point => point.trim())
      .filter(point => point.length > 10) // Filter out very short fragments
      .slice(0, 4); // Take only first 4 points
    return points;
  };
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
    >
      {/* Background Overlay */}
      <div className="min-h-screen bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-800 font-medium transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div 
          className="relative py-40 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/about.jpg')"
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                About Papad
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Your trusted destination for authentic Indian snacks and traditional delicacies
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Our Story */}
          <section className="mb-20">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Story</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Papad was born from a passion for bringing authentic Indian flavors to your doorstep. 
                  Founded with the vision of preserving traditional recipes while embracing modern convenience, 
                  we've been serving delicious, handcrafted snacks that connect you to the rich culinary heritage of India.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  From traditional papads to contemporary snacks, every product in our collection is carefully 
                  selected and quality-tested to ensure you get nothing but the best. We work directly with 
                  local artisans and manufacturers who share our commitment to authenticity and quality.
                </p>
              </div>
              <div className="relative">
                <div className="bg-white shadow-xl overflow-hidden border border-gray-100">
                  <div className="aspect-w-4 aspect-h-5 relative h-100">
                    <Image
                      src="/images/quality.jpg"
                      alt="Quality Assured - Authentic Papad Making"
                      fill
                      className="object-cover"
                    />
                    {/* Overlay with quality message */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Quality Assured</h3>
                      <p className="text-white/90 leading-relaxed">
                        Every product undergoes rigorous quality checks to maintain our high standards
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Papad?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience the difference that quality, tradition, and care make
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Farm Fresh Ingredients */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Farm Fresh Ingredients</h3>
                <p className="text-gray-700 leading-relaxed">
                  We source premium quality ingredients directly from trusted farmers and suppliers. 
                  Every product is made with fresh, natural ingredients without any harmful chemicals or preservatives.
                </p>
              </div>

              {/* Hygienic Processing */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Hygienic Processing</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our products are prepared in FSSAI certified facilities following strict hygiene standards. 
                  From preparation to packaging, quality control is our top priority at every stage.
                </p>
              </div>

              {/* Traditional Recipes */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Authentic Recipes</h3>
                <p className="text-gray-700 leading-relaxed">
                  Every product is crafted using age-old traditional recipes passed through generations. 
                  We preserve the authentic taste while ensuring modern food safety standards.
                </p>
              </div>

              {/* Quick Delivery */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Fast & Safe Delivery</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your order is carefully packed and delivered quickly to your doorstep. 
                  We ensure products reach you in perfect condition with proper packaging.
                </p>
              </div>

              {/* Customer Satisfaction */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer First</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your satisfaction is our success. We offer hassle-free returns, responsive customer support, 
                  and always go the extra mile to ensure you're happy with your purchase.
                </p>
              </div>

              {/* Value for Money */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Best Value</h3>
                <p className="text-gray-700 leading-relaxed">
                  Premium quality at fair prices. We work directly with artisans and eliminate middlemen, 
                  passing the savings to you while ensuring fair compensation for producers.
                </p>
              </div>
            </div>
          </section>

          {/* Our Food Heritage */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Food Heritage
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Celebrating centuries of culinary tradition and authentic flavors
              </p>
            </div>

            {/* Traditional Food Making */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div className="relative">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl shadow-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-6">
                    <Leaf className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Traditional Preparation</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Our papads and snacks are crafted using time-honored recipes passed down through generations. 
                    Each product is made with carefully selected ingredients - from premium lentils and rice flour 
                    to aromatic spices like cumin, black pepper, and asafoetida.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    The traditional sun-drying process we follow not only preserves the authentic taste but also 
                    maintains the nutritional value of our products. This age-old method ensures every papad has 
                    the perfect texture and crispiness when cooked.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-teal-500">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">🌾 Natural Ingredients</h4>
                  <p className="text-gray-600">
                    We use 100% natural ingredients sourced from trusted farmers. No artificial preservatives, 
                    colors, or flavors - just pure, wholesome goodness from nature.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">👨‍🍳 Artisan Crafted</h4>
                  <p className="text-gray-600">
                    Each batch is handcrafted by skilled artisans who have mastered the art of papad making. 
                    Their expertise ensures consistent quality and authentic taste in every piece.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">🌶️ Authentic Spices</h4>
                  <p className="text-gray-600">
                    Our secret blend of traditional Indian spices adds layers of flavor while providing 
                    digestive benefits. Each spice is carefully measured to create the perfect balance.
                  </p>
                </div>
              </div>
            </div>

            {/* Health Benefits */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Health Benefits</h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Delicious taste meets nutritional value
                </p>
              </div>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-xl">
                  <div className="text-4xl mb-3">💪</div>
                  <h4 className="font-semibold text-gray-900 mb-2">High Protein</h4>
                  <p className="text-sm text-gray-600">Rich in plant-based proteins from lentils and pulses</p>
                </div>
                <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-xl">
                  <div className="text-4xl mb-3">🌱</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fiber Rich</h4>
                  <p className="text-sm text-gray-600">Aids digestion and promotes gut health</p>
                </div>
                <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-xl">
                  <div className="text-4xl mb-3">🔥</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Low Calorie</h4>
                  <p className="text-sm text-gray-600">Guilt-free snacking option for health-conscious consumers</p>
                </div>
                <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-xl">
                  <div className="text-4xl mb-3">✨</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Gluten-Free Options</h4>
                  <p className="text-sm text-gray-600">Suitable for various dietary preferences</p>
                </div>
              </div>
            </div>

            {/* Food Varieties */}
            <div className="mt-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Product Range</h3>
              
              {isLoadingProducts ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const descriptionPoints = getDescriptionPoints(product.description);
                    return (
                      <div
                        key={product._id}
                        className="group relative overflow-hidden rounded-xl cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300"
                      >
                        {/* Image Container with Aspect Ratio */}
                        <div className="relative aspect-square bg-gradient-to-br from-teal-100 to-orange-100 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                              <span className="text-white text-6xl font-bold">
                                {product.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}

                          {/* Content Overlay sliding from bottom on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/40 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out flex items-end">
                            <div className="text-left p-6 w-full">
                              {/* Category Badge */}
                              <div className="inline-block bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                                {product.categoryId?.name || 'Snacks'}
                              </div>
                              
                              {/* Product Name */}
                              <h4 className="text-white text-xl font-bold mb-3 leading-tight">
                                {product.name}
                              </h4>
                              
                              {/* Description Points */}
                              {descriptionPoints.length > 0 ? (
                                <ul className="text-white/90 text-sm space-y-1.5 line-clamp-4">
                                  {descriptionPoints.slice(0, 3).map((point, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="text-teal-400 mr-2 mt-0.5">•</span>
                                      <span className="line-clamp-1">{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No products available at the moment.</p>
                </div>
              )}
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Experience Authentic Flavors?
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Explore our collection of traditional Indian snacks and discover the taste of authenticity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/products" 
                className="inline-flex items-center px-8 py-4 bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Shop Now
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center px-8 py-4 border-2 border-teal-600 text-teal-600 font-semibold hover:bg-teal-50 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Contact Us
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}