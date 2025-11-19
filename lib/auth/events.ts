// Authentication utility functions for managing login state across the app

export const AuthEvents = {
  // Dispatch login event with token validation
  dispatchLogin: () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Dispatch multiple events to ensure all components are notified
      window.dispatchEvent(new Event('userLoggedIn'));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'accessToken',
        newValue: token,
        oldValue: null,
        storageArea: localStorage
      }));
      
      // Also trigger a custom event with token data
      window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { isLoggedIn: true, token }
      }));
    }
  },

  // Dispatch logout event
  dispatchLogout: () => {
    window.dispatchEvent(new Event('userLoggedOut'));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'accessToken',
      newValue: null,
      oldValue: localStorage.getItem('accessToken'),
      storageArea: localStorage
    }));
    
    window.dispatchEvent(new CustomEvent('authStateChanged', {
      detail: { isLoggedIn: false, token: null }
    }));
  },

  // Dispatch profile update event
  dispatchProfileUpdate: () => {
    window.dispatchEvent(new Event('userProfileUpdated'));
  },

  // Check if user is currently logged in
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  // Get current access token
  getToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  // Set access token and dispatch login event
  setToken: (token: string) => {
    localStorage.setItem('accessToken', token);
    AuthEvents.dispatchLogin();
  },

  // Remove access token and dispatch logout event
  removeToken: () => {
    localStorage.removeItem('accessToken');
    AuthEvents.dispatchLogout();
  }
};

// Export individual functions for convenience
export const { 
  dispatchLogin, 
  dispatchLogout, 
  dispatchProfileUpdate, 
  isLoggedIn, 
  getToken, 
  setToken, 
  removeToken 
} = AuthEvents;

export default AuthEvents;