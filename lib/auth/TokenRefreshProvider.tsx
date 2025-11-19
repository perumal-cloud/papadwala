'use client';

import { useEffect, useState, useCallback, createContext, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface TokenRefreshContextType {
  isTokenExpired: boolean;
  showRefreshModal: boolean;
  refreshToken: () => Promise<boolean>;
  logout: () => void;
  dismissModal: () => void;
}

const TokenRefreshContext = createContext<TokenRefreshContextType | null>(null);

export const useTokenRefresh = () => {
  const context = useContext(TokenRefreshContext);
  if (!context) {
    throw new Error('useTokenRefresh must be used within TokenRefreshProvider');
  }
  return context;
};

interface TokenRefreshProviderProps {
  children: React.ReactNode;
}

export const TokenRefreshProvider: React.FC<TokenRefreshProviderProps> = ({ children }) => {
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const checkTokenExpiry = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      // Decode JWT token to check expiry
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      const currentTime = Date.now() / 1000;
      
      // Check if token expires in next 30 seconds (for testing with 1m tokens)
      if (payload.exp - currentTime < 30) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include' // Include cookies for refresh token
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        setIsTokenExpired(false);
        setShowRefreshModal(false);
        
        // Set up next check
        scheduleTokenCheck();
        return true;
      } else {
        // Refresh failed, need to logout
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setIsTokenExpired(false);
    setShowRefreshModal(false);
    
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    // Call logout API to clear refresh token
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).finally(() => {
      router.push('/auth/login');
    });
  }, [router]);

  const dismissModal = useCallback(() => {
    setShowRefreshModal(false);
    logout();
  }, [logout]);

  const scheduleTokenCheck = useCallback(() => {
    // Clear existing timer if any
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Check every 30 seconds (good for testing with 1m tokens)
    const timer = setTimeout(() => {
      if (checkTokenExpiry()) {
        setIsTokenExpired(true);
        setShowRefreshModal(true);
      } else {
        // Schedule next check (recursive call)
        scheduleTokenCheck();
      }
    }, 30 * 1000); // 30 seconds

    refreshTimerRef.current = timer;
  }, [checkTokenExpiry]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      scheduleTokenCheck();
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [scheduleTokenCheck]);

  // Handle API calls that return 401
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      if (response.status === 401 && localStorage.getItem('accessToken')) {
        setIsTokenExpired(true);
        setShowRefreshModal(true);
      }
      
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const value: TokenRefreshContextType = {
    isTokenExpired,
    showRefreshModal,
    refreshToken,
    logout,
    dismissModal
  };

  return (
    <TokenRefreshContext.Provider value={value}>
      {children}
    </TokenRefreshContext.Provider>
  );
};

// Token Refresh Modal Component
export const TokenRefreshModal: React.FC = () => {
  const { showRefreshModal, refreshToken, dismissModal } = useTokenRefresh();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const success = await refreshToken();
    setIsRefreshing(false);
    
    if (!success) {
      // If refresh fails, the logout will be handled automatically
    }
  };

  if (!showRefreshModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Session Expiring</h3>
              <p className="text-sm text-gray-600">Your session is about to expire</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Your login session has expired. Would you like to continue working or log out?
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Refreshing...
                </div>
              ) : (
                'Continue Working'
              )}
            </button>
            <button
              onClick={dismissModal}
              disabled={isRefreshing}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};