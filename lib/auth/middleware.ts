import { NextRequest, NextResponse } from 'next/server';
import { TokenUtils } from './utils';
import { User } from '../models';
import connectDB from '../database/connection';

// Types for authenticated request
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
}

// Auth middleware factory
export function createAuthMiddleware(options: {
  required?: boolean;
  roles?: string[];
} = {}) {
  return async function authMiddleware(
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      await connectDB();

      // Get token from Authorization header or cookies
      const authHeader = request.headers.get('authorization');
      let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      
      // If no token in header, check cookies
      if (!token) {
        token = request.cookies.get('accessToken')?.value || null;
      }

      // If no token and auth is required, return 401
      if (!token && options.required) {
        return NextResponse.json(
          { error: 'Access token required' },
          { status: 401 }
        );
      }

      // If token exists, verify it
      if (token) {
        try {
          const decoded = TokenUtils.verifyAccessToken(token);
          
          // Get user from database
          const user = await User.findById(decoded.userId).select('-passwordHash');
          
          if (!user) {
            return NextResponse.json(
              { error: 'User not found' },
              { status: 401 }
            );
          }

          // Check if user is verified (if required)
          if (!user.isVerified) {
            return NextResponse.json(
              { error: 'Account not verified. Please verify your email.' },
              { status: 403 }
            );
          }

          // Check role authorization
          if (options.roles && !options.roles.includes(user.role)) {
            return NextResponse.json(
              { error: 'Insufficient permissions' },
              { status: 403 }
            );
          }

          // Attach user to request
          (request as AuthenticatedRequest).user = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          };

        } catch (error) {
          // Token is invalid
          if (options.required) {
            return NextResponse.json(
              { error: 'Invalid or expired token' },
              { status: 401 }
            );
          }
        }
      }

      // Call the handler
      return await handler(request as AuthenticatedRequest);

    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Specific middleware functions
export const requireAuth = createAuthMiddleware({ required: true });
export const requireAdmin = createAuthMiddleware({ required: true, roles: ['admin'] });
export const optionalAuth = createAuthMiddleware({ required: false });

// Rate limiting middleware
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function createRateLimitMiddleware(options: {
  windowMs?: number;
  max?: number;
  keyGenerator?: (request: NextRequest) => string;
} = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // 100 requests per window
    keyGenerator = (req) => getClientIP(req)
  } = options;

  return function rateLimitMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    const key = keyGenerator(request);
    const now = Date.now();
    
    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }

    // Get or create rate limit info
    let rateLimitInfo = rateLimitStore.get(key);
    if (!rateLimitInfo || rateLimitInfo.resetTime < now) {
      rateLimitInfo = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Increment count
    rateLimitInfo.count++;
    rateLimitStore.set(key, rateLimitInfo);

    // Check if limit exceeded
    if (rateLimitInfo.count > max) {
      const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
      
      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitInfo.resetTime.toString()
          }
        }
      );
    }

    // Add rate limit headers
    const response = handler(request);
    
    // Note: We can't modify headers on the response directly in this pattern
    // Headers would need to be added in the handler itself
    
    return response;
  };
}

// Input validation middleware
export function createValidationMiddleware<T>(
  schema: (data: any) => { isValid: boolean; errors: string[]; data?: T }
) {
  return async function validationMiddleware(
    request: NextRequest,
    handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validation = schema(body);

      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: validation.errors 
          },
          { status: 400 }
        );
      }

      return await handler(request, validation.data!);

    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
  };
}

// CORS middleware
export function createCORSMiddleware(options: {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
} = {}) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = true
  } = options;

  return function corsMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return Promise.resolve(new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': Array.isArray(origin) ? origin.join(', ') : origin,
          'Access-Control-Allow-Methods': methods.join(', '),
          'Access-Control-Allow-Headers': allowedHeaders.join(', '),
          'Access-Control-Allow-Credentials': credentials.toString()
        }
      }));
    }

    // Handle actual request
    return handler(request).then(response => {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', Array.isArray(origin) ? origin.join(', ') : origin);
      newHeaders.set('Access-Control-Allow-Credentials', credentials.toString());

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    });
  };
}

// Error handling middleware
export function createErrorHandlerMiddleware() {
  return async function errorHandlerMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      return await handler(request);
    } catch (error: any) {
      console.error('API Error:', error);

      // Handle specific error types
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: Object.values(error.errors).map((err: any) => err.message)
          },
          { status: 400 }
        );
      }

      if (error.name === 'CastError') {
        return NextResponse.json(
          { error: 'Invalid ID format' },
          { status: 400 }
        );
      }

      if (error.code === 11000) {
        const field = Object.keys(error.keyValue || {})[0];
        return NextResponse.json(
          { error: `Duplicate value for field: ${field}` },
          { status: 409 }
        );
      }

      // Generic error
      return NextResponse.json(
        { 
          error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message 
        },
        { status: 500 }
      );
    }
  };
}

// Middleware composer utility
export function composeMiddleware<T extends NextRequest>(
  ...middlewares: Array<(req: T, handler: (req: T) => Promise<NextResponse>) => Promise<NextResponse>>
) {
  return (finalHandler: (req: T) => Promise<NextResponse>) => {
    if (middlewares.length === 0) {
      return finalHandler;
    }
    
    return (req: T) => {
      let index = 0;
      
      function dispatch(i: number): Promise<NextResponse> {
        if (i <= index) return Promise.reject(new Error('next() called multiple times'));
        index = i;
        
        if (i === middlewares.length) {
          return finalHandler(req);
        }
        
        const middleware = middlewares[i];
        return middleware(req, () => dispatch(i + 1));
      }
      
      return dispatch(0);
    };
  };
}

// Helper function to extract user from request
export function getUserFromRequest(request: AuthenticatedRequest) {
  return request.user;
}

// Helper function to check if user has permission
export function hasPermission(user: AuthenticatedRequest['user'], requiredRoles: string[]): boolean {
  return user ? requiredRoles.includes(user.role) : false;
}

// Helper function to get client IP
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real.trim();
  }
  
  return 'unknown';
}