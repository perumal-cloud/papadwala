// Utility for managing search history in localStorage

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  count: number;
}

export class SearchHistoryManager {
  private static readonly STORAGE_KEY = 'papadshop_search_history';
  private static readonly MAX_HISTORY_ITEMS = 10;

  // Get search history from localStorage
  static getSearchHistory(): SearchHistoryItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  }

  // Add a search query to history
  static addSearchQuery(query: string): void {
    if (typeof window === 'undefined' || !query.trim()) return;

    const cleanQuery = query.trim().toLowerCase();
    const history = this.getSearchHistory();
    
    // Find existing item
    const existingIndex = history.findIndex(item => item.query.toLowerCase() === cleanQuery);
    
    if (existingIndex >= 0) {
      // Update existing item
      history[existingIndex].count += 1;
      history[existingIndex].timestamp = Date.now();
    } else {
      // Add new item
      history.unshift({
        query: cleanQuery,
        timestamp: Date.now(),
        count: 1
      });
    }

    // Keep only max items, sorted by timestamp
    const sortedHistory = history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, this.MAX_HISTORY_ITEMS);

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sortedHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  // Get recent searches (sorted by timestamp)
  static getRecentSearches(limit: number = 5): string[] {
    return this.getSearchHistory()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(item => item.query);
  }

  // Get popular searches (sorted by count)
  static getPopularSearches(limit: number = 5): string[] {
    return this.getSearchHistory()
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => item.query);
  }

  // Clear search history
  static clearSearchHistory(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  // Remove specific search from history
  static removeSearchQuery(query: string): void {
    if (typeof window === 'undefined') return;

    const cleanQuery = query.trim().toLowerCase();
    const history = this.getSearchHistory().filter(
      item => item.query.toLowerCase() !== cleanQuery
    );

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error removing search query:', error);
    }
  }
}