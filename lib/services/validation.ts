import { ValidationUtils } from '../database/utils';

// User registration validation
export function validateUserRegistration(data: any): {
  isValid: boolean;
  errors: string[];
  data?: {
    name: string;
    email: string;
    password: string;
  };
} {
  const errors: string[] = [];

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required');
  } else if (data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (data.name.trim().length > 50) {
    errors.push('Name cannot exceed 50 characters');
  }

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (!ValidationUtils.isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  } else {
    const passwordCheck = ValidationUtils.isStrongPassword(data.password);
    if (!passwordCheck.isValid) {
      errors.push(...passwordCheck.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password
    } : undefined
  };
}

// OTP verification validation
export function validateOTPVerification(data: any): {
  isValid: boolean;
  errors: string[];
  data?: {
    email: string;
    otp: string;
  };
} {
  const errors: string[] = [];

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (!ValidationUtils.isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  // OTP validation
  if (!data.otp || typeof data.otp !== 'string') {
    errors.push('OTP is required');
  } else if (!/^\d{6}$/.test(data.otp)) {
    errors.push('OTP must be a 6-digit number');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      email: data.email.toLowerCase().trim(),
      otp: data.otp.trim()
    } : undefined
  };
}

// User login validation
export function validateUserLogin(data: any): {
  isValid: boolean;
  errors: string[];
  data?: {
    email: string;
    password: string;
  };
} {
  const errors: string[] = [];

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (!ValidationUtils.isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      email: data.email.toLowerCase().trim(),
      password: data.password
    } : undefined
  };
}

// Category validation
export function validateCategory(data: any): {
  isValid: boolean;
  errors: string[];
  data?: {
    name: string;
    description?: string;
    isActive?: boolean;
  };
} {
  const errors: string[] = [];

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Category name is required');
  } else if (data.name.trim().length < 2) {
    errors.push('Category name must be at least 2 characters long');
  } else if (data.name.trim().length > 50) {
    errors.push('Category name cannot exceed 50 characters');
  }

  // Description validation (optional)
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else if (data.description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }
  }

  // Active status validation (optional)
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      name: data.name.trim(),
      description: data.description ? data.description.trim() : undefined,
      isActive: data.isActive !== undefined ? data.isActive : true
    } : undefined
  };
}

// Category partial update validation (for updates where not all fields are required)
export function validateCategoryPartial(data: any): {
  isValid: boolean;
  errors: string[];
  data?: {
    name?: string;
    description?: string;
    isActive?: boolean;
  };
} {
  const errors: string[] = [];

  // Name validation (optional for partial updates)
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push('Category name must be a string');
    } else if (data.name.trim().length < 2) {
      errors.push('Category name must be at least 2 characters long');
    } else if (data.name.trim().length > 50) {
      errors.push('Category name cannot exceed 50 characters');
    }
  }

  // Description validation (optional)
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else if (data.description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }
  }

  // Active status validation (optional)
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  // Ensure at least one field is provided for update
  if (data.name === undefined && data.description === undefined && data.isActive === undefined) {
    errors.push('At least one field must be provided for update');
  }

  const validatedData: any = {};
  if (data.name !== undefined) validatedData.name = data.name.trim();
  if (data.description !== undefined) validatedData.description = data.description.trim();
  if (data.isActive !== undefined) validatedData.isActive = data.isActive;

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? validatedData : undefined
  };
}

// Product validation
export function validateProduct(data: any): {
  isValid: boolean;
  errors: string[];
  data?: {
    name: string;
    slug: string;
    categoryId: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    weight?: number;
    ingredients?: string[];
    nutritionInfo?: any;
    tags?: string[];
    isActive?: boolean;
    featured?: boolean;
  };
} {
  const errors: string[] = [];

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Product name is required');
  } else if (data.name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters long');
  } else if (data.name.trim().length > 100) {
    errors.push('Product name cannot exceed 100 characters');
  }

  // Slug validation
  if (!data.slug || typeof data.slug !== 'string') {
    errors.push('Product slug is required');
  } else if (data.slug.trim().length < 2) {
    errors.push('Product slug must be at least 2 characters long');
  } else if (data.slug.trim().length > 100) {
    errors.push('Product slug cannot exceed 100 characters');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Product slug must contain only lowercase letters, numbers, and hyphens');
  }

  // Category ID validation
  if (!data.categoryId || typeof data.categoryId !== 'string') {
    errors.push('Category ID is required');
  } else if (!ValidationUtils.isValidObjectId(data.categoryId)) {
    errors.push('Invalid category ID format');
  }

  // Description validation
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Product description is required');
  } else if (data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  } else if (data.description.trim().length > 2000) {
    errors.push('Description cannot exceed 2000 characters');
  }

  // Price validation
  if (data.price === undefined || data.price === null) {
    errors.push('Product price is required');
  } else if (typeof data.price !== 'number' || data.price < 0) {
    errors.push('Price must be a positive number');
  }

  // Compare at price validation (optional)
  if (data.compareAtPrice !== undefined) {
    if (typeof data.compareAtPrice !== 'number' || data.compareAtPrice < 0) {
      errors.push('Compare at price must be a positive number');
    } else if (data.compareAtPrice < data.price) {
      errors.push('Compare at price must be greater than or equal to the selling price');
    }
  }

  // Stock validation
  if (data.stock === undefined || data.stock === null) {
    errors.push('Stock quantity is required');
  } else if (typeof data.stock !== 'number' || data.stock < 0 || !Number.isInteger(data.stock)) {
    errors.push('Stock must be a non-negative integer');
  }

  // Weight validation (optional)
  if (data.weight !== undefined) {
    if (typeof data.weight !== 'number' || data.weight < 0) {
      errors.push('Weight must be a positive number');
    }
  }

  // Ingredients validation (optional)
  if (data.ingredients !== undefined) {
    if (!Array.isArray(data.ingredients)) {
      errors.push('Ingredients must be an array');
    } else if (data.ingredients.some((ingredient: any) => typeof ingredient !== 'string')) {
      errors.push('All ingredients must be strings');
    }
  }

  // Tags validation (optional)
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push('Tags must be an array');
    } else if (data.tags.some((tag: any) => typeof tag !== 'string')) {
      errors.push('All tags must be strings');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      name: data.name.trim(),
      slug: data.slug.trim(),
      categoryId: data.categoryId,
      description: data.description.trim(),
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      stock: data.stock,
      weight: data.weight,
      ingredients: data.ingredients,
      nutritionInfo: data.nutritionInfo,
      tags: data.tags,
      isActive: data.isActive !== undefined ? data.isActive : true,
      featured: data.featured !== undefined ? data.featured : false
    } : undefined
  };
}

// Cart item validation
export function validateCartItem(data: any): {
  isValid: boolean;
  errors: string[];
  data?: {
    productId: string;
    quantity: number;
  };
} {
  const errors: string[] = [];

  // Product ID validation
  if (!data.productId || typeof data.productId !== 'string') {
    errors.push('Product ID is required');
  } else if (!ValidationUtils.isValidObjectId(data.productId)) {
    errors.push('Invalid product ID format');
  }

  // Quantity validation
  if (data.quantity === undefined || data.quantity === null) {
    errors.push('Quantity is required');
  } else if (typeof data.quantity !== 'number' || data.quantity < 1 || data.quantity > 50 || !Number.isInteger(data.quantity)) {
    errors.push('Quantity must be an integer between 1 and 50');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      productId: data.productId,
      quantity: data.quantity
    } : undefined
  };
}

// Shipping address validation
export function validateShippingAddress(data: any): {
  isValid: boolean;
  errors: string[];
  data?: {
    fullName: string;
    email: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
  };
} {
  const errors: string[] = [];

  // Full name validation
  if (!data.fullName || typeof data.fullName !== 'string') {
    errors.push('Full name is required');
  } else if (data.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (!ValidationUtils.isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  // Address line 1 validation
  if (!data.addressLine1 || typeof data.addressLine1 !== 'string') {
    errors.push('Address line 1 is required');
  } else if (data.addressLine1.trim().length < 5) {
    errors.push('Address line 1 must be at least 5 characters long');
  }

  // City validation
  if (!data.city || typeof data.city !== 'string') {
    errors.push('City is required');
  } else if (data.city.trim().length < 2) {
    errors.push('City must be at least 2 characters long');
  }

  // State validation
  if (!data.state || typeof data.state !== 'string') {
    errors.push('State is required');
  } else if (data.state.trim().length < 2) {
    errors.push('State must be at least 2 characters long');
  }

  // Postal code validation
  if (!data.postalCode || typeof data.postalCode !== 'string') {
    errors.push('Postal code is required');
  } else if (!/^[0-9]{6}$/.test(data.postalCode.trim())) {
    errors.push('Postal code must be a 6-digit number');
  }

  // Country validation
  if (!data.country || typeof data.country !== 'string') {
    errors.push('Country is required');
  } else if (data.country.trim().length < 2) {
    errors.push('Country must be at least 2 characters long');
  }

  // Phone number validation
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') {
    errors.push('Phone number is required');
  } else if (!ValidationUtils.isValidPhoneNumber(data.phoneNumber)) {
    errors.push('Please provide a valid phone number');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      addressLine1: data.addressLine1.trim(),
      addressLine2: data.addressLine2 ? data.addressLine2.trim() : undefined,
      city: data.city.trim(),
      state: data.state.trim(),
      postalCode: data.postalCode.trim(),
      country: data.country.trim(),
      phoneNumber: data.phoneNumber.trim()
    } : undefined
  };
}

// Order status validation
export function validateOrderStatus(data: any): {
  isValid: boolean;
  errors: string[];
  data?: {
    status: string;
    notes?: string;
    trackingNumber?: string;
  };
} {
  const errors: string[] = [];
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'];

  // Status validation
  if (!data.status || typeof data.status !== 'string') {
    errors.push('Status is required');
  } else if (!validStatuses.includes(data.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Notes validation (optional)
  if (data.notes !== undefined) {
    if (typeof data.notes !== 'string') {
      errors.push('Notes must be a string');
    } else if (data.notes.length > 500) {
      errors.push('Notes cannot exceed 500 characters');
    }
  }

  // Tracking number validation (optional)
  if (data.trackingNumber !== undefined) {
    if (typeof data.trackingNumber !== 'string') {
      errors.push('Tracking number must be a string');
    } else if (data.trackingNumber.trim().length === 0) {
      errors.push('Tracking number cannot be empty');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      status: data.status,
      notes: data.notes ? data.notes.trim() : undefined,
      trackingNumber: data.trackingNumber ? data.trackingNumber.trim() : undefined
    } : undefined
  };
}

// Query parameters validation
export function validateQueryParams(params: any): {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
} {
  const page = Math.max(1, parseInt(params.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 10));
  const sort = params.sort || 'createdAt';
  const order = params.order === 'asc' ? 'asc' : 'desc';
  const search = params.search ? params.search.trim() : undefined;

  return {
    page,
    limit,
    sort,
    order,
    search
  };
}

// Contact form validation
export function validateContactForm(data: any): {
  isValid: boolean;
  errors: string[];
  data?: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
} {
  const errors: string[] = [];

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required');
  } else if (data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (data.name.trim().length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (!ValidationUtils.isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  // Subject validation
  if (!data.subject || typeof data.subject !== 'string') {
    errors.push('Subject is required');
  } else if (data.subject.trim().length < 3) {
    errors.push('Subject must be at least 3 characters long');
  } else if (data.subject.trim().length > 200) {
    errors.push('Subject cannot exceed 200 characters');
  }

  // Message validation
  if (!data.message || typeof data.message !== 'string') {
    errors.push('Message is required');
  } else if (data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  } else if (data.message.trim().length > 2000) {
    errors.push('Message cannot exceed 2000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      subject: data.subject.trim(),
      message: data.message.trim()
    } : undefined
  };
}