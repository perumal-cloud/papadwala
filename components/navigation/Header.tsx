'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AuthEvents } from '@/lib/auth/events';
import SearchBar from './SearchBar';
import SearchModal from './SearchModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  profilePicture?: string;
}

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

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Track auth loading state
  
  // Search modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initial token check
    const checkAuthStatus = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        fetchUserProfile(token);
        fetchCartCount(token);
      } else {
        setIsAuthLoading(false); // No token, so we're done loading
      }
    };

    // Check auth status immediately
    checkAuthStatus();

    // Also check after a short delay (handles page transitions)
    const timeoutId = setTimeout(checkAuthStatus, 200);

    // Listen for localStorage changes (including from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        if (e.newValue) {
          // Token was added/updated
          setIsAuthLoading(true);
          fetchUserProfile(e.newValue);
          fetchCartCount(e.newValue);
        } else {
          // Token was removed
          setUser(null);
          setCartItems(0);
          setIsAuthLoading(false);
        }
      }
    };

    // Listen for profile updates and login events
    const handleProfileUpdate = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        fetchUserProfile(token);
        fetchCartCount(token);
      }
    };

    const handleLogin = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        setIsAuthLoading(true); // Show loading while fetching user data
        fetchUserProfile(token);
        fetchCartCount(token);
      }
    };

    const handleLogoutEvent = () => {
      setUser(null);
      setCartItems(0);
      setIsAuthLoading(false);
    };

    // Listen for authentication state changes
    const handleAuthStateChange = (e: CustomEvent) => {
      const { isLoggedIn, token } = e.detail;
      if (isLoggedIn && token) {
        setIsAuthLoading(true);
        fetchUserProfile(token);
        fetchCartCount(token);
      } else {
        setUser(null);
        setCartItems(0);
        setIsAuthLoading(false);
      }
    };

    // Listen for cart data update events (real-time updates)
    const handleCartDataUpdate = (e: CustomEvent) => {
      const { uniqueItems } = e.detail; // Use uniqueItems for cart icon count
      setCartItems(uniqueItems);
    };

    const handleCartCleared = () => {
      setCartItems(0);
    };

    // Listen for custom events and storage changes
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    window.addEventListener('userLoggedIn', handleLogin);
    window.addEventListener('userLoggedOut', handleLogoutEvent);
    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);
    
    // Cart event listeners
    window.addEventListener('cartDataUpdated', handleCartDataUpdate as EventListener);
    window.addEventListener('cartCleared', handleCartCleared);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
      window.removeEventListener('userLoggedIn', handleLogin);
      window.removeEventListener('userLoggedOut', handleLogoutEvent);
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
      
      // Remove cart event listeners
      window.removeEventListener('cartDataUpdated', handleCartDataUpdate as EventListener);
      window.removeEventListener('cartCleared', handleCartCleared);
    };
  }, []);

  // Watch for route changes and recheck auth status
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      // If we have a token but no user data, fetch it
      setIsAuthLoading(true);
      fetchUserProfile(token);
      fetchCartCount(token);
    }
  }, [pathname, user]);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        // If token is invalid, remove it
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If there's an error, remove token and reset user
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setIsAuthLoading(false); // Always set loading to false
    }
  };

  const fetchCartCount = async (token: string) => {
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const cartData = await response.json();
        setCartItems(cartData.cart?.uniqueItems || 0); // Use uniqueItems for cart icon
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    };
  };

  // Search modal handlers
  const handleSearchFocus = useCallback(() => {
    setIsSearchModalOpen(true);
  }, []);

  const handleSearchModalClose = useCallback(() => {
    setIsSearchModalOpen(false);
  }, []);

  const handleSearchResults = useCallback((results: Product[], query: string, loading: boolean) => {
    setSearchResults(results);
    setSearchQuery(query);
    setIsSearchLoading(loading);
  }, []);

  const handleSearchSelect = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleLogout = () => {
    AuthEvents.removeToken();
    setUser(null);
    setCartItems(0);
    router.push('/');
  };

  // Profile Avatar Component
  const ProfileAvatar = ({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-6 h-6 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base'
    };

    return (
      <div className={`${sizeClasses[size]} bg-teal-600 rounded-full flex items-center justify-center overflow-hidden`}>
        {user.profilePicture ? (
          <img 
            src={user.profilePicture} 
            alt={user.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling!.setAttribute('style', 'display: flex');
            }}
          />
        ) : null}
        <span className={`text-white font-medium ${user.profilePicture ? 'hidden' : ''}`}>
          {user.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">PapadShop</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <SearchBar 
              onFocus={handleSearchFocus}
              onSearchResults={handleSearchResults}
              value={searchQuery}
              onChange={handleSetSearchQuery}
              onSearchSubmit={handleSearchModalClose}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-teal-600 transition-colors">
              Home
            </Link>
              <Link href="/about" className="text-gray-700 hover:text-teal-600 transition-colors">
              About
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-teal-600 transition-colors">
              Products
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-teal-600 transition-colors">
              Categories
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-teal-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-teal-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7" />
              </svg>
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthLoading ? (
              // Show loading spinner while checking authentication
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
            ) : user ? (
              <div className="relative group">
                <button className="flex items-center space-x-3 text-gray-700 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-gray-50">
                  <ProfileAvatar user={user} size="md" />
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <ProfileAvatar user={user} size="lg" />
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-teal-600 capitalize font-medium">{user.role}</div>
                      </div>
                    </div>
                  </div>
                  <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </Link>
                  <Link href="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-teal-600 border border-teal-600 hover:bg-teal-50 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-teal-600 text-white  hover:bg-teal-700 transition-colors font-medium shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-teal-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {/* Search */}
              <SearchBar 
                isMobile={true} 
                onFocus={handleSearchFocus}
                onSearchResults={handleSearchResults}
                value={searchQuery}
                onChange={handleSetSearchQuery}
                onSearchSubmit={handleSearchModalClose}
              />

              {/* Navigation Links */}
              <Link href="/" className="text-gray-700 hover:text-teal-600 transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-teal-600 transition-colors">
                Products
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-teal-600 transition-colors">
                Categories
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-teal-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-teal-600 transition-colors">
                Contact
              </Link>
              <Link href="/cart" className="flex items-center text-gray-700 hover:text-teal-600 transition-colors">
                Cart
                {cartItems > 0 && (
                  <span className="ml-2 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </Link>

              {/* User Actions */}
              {isAuthLoading ? (
                <div className="pt-4 border-t border-gray-200 flex justify-center">
                  <div className="w-8 h-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
                </div>
              ) : user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <ProfileAvatar user={user} size="lg" />
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-teal-600 capitalize font-medium">{user.role}</div>
                    </div>
                  </div>
                  <Link href="/profile" className="flex items-center text-gray-700 hover:text-teal-600 transition-colors mb-3 p-2 rounded hover:bg-gray-50">
                    <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </Link>
                  <Link href="/orders" className="flex items-center text-gray-700 hover:text-teal-600 transition-colors mb-3 p-2 rounded hover:bg-gray-50">
                    <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="flex items-center text-gray-700 hover:text-teal-600 transition-colors mb-3 p-2 rounded hover:bg-gray-50">
                      <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left text-red-600 hover:text-red-700 transition-colors p-2 rounded hover:bg-red-50"
                  >
                    <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link
                    href="/auth/login"
                    className="block w-full text-center px-4 py-3 text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block w-full text-center px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={handleSearchModalClose}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onSearchSelect={handleSearchSelect}
        isLoading={isSearchLoading}
      />
    </header>
  );
}