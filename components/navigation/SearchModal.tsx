'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchHistoryManager } from '@/lib/utils/searchHistory';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  categoryId: {
    name: string;
    slug: string;
  };
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  searchResults: Product[];
  onSearchSelect: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchModal({
  isOpen,
  onClose,
  searchQuery,
  searchResults,
  onSearchSelect,
  isLoading = false
}: SearchModalProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready
      setTimeout(() => setIsAnimating(true), 10);
      
      // Load search history
      setRecentSearches(SearchHistoryManager.getRecentSearches(5));
      
      // Load popular searches from API
      loadPopularSearches();
      
      // Load featured products
      loadFeaturedProducts();
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before unmounting
      setTimeout(() => setShouldRender(false), 500);
    }
  }, [isOpen]);

  const loadPopularSearches = async () => {
    try {
      const response = await fetch('/api/search/popular');
      if (response.ok) {
        const data = await response.json();
        setPopularSearches(data.popular.map((item: any) => item.query).slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading popular searches:', error);
      // Fallback to default popular searches
      setPopularSearches(['traditional papads', 'spiced varieties', 'premium collection', 'organic options']);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true&limit=8');
      if (response.ok) {
        const data = await response.json();
        setFeaturedProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
    }
  };

  const handleSearchClick = async (query: string) => {
    // Track search in API
    try {
      await fetch('/api/search/popular', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
    
    // Add to local search history
    SearchHistoryManager.addSearchQuery(query);
    
    handleClose();
    // Navigate to products page with search query
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  const handleProductClick = (product: Product) => {
    handleClose();
    router.push(`/products/${product.slug}`);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ease-out ${
        isAnimating 
          ? 'bg-opacity-50' 
          : 'bg-opacity-0 backdrop-blur-none'
      }`}
      onClick={handleClose}
      style={{
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="max-w-7xl mx-auto pt-18">
        <div 
          className={`bg-white max-h-[80vh] overflow-hidden transition-all duration-500 ease-out transform ${
            isAnimating 
              ? 'translate-y-0 opacity-100 scale-100' 
              : '-translate-y-8 opacity-0 scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
          style={{
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'top center',
          }}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold text-gray-900 transition-all duration-700 delay-100 ${
                isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>Search Products</h2>
              <button
                onClick={handleClose}
                className={`p-2 text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110 ${
                  isAnimating ? 'translate-x-0 opacity-100 rotate-0' : 'translate-x-4 opacity-0 rotate-90'
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-700 delay-200 ${
              isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              {/* Left Column - Search History & Popular Searches */}
              <div className={`lg:col-span-1 transition-all duration-700 delay-300 ${
                isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'
              }`}>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">Recent Searches</h3>
                      <button
                        onClick={() => {
                          SearchHistoryManager.clearSearchHistory();
                          setRecentSearches([]);
                        }}
                        className="text-xs text-teal-600 hover:text-teal-700"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchClick(query)}
                          className={`flex items-center w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm ${
                            isAnimating 
                              ? 'translate-x-0 opacity-100' 
                              : '-translate-x-4 opacity-0'
                          }`}
                          style={{
                            transitionDelay: `${400 + index * 100}ms`
                          }}
                        >
                          <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                {popularSearches.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Top Searches</h3>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchClick(query)}
                          className={`px-3 py-1.5 bg-gray-100 hover:bg-teal-100 text-sm text-gray-700 hover:text-teal-700 rounded-full transition-all duration-300 hover:scale-105 transform ${
                            isAnimating 
                              ? 'translate-y-0 opacity-100' 
                              : 'translate-y-4 opacity-0'
                          }`}
                          style={{
                            transitionDelay: `${500 + index * 80}ms`
                          }}
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories Quick Links */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Categories</h3>
                  <div className="space-y-1">
                    {['Traditional Papads', 'Spiced Varieties', 'Crispy Papads', 'Organic Papads', 'Premium Collection', 'Handmade Papads'].map((category, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchClick(category)}
                        className={`flex items-center w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm transform ${
                          isAnimating 
                            ? 'translate-x-0 opacity-100' 
                            : '-translate-x-4 opacity-0'
                        }`}
                        style={{
                          transitionDelay: `${600 + index * 100}ms`
                        }}
                      >
                        <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Search Results or Featured Products */}
              <div className={`lg:col-span-2 transition-all duration-700 delay-400 ${
                isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
              }`}>
                {searchQuery.trim() ? (
                  <>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      Search Results for "{searchQuery}"
                      {searchResults.length > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({searchResults.length} found)
                        </span>
                      )}
                    </h3>
                    
                    {isLoading ? (
                      <div className={`flex items-center justify-center py-8 transition-all duration-500 ${
                        isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                      }`}>
                        <div className="w-8 h-8 animate-spin border-2 border-teal-600 border-t-transparent rounded-full"></div>
                        <span className="ml-3 text-gray-600">Searching...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                        {searchResults.map((product) => (
                          <div
                            key={product._id}
                            onClick={() => handleProductClick(product)}
                            className={`flex items-center p-3 border border-gray-200 rounded-lg hover:border-teal-300 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-105 transform ${
                              isAnimating 
                                ? 'translate-y-0 opacity-100' 
                                : 'translate-y-6 opacity-0'
                            }`}
                            style={{
                              transitionDelay: `${500 + (searchResults.indexOf(product) * 100)}ms`
                            }}
                          >
                            <div className="flex-shrink-0 w-16 h-16 mr-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/placeholder-product.svg';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-500 truncate">
                                {product.categoryId?.name}
                              </p>
                              <p className="text-sm font-semibold text-teal-600">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-8 transition-all duration-700 delay-300 ${
                        isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                      }`}>
                        <svg className="h-16 w-16 mx-auto text-gray-300 mb-4 transition-transform duration-700 hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No products found</h4>
                        <p className="text-gray-500">Try searching with different keywords</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Featured Products</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                      {featuredProducts.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleProductClick(product)}
                          className={`flex items-center p-3 border border-gray-200 rounded-lg hover:border-teal-300 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-105 transform ${
                            isAnimating 
                              ? 'translate-y-0 opacity-100' 
                              : 'translate-y-6 opacity-0'
                          }`}
                          style={{
                            transitionDelay: `${500 + (featuredProducts.indexOf(product) * 100)}ms`
                          }}
                        >
                          <div className="flex-shrink-0 w-16 h-16 mr-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder-product.svg';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {product.categoryId?.name}
                            </p>
                            <p className="text-sm font-semibold text-teal-600">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                              Featured
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}