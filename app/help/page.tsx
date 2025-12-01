'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, MessageCircle, Book, ShoppingCart, CreditCard, Truck, Shield, Phone, Mail, Clock, ChevronDown, ChevronRight } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'ordering' | 'payment' | 'shipping' | 'account' | 'products' | 'general';
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I place an order?',
    answer: 'To place an order, browse our products, add items to your cart, and proceed to checkout. You\'ll need to create an account or sign in, provide shipping details, and complete payment.',
    category: 'ordering'
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'Currently, we only accept Cash on Delivery (COD). You can pay in cash when your order is delivered to your doorstep. Online payment options will be available soon.',
    category: 'payment'
  },
  {
    id: '3',
    question: 'What are the shipping charges?',
    answer: 'We charge ₹50 for orders below ₹500. Orders above ₹500 get FREE shipping! Standard delivery takes 3-5 business days within India.',
    category: 'shipping'
  },
  {
    id: '3a',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3-5 business days within India. All orders are carefully packaged and shipped with trusted courier partners.',
    category: 'shipping'
  },
  {
    id: '4',
    question: 'Can I track my order?',
    answer: 'Yes! Once your order is shipped, you\'ll receive a tracking number via email and SMS. You can also track your order from your account dashboard under "My Orders".',
    category: 'shipping'
  },
  {
    id: '5',
    question: 'What is your return policy?',
    answer: 'We offer a 7-day return policy for unopened products. Items must be in original packaging and condition. Due to food safety regulations, opened food items cannot be returned.',
    category: 'general'
  },
  {
    id: '6',
    question: 'How do I create an account?',
    answer: 'Click on "Sign Up" in the top right corner, fill in your details (name, email, phone), and verify your account through OTP. You can also create an account during checkout.',
    category: 'account'
  },
  {
    id: '7',
    question: 'Are your products fresh?',
    answer: 'Yes! All our products are made fresh and have clear expiry dates. We work directly with manufacturers to ensure maximum freshness and quality.',
    category: 'products'
  },
  {
    id: '8',
    question: 'Do you offer bulk orders?',
    answer: 'Yes, we offer special pricing for bulk orders. Please contact our customer service team at support@papad.com for bulk order inquiries.',
    category: 'ordering'
  },
  {
    id: '9',
    question: 'How do I cancel my order?',
    answer: 'You can cancel your order within 1 hour of placing it by visiting "My Orders" in your account. After that, please contact customer service for assistance.',
    category: 'ordering'
  },
  {
    id: '10',
    question: 'What if my order arrives damaged?',
    answer: 'If your order arrives damaged, please contact us immediately with photos of the damaged items. We\'ll arrange for a replacement or full refund.',
    category: 'shipping'
  },
  {
    id: '11',
    question: 'What is your quality guarantee?',
    answer: 'We guarantee 100% fresh and natural products. All papads are made with pure ingredients using traditional recipes. Every product has clear expiry dates and undergoes quality checks before shipping.',
    category: 'products'
  }
];

const categoryNames = {
  ordering: 'Ordering & Checkout',
  payment: 'Payment & Billing',
  shipping: 'Shipping & Delivery',
  account: 'Account & Profile',
  products: 'Products & Quality',
  general: 'General Questions'
};

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/images/help-center.jpg" 
            alt="Help Center" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Help Center</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
              Find answers to your questions and get the support you need
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-300 text-lg"
              />
              <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Help Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Help</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <ShoppingCart className="h-8 w-8 text-teal-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
              </div>
              <p className="text-gray-600 mb-4">Track orders, modify, or get help with your purchases</p>
              <Link href="/orders" className="text-teal-600 hover:text-teal-800 font-medium">
                View My Orders →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <CreditCard className="h-8 w-8 text-teal-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
              </div>
              <p className="text-gray-600 mb-4">Cash on Delivery - Pay when you receive your order</p>
              <Link href="/checkout" className="text-teal-600 hover:text-teal-800 font-medium">
                Checkout →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Truck className="h-8 w-8 text-teal-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Shipping</h3>
              </div>
              <p className="text-gray-600 mb-4">Delivery times, tracking, and shipping policies</p>
              <Link href="/track" className="text-teal-600 hover:text-teal-800 font-medium">
                Track Order →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-teal-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Returns</h3>
              </div>
              <p className="text-gray-600 mb-4">Return policy, refunds, and exchange information</p>
              <Link href="/contact" className="text-teal-600 hover:text-teal-800 font-medium">
                Contact Us →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-teal-50 border border-gray-300'
                }`}
              >
                All Questions
              </button>
              {Object.entries(categoryNames).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-teal-50 border border-gray-300'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-lg shadow-md">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Book className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No FAQs found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <MessageCircle className="h-16 w-16 text-teal-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-gray-600 text-lg">Our customer support team is here to help you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Phone className="h-8 w-8 text-teal-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-2">Call us for immediate assistance</p>
              <a href="tel:+911234567890" className="text-teal-600 hover:text-teal-800 font-medium">
                +91 12345 67890
              </a>
            </div>

            <div className="text-center">
              <Mail className="h-8 w-8 text-teal-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-2">Send us your questions</p>
              <a href="mailto:support@papad.com" className="text-teal-600 hover:text-teal-800 font-medium">
                support@papad.com
              </a>
            </div>

            <div className="text-center">
              <Clock className="h-8 w-8 text-teal-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-600 mb-2">Monday - Saturday</p>
              <p className="text-teal-600 font-medium">9:00 AM - 6:00 PM IST</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}