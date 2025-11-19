'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

interface SearchBarProps {
  isMobile?: boolean;
  onFocus?: () => void;
  onSearchResults?: (results: Product[], query: string, isLoading: boolean) => void;
  value?: string;
  onChange?: (value: string) => void;
  onSearchSubmit?: () => void;
}

export default function SearchBar({ 
  isMobile = false, 
  onFocus, 
  onSearchResults, 
  value, 
  onChange,
  onSearchSubmit
}: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef<string>('');

  // Use controlled value if provided, otherwise use internal state
  const query = value !== undefined ? value : internalQuery;
  const setQuery = onChange || setInternalQuery;

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !onSearchResults || lastSearchRef.current === searchQuery) return;

    lastSearchRef.current = searchQuery;
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(searchQuery)}&limit=12`
      );
      
      if (response.ok) {
        const data = await response.json();
        onSearchResults(data.products || [], searchQuery, false);
      }
    } catch (error) {
      console.error('Search failed:', error);
      onSearchResults([], searchQuery, false);
    } finally {
      setIsLoading(false);
    }
  }, [onSearchResults]);

  // Debounced search function
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim()) {
      if (onSearchResults) {
        setIsLoading(true);
        onSearchResults([], query, true);
      }
      
      debounceRef.current = setTimeout(() => {
        searchProducts(query.trim());
      }, 300);
    } else {
      // Only clear results if we have onSearchResults callback and we're not in initial state
      if (onSearchResults) {
        onSearchResults([], '', false);
      }
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  const handleSearchSubmit = async () => {
    if (query.trim()) {
      // Add to search history
      SearchHistoryManager.addSearchQuery(query.trim());
      
      // Track search in API
      try {
        await fetch('/api/search/popular', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: query.trim() }),
        });
      } catch (error) {
        console.error('Error tracking search:', error);
        // Continue anyway, tracking is not critical
      }
      
      // Call onSearchSubmit callback if provided (to close modal)
      if (onSearchSubmit) {
        onSearchSubmit();
      }
      
      // Navigate to search results
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleFocus = () => {
    if (onFocus) {
      onFocus();
    }
  };

  const clearSearch = () => {
    setQuery('');
    lastSearchRef.current = '';
    if (onSearchResults) {
      onSearchResults([], '', false);
    }
  };

  return (
    <div className={`relative ${isMobile ? 'w-full' : 'flex-1 max-w-lg'}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Search products..."
          className={`
            w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
            ${isMobile ? 'text-base' : 'text-sm'}
          `}
        />
        
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="w-4 h-4 animate-spin border-2 border-teal-600 border-t-transparent rounded-full"></div>
          ) : (
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
          {query.trim() && (
            <button
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          <button
            onClick={handleSearchSubmit}
            disabled={!query.trim()}
            className="p-1 text-gray-400 hover:text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}