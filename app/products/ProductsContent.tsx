'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CartEvents } from '@/lib/auth/cartEvents';
import LoginModal from '@/components/modals/LoginModal';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  description: string;
  stock: number;
  categoryId: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams?.get('category');
    const searchParam = searchParams?.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    fetchCategories();
  }, [searchParams]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, searchQuery, currentPage]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sort: sortBy,
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
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
        alert('Product added to cart!');
      } else if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('accessToken');
        setShowLoginModal(true);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed"
      >
        <div className="min-h-screen bg-white/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-teal-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
    >
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Search Results Header */}
          {searchQuery && (
            <div className="bg-teal-50 border border-teal-200 p-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-teal-800">
                    Search Results for "{searchQuery}"
                  </h2>
                  <p className="text-teal-600">
                    Found {products.length} product{products.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-teal-600 hover:text-teal-800 px-3 py-1 bg-white border border-teal-300 rounded-md transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}
          
          {/* Filters Section */}
          <div className="bg-white/80 backdrop-blur-md p-8 shadow-lg border border-gray-200/50 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-3">
                  Search Products
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-3">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label htmlFor="sort" className="block text-sm font-semibold text-gray-700 mb-3">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="-name">Name (Z-A)</option>
                  <option value="price">Price (Low to High)</option>
                  <option value="-price">Price (High to Low)</option>
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSearchQuery('');
                    setSortBy('name');
                  }}
                  className="w-full px-6 py-3 bg-teal-500 text-white transition-all duration-200 font-semibold "
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
                {products.map((product) => (
                  <div key={product._id} className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                    <div className="relative">
                      <Link href={`/products/${product.slug}`}>
                        <div className="aspect-w-1 aspect-h-1 w-full h-52 bg-gray-200 relative overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              layout="fill"
                              objectFit="cover"
                              className="group-hover:opacity-75 transition-opacity duration-300"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                              <span className="text-gray-400 font-medium">No Image</span>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Add to Cart Button - Appears on Hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-in-out z-20">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product._id);
                          }}
                          disabled={product.stock <= 0}
                          className={`w-full flex items-center justify-center gap-2 h-12 px-4 font-semibold transition-all duration-200 ${
                            product.stock <= 0 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-teal-500 text-white cursor-pointer hover:bg-teal-600 transform hover:scale-105 active:scale-95 shadow-lg'
                          }`}
                        >
                          {product.stock <= 0 ? (
                            <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                              </svg>
                              Out of Stock
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                              </svg>
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>

                      {/* Stock Status Overlay */}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30">
                          <span className="text-white font-bold text-lg">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 hover:text-teal-600 transition-colors duration-200 line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <p className="text-sm text-gray-500 mb-4 font-medium">
                        {product.categoryId?.name}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.stock > 0 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-3">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-teal-50 border-2 border-gray-200 hover:border-teal-300 hover:scale-105'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          currentPage === pageNumber
                            ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-teal-50 border-2 border-gray-200 hover:border-teal-300 hover:scale-105'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-teal-50 border-2 border-gray-200 hover:border-teal-300 hover:scale-105'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
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