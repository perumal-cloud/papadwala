import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  categoryId: mongoose.Types.ObjectId;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: string[];
  isActive: boolean;
  featured: boolean;
  weight?: number; // in grams
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
}

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
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Compare at price cannot be negative'],
    validate: {
      validator: function(this: IProduct, value: number) {
        return !value || value >= this.price;
      },
      message: 'Compare at price must be greater than or equal to the selling price'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
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
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
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
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search
productSchema.index({ categoryId: 1, isActive: 1, featured: 1 });
productSchema.index({ isActive: 1, stock: 1 });

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
  next();
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Virtual for availability
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Prevent re-compilation in development
const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;