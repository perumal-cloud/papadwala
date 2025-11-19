import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Let client-side authentication handle admin routes
  // Since we use localStorage for tokens, server-side middleware can't access them
  
  // For now, just pass through all requests
  // Admin authentication is handled by the admin layout component
  return NextResponse.next();
}

export const config = {
  // Only match specific patterns if needed in the future
  matcher: [
    // Currently no server-side auth needed since we use localStorage
    // '/api/admin/:path*' // API routes can still use their own auth middleware
  ]
};