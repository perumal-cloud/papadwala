// Utility to handle API requests with automatic token refresh
export class ApiClient {
  private static refreshPromise: Promise<boolean> | null = null;

  static async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('accessToken');
    
    // Add authorization header if token exists
    const headers = {
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // If unauthorized and we have a token, try to refresh
    if (response.status === 401 && token) {
      const refreshed = await this.refreshToken();
      
      if (refreshed) {
        // Retry the original request with new token
        const newToken = localStorage.getItem('accessToken');
        const retryHeaders = {
          ...options.headers,
          ...(newToken && { 'Authorization': `Bearer ${newToken}` })
        };

        return fetch(url, {
          ...options,
          headers: retryHeaders
        });
      } else {
        // Refresh failed, redirect to login
        this.logout();
        throw new Error('Session expired');
      }
    }

    return response;
  }

  private static async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    
    return result;
  }

  private static async performRefresh(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  private static logout(): void {
    localStorage.removeItem('accessToken');
    
    // Call logout API to clear refresh token
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).finally(() => {
      window.location.href = '/auth/login';
    });
  }

  // Helper methods for common HTTP methods
  static async get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.makeRequest(url, { ...options, method: 'GET' });
  }

  static async post(url: string, body?: any, options: RequestInit = {}): Promise<Response> {
    const isFormData = body instanceof FormData;
    
    return this.makeRequest(url, {
      ...options,
      method: 'POST',
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...options.headers
      },
      body: isFormData ? body : JSON.stringify(body)
    });
  }

  static async put(url: string, body?: any, options: RequestInit = {}): Promise<Response> {
    const isFormData = body instanceof FormData;
    
    return this.makeRequest(url, {
      ...options,
      method: 'PUT',
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...options.headers
      },
      body: isFormData ? body : JSON.stringify(body)
    });
  }

  static async delete(url: string, options: RequestInit = {}): Promise<Response> {
    return this.makeRequest(url, { ...options, method: 'DELETE' });
  }
}