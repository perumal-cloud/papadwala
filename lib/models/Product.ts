import mongoose, { Document, Schema } from 'mongoose';

// Variant weight option interface
export interface IWeightOption {
  weight: string; // e.g., "100g", "200g", "1kg"
  price: number;
  stock: number;
  sku?: string; // Auto-generated or manual SKU
  isActive?: boolean;
}

// Size variant interface
export interface ISizeVariant {
  size: string; // e.g., "2.5 inch", "3.5 inch", "4.5 inch"
  weights: IWeightOption[];
  isActive?: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  images: string[];
  isActive: boolean;
  featured: boolean;
  
  // Variant-based structure
  variants: ISizeVariant[];
  
  // Optional fields (kept for compatibility, but not used with variants)
  categoryId?: mongoose.Types.ObjectId; // Deprecated - keeping for migration
  
  // Product information
  ingredients?: string[];
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sodium?: number;
  };
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual methods
  getTotalStock(): number;
  getMinPrice(): number;
  getMaxPrice(): number;
}

const weightOptionSchema = new Schema<IWeightOption>({
  weight: {
    type: String,
    required: [true, 'Weight is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    trim: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const sizeVariantSchema = new Schema<ISizeVariant>({
  size: {
    type: String,
    required: [true, 'Size is required'],
    trim: true
  },
  weights: {
    type: [weightOptionSchema],
    validate: {
      validator: function(weights: IWeightOption[]) {
        return weights && weights.length > 0;
      },
      message: 'At least one weight option is required for each size'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters long'],
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Product slug is required'],
    lowercase: true,
    trim: true,
    match: [
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ]
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  images: [{
    type: String,
    required: [true, 'At least one product image is required'],
    validate: {
      validator: function(value: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(value);
      },
      message: 'Invalid image URL format'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  
  // Variant structure (size + weight combinations)
  variants: {
    type: [sizeVariantSchema],
    validate: {
      validator: function(variants: ISizeVariant[]) {
        return variants && variants.length > 0;
      },
      message: 'At least one size variant is required'
    }
  },
  
  // Deprecated fields (kept for backward compatibility during migration)
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false // No longer required
  },
  
  ingredients: [{
    type: String,
    trim: true
  }],
  nutritionInfo: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbs: { type: Number, min: 0 },
    fat: { type: Number, min: 0 },
    fiber: { type: Number, min: 0 },
    sodium: { type: Number, min: 0 }
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for performance
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ categoryId: 1 }); // Keep for migration compatibility
productSchema.index({ isActive: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search
productSchema.index({ isActive: 1, featured: 1 });
productSchema.index({ 'variants.weights.sku': 1 }, { sparse: true }); // For SKU lookups

// Pre-save middleware to generate slug from name
productSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
  
  // Auto-generate SKUs for variants if not provided
  if (this.variants && this.variants.length > 0) {
    this.variants.forEach((variant, sizeIndex) => {
      variant.weights.forEach((weight, weightIndex) => {
        if (!weight.sku) {
          // Generate SKU: PRODUCTSLUG-SIZE-WEIGHT
          const sizeSlug = variant.size.toLowerCase().replace(/[^a-z0-9]/g, '');
          const weightSlug = weight.weight.toLowerCase().replace(/[^a-z0-9]/g, '');
          weight.sku = `${this.slug}-${sizeSlug}-${weightSlug}`.toUpperCase();
        }
      });
    });
  }
  
  next();
});

// Method to get total stock across all variants
productSchema.methods.getTotalStock = function(): number {
  if (!this.variants || this.variants.length === 0) return 0;
  
  return this.variants.reduce((total, variant) => {
    return total + variant.weights.reduce((sum, weight) => {
      return weight.isActive !== false ? sum + weight.stock : sum;
    }, 0);
  }, 0);
};

// Method to get minimum price across all active variants
productSchema.methods.getMinPrice = function(): number {
  if (!this.variants || this.variants.length === 0) return 0;
  
  const activePrices: number[] = [];
  this.variants.forEach(variant => {
    if (variant.isActive !== false) {
      variant.weights.forEach(weight => {
        if (weight.isActive !== false) {
          activePrices.push(weight.price);
        }
      });
    }
  });
  
  return activePrices.length > 0 ? Math.min(...activePrices) : 0;
};

// Method to get maximum price across all active variants
productSchema.methods.getMaxPrice = function(): number {
  if (!this.variants || this.variants.length === 0) return 0;
  
  const activePrices: number[] = [];
  this.variants.forEach(variant => {
    if (variant.isActive !== false) {
      variant.weights.forEach(weight => {
        if (weight.isActive !== false) {
          activePrices.push(weight.price);
        }
      });
    }
  });
  
  return activePrices.length > 0 ? Math.max(...activePrices) : 0;
};

// Virtual for checking if any variant has stock
productSchema.virtual('inStock').get(function() {
  return this.getTotalStock() > 0;
});

// Virtual for price range display
productSchema.virtual('priceRange').get(function() {
  const minPrice = this.getMinPrice();
  const maxPrice = this.getMaxPrice();
  
  if (minPrice === maxPrice) {
    return `₹${minPrice}`;
  }
  return `₹${minPrice} - ₹${maxPrice}`;
});

// Prevent re-compilation in development
const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;