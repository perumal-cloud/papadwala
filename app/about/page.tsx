'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Users, Award, Truck, Heart, Star, Leaf } from 'lucide-react';

export default function AboutPage() {
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
            backgroundImage: "url('/images/about_banner.jpg')"
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

          {/* Our Values */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Values
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 hover:rotate-6 transition-transform duration-300">
                  <Leaf className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Authenticity</h3>
                <p className="text-gray-600 leading-relaxed">
                  We preserve traditional recipes and cooking methods to deliver authentic flavors 
                  that have been passed down through generations.
                </p>
              </div>

              <div className="text-center p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 hover:rotate-6 transition-transform duration-300">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community</h3>
                <p className="text-gray-600 leading-relaxed">
                  We support local artisans and small businesses, creating a network that benefits 
                  entire communities while preserving culinary traditions.
                </p>
              </div>

              <div className="text-center p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center mx-auto mb-6 hover:rotate-6 transition-transform duration-300">
                  <Truck className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Convenience</h3>
                <p className="text-gray-600 leading-relaxed">
                  Modern e-commerce platform with secure payments, fast delivery, and excellent 
                  customer service to make your shopping experience seamless.
                </p>
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="mb-20 space-y-16">
            {/* Our Mission */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="bg-white shadow-xl overflow-hidden border border-gray-100">
                  <div className="aspect-w-4 aspect-h-3 relative h-100">
                    <Image
                      src="/images/mission.jpg"
                      alt="Our Mission - Bringing Authentic Indian Flavors"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                  <Star className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  To make authentic Indian snacks and delicacies accessible to everyone, everywhere. 
                  We strive to bridge the gap between traditional flavors and modern convenience, 
                  ensuring that the rich culinary heritage of India reaches every home.
                </p>
              </div>
            </div>

            {/* Our Vision */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-6">Our Vision</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  To become the leading platform for authentic Indian snacks globally, while 
                  supporting local communities and preserving traditional recipes for future 
                  generations. We envision a world where authentic flavors know no boundaries.
                </p>
              </div>
              <div className="relative">
                <div className="bg-white shadow-xl overflow-hidden border border-gray-100">
                  <div className="aspect-w-4 aspect-h-3 relative h-100">
                    <Image
                      src="/images/vision.jpg"
                      alt="Our Vision - Leading Platform for Authentic Snacks"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
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