'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categories, searchQuery]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories?limit=100');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        setError(data.error || 'Failed to load categories');
      }
    } catch (error) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed"
      >
        <div className="min-h-screen bg-white/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-teal-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed"
      >
        <div className="min-h-screen bg-white/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Failed to Load Categories</h1>
              <p className="text-gray-600 mb-8 text-lg">{error}</p>
              <button
                onClick={fetchCategories}
                className="inline-flex items-center px-8 py-4 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Try Again
              </button>
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
        {/* Hero Section */}
        <div 
          className="relative py-40 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/categories.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                Our Categories
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Discover our wide range of authentic products organized by categories
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Search Bar */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Favorites</h2>
              <p className="text-lg text-gray-600">Search through our categories to find exactly what you're looking for</p>
            </div>
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-lg"
              />
            </div>
          </div>

          {/* Categories Grid */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14-7l2 2-6 6 2 2-2 2-6-6-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchQuery ? 'No categories found' : 'No categories available'}
              </h3>
              <p className="text-gray-600 text-lg mb-8">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Categories will appear here when they are added'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-all duration-200 hover:scale-105"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredCategories.map((category) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-teal-100 to-teal-200">
                        <svg className="h-16 w-16 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14-7l2 2-6 6 2 2-2 2-6-6-2-2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Category overlay on hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center text-teal-600 group-hover:text-teal-700 font-semibold text-sm">
                      <span>Explore products</span>
                      <svg className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Results Count */}
          {filteredCategories.length > 0 && (
            <div className="mt-16 text-center">
              <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50">
                <p className="text-gray-700 font-medium">
                  Showing <span className="font-bold text-teal-600">{filteredCategories.length}</span> of <span className="font-bold">{categories.length}</span> categories
                  {searchQuery && (
                    <span className="ml-1">
                      for "<span className="font-semibold text-teal-600">{searchQuery}</span>"
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}