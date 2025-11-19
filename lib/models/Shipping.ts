import mongoose, { Document, Schema } from 'mongoose';

export interface IShippingMethod {
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  isActive: boolean;
  minOrderValue?: number;
  maxWeight?: number;
  regions: string[];
}

export interface IShippingZone extends Document {
  name: string;
  description?: string;
  regions: string[];
  methods: IShippingMethod[];
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const shippingMethodSchema = new Schema<IShippingMethod>({
  name: {
    type: String,
    required: [true, 'Shipping method name is required'],
    trim: true,
    maxlength: [100, 'Method name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Method description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Shipping price is required'],
    min: [0, 'Price cannot be negative']
  },
  estimatedDays: {
    type: String,
    required: [true, 'Estimated delivery time is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minOrderValue: {
    type: Number,
    min: [0, 'Minimum order value cannot be negative'],
    default: 0
  },
  maxWeight: {
    type: Number,
    min: [0, 'Maximum weight cannot be negative']
  },
  regions: [{
    type: String,
    trim: true
  }]
}, {
  _id: false // Don't create separate _id for subdocuments
});

const shippingZoneSchema = new Schema<IShippingZone>({
  name: {
    type: String,
    required: [true, 'Zone name is required'],
    trim: true,
    maxlength: [100, 'Zone name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  regions: [{
    type: String,
    required: [true, 'At least one region is required'],
    trim: true
  }],
  methods: [shippingMethodSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0,
    min: [0, 'Priority cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes
shippingZoneSchema.index({ name: 1 }, { unique: true });
shippingZoneSchema.index({ isActive: 1 });
shippingZoneSchema.index({ priority: -1 });

// Methods
shippingZoneSchema.methods.getActiveShippingMethods = function() {
  return this.methods.filter((method: IShippingMethod) => method.isActive);
};

shippingZoneSchema.methods.getMethodByName = function(methodName: string) {
  return this.methods.find((method: IShippingMethod) => 
    method.name.toLowerCase() === methodName.toLowerCase()
  );
};

// Static methods
shippingZoneSchema.statics.findByRegion = function(region: string) {
  return this.find({
    isActive: true,
    regions: { $regex: new RegExp(region, 'i') }
  }).sort({ priority: -1 });
};

shippingZoneSchema.statics.getShippingOptions = function(region: string, orderValue: number = 0, weight: number = 0) {
  return this.aggregate([
    {
      $match: {
        isActive: true,
        regions: { $regex: new RegExp(region, 'i') }
      }
    },
    {
      $unwind: '$methods'
    },
    {
      $match: {
        'methods.isActive': true,
        'methods.minOrderValue': { $lte: orderValue },
        $or: [
          { 'methods.maxWeight': { $exists: false } },
          { 'methods.maxWeight': null },
          { 'methods.maxWeight': { $gte: weight } }
        ]
      }
    },
    {
      $project: {
        zoneName: '$name',
        methodName: '$methods.name',
        description: '$methods.description',
        price: '$methods.price',
        estimatedDays: '$methods.estimatedDays',
        priority: 1
      }
    },
    {
      $sort: { priority: -1, price: 1 }
    }
  ]);
};

// Pre-save middleware
shippingZoneSchema.pre('save', function(next) {
  // Ensure at least one active method exists
  const activeMethods = this.methods.filter((method: IShippingMethod) => method.isActive);
  if (this.isActive && activeMethods.length === 0) {
    const error = new Error('Active shipping zone must have at least one active shipping method');
    return next(error);
  }
  next();
});

// Create and export the model
const ShippingZone = mongoose.models.ShippingZone || mongoose.model<IShippingZone>('ShippingZone', shippingZoneSchema);

export default ShippingZone;