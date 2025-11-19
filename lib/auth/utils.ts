import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Password hashing utilities
const PasswordUtils = {
  // Hash password with bcrypt
  async hash(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    return await bcrypt.hash(password, saltRounds);
  },

  // Compare password with hash
  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  },

  // Generate secure random password
  generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
};

// JWT token utilities
const TokenUtils = {
  // Generate access token (short-lived)
  generateAccessToken(payload: { userId: string; email: string; role: string }): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  },

  // Generate refresh token (long-lived)
  generateRefreshToken(payload: { userId: string }): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  },

  // Verify access token
  verifyAccessToken(token: string): { userId: string; email: string; role: string } {
    const secret = process.env.JWT_ACCESS_SECRET;
    
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    try {
      return jwt.verify(token, secret) as { userId: string; email: string; role: string };
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  },

  // Verify refresh token
  verifyRefreshToken(token: string): { userId: string } {
    const secret = process.env.JWT_REFRESH_SECRET;
    
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    try {
      return jwt.verify(token, secret) as { userId: string };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  },

  // Generate token pair
  generateTokenPair(payload: { userId: string; email: string; role: string }) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken({ userId: payload.userId })
    };
  }
};

// OTP utilities
const OTPUtils = {
  // Generate numeric OTP
  generate(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    
    return otp;
  },

  // Hash OTP for secure storage
  async hash(otp: string): Promise<string> {
    return await bcrypt.hash(otp, 10);
  },

  // Verify OTP against hash
  async verify(otp: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(otp, hash);
  },

  // Generate OTP expiry date
  generateExpiryDate(minutes: number = 10): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
};

// Session utilities
const SessionUtils = {
  // Generate session ID
  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  },

  // Generate secure random string
  generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  },

  // Hash session data
  hashSessionData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
};

// Rate limiting utilities
const RateLimitUtils = {
  // Generate rate limit key
  generateKey(identifier: string, action: string): string {
    return `ratelimit:${action}:${identifier}`;
  },

  // Calculate time window
  calculateWindow(windowMs: number): number {
    return Math.floor(Date.now() / windowMs);
  },

  // Check if rate limit exceeded
  isRateLimited(attempts: number, maxAttempts: number): boolean {
    return attempts >= maxAttempts;
  },

  // Calculate retry after time
  calculateRetryAfter(windowMs: number): number {
    const currentWindow = this.calculateWindow(windowMs);
    const nextWindow = (currentWindow + 1) * windowMs;
    return Math.ceil((nextWindow - Date.now()) / 1000);
  }
};

// Security utilities
const SecurityUtils = {
  // Sanitize input to prevent XSS
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  // Generate CSRF token
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  },

  // Validate CSRF token
  validateCSRFToken(token: string, expectedToken: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
  },

  // Generate secure filename
  generateSecureFilename(originalFilename: string): string {
    const extension = originalFilename.split('.').pop();
    const secureName = crypto.randomBytes(16).toString('hex');
    return `${secureName}.${extension}`;
  },

  // Validate file type
  validateFileType(filename: string, allowedTypes: string[]): boolean {
    const extension = filename.toLowerCase().split('.').pop();
    return extension ? allowedTypes.includes(extension) : false;
  },

  // Check password strength
  checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (password.length >= 12) score += 1;
    else feedback.push('Use 12 or more characters for better security');

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    // Common patterns check
    if (!/(.)\1{2,}/.test(password)) score += 1;
    else feedback.push('Avoid repeating characters');

    return {
      score,
      feedback,
      isStrong: score >= 5
    };
  }
};

// Email validation utilities
const EmailUtils = {
  // Validate email format
  isValidFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Normalize email
  normalize(email: string): string {
    return email.toLowerCase().trim();
  },

  // Check if email is disposable (basic check)
  isDisposable(email: string): boolean {
    const disposableDomains = [
      '10minutemail.com',
      'guerrillamail.com',
      'tempmail.org',
      'mailinator.com',
      'throwaway.email'
    ];
    
    const domain = email.split('@')[1];
    return disposableDomains.includes(domain);
  },

  // Extract domain from email
  extractDomain(email: string): string {
    return email.split('@')[1] || '';
  }
};

// Export all utilities
export {
  PasswordUtils,
  TokenUtils,
  OTPUtils,
  SessionUtils,
  RateLimitUtils,
  SecurityUtils,
  EmailUtils
};