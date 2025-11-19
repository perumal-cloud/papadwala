import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';

// Simple in-memory storage for search analytics (in production, use a proper database)
interface SearchAnalytics {
  query: string;
  count: number;
  lastSearched: Date;
}

// This would normally be stored in a database like MongoDB or Redis
let searchAnalytics: Map<string, SearchAnalytics> = new Map();

// GET /api/search/popular - Get popular search terms
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get popular searches from our in-memory analytics
    const popularSearches = Array.from(searchAnalytics.values())
      .sort((a, b) => b.count - a.count) // Sort by count descending
      .slice(0, 10) // Top 10
      .map(item => ({
        query: item.query,
        count: item.count,
        lastSearched: item.lastSearched
      }));

    // If no analytics data, return some default popular searches
    if (popularSearches.length === 0) {
      const defaultPopular = [
        { query: 'traditional papads', count: 0, lastSearched: new Date() },
        { query: 'spiced varieties', count: 0, lastSearched: new Date() },
        { query: 'crispy papads', count: 0, lastSearched: new Date() },
        { query: 'organic papads', count: 0, lastSearched: new Date() },
        { query: 'premium collection', count: 0, lastSearched: new Date() },
        { query: 'handmade papads', count: 0, lastSearched: new Date() },
      ];
      
      return NextResponse.json({
        popular: defaultPopular,
        total: defaultPopular.length
      });
    }

    return NextResponse.json({
      popular: popularSearches,
      total: popularSearches.length
    });
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular searches' },
      { status: 500 }
    );
  }
}

// POST /api/search/popular - Track a search query
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length === 0) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    // Update search analytics
    const existing = searchAnalytics.get(cleanQuery);
    if (existing) {
      existing.count += 1;
      existing.lastSearched = new Date();
    } else {
      searchAnalytics.set(cleanQuery, {
        query: cleanQuery,
        count: 1,
        lastSearched: new Date()
      });
    }

    // Keep only the most recent 1000 search terms to prevent memory issues
    if (searchAnalytics.size > 1000) {
      const sorted = Array.from(searchAnalytics.entries())
        .sort(([,a], [,b]) => b.lastSearched.getTime() - a.lastSearched.getTime());
      
      searchAnalytics.clear();
      sorted.slice(0, 500).forEach(([key, value]) => {
        searchAnalytics.set(key, value);
      });
    }

    return NextResponse.json({
      success: true,
      query: cleanQuery,
      count: searchAnalytics.get(cleanQuery)?.count || 0
    });
  } catch (error) {
    console.error('Error tracking search:', error);
    return NextResponse.json(
      { error: 'Failed to track search' },
      { status: 500 }
    );
  }
}