import mongoose, { Document, Schema } from 'mongoose';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/constants/orderStatus';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string; // Snapshot of product name
  price: number; // Price at the time of order
  quantity: number;
  image: string; // Main product image snapshot
}

export interface IShippingAddress {
  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface IStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  notes?: string;
  updatedBy?: mongoose.Types.ObjectId; // Admin who updated the status
  location?: string; // Location information for shipping statuses
}

export interface ITrackingInfo {
  trackingNumber?: string;
  carrier?: string; // e.g., 'India Post', 'BlueDart', 'Delhivery'
  trackingUrl?: string; // External tracking URL
  currentLocation?: string;
  expectedDelivery?: Date;
  deliveryAttempts?: {
    attemptDate: Date;
    status: 'successful' | 'failed' | 'rescheduled';
    notes?: string;
    location?: string;
  }[];
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: IShippingAddress;
  status: OrderStatus;
  paymentMethod: 'cod'; // Only Cash on Delivery for now
  paymentStatus: 'pending' | 'paid' | 'failed';
  invoiceUrl?: string;
  notes?: string;
  statusHistory: IStatusHistory[];
  trackingInfo?: ITrackingInfo;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  // Additional tracking fields
  shippedAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  adminNotes?: string; // Private notes for admin
  customerNotes?: string; // Public notes for customer
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  name: {
    type: String,
    required: [true, 'Product name snapshot is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  }
}, { _id: false });

const shippingAddressSchema = new Schema<IShippingAddress>({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'India'
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[+]?[\d\s\-()]{10,15}$/, 'Please provide a valid phone number']
  }
}, { _id: false });

const statusHistorySchema = new Schema<IStatusHistory>({
  status: {
    type: String,
    required: true,
    enum: Object.values(ORDER_STATUSES)
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: String,
    trim: true
  }
}, { _id: false });

const deliveryAttemptSchema = new Schema({
  attemptDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['successful', 'failed', 'rescheduled'],
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  }
}, { _id: false });

const trackingInfoSchema = new Schema<ITrackingInfo>({
  trackingNumber: {
    type: String,
    trim: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  carrier: {
    type: String,
    trim: true
  },
  trackingUrl: {
    type: String,
    trim: true
  },
  currentLocation: {
    type: String,
    trim: true
  },
  expectedDelivery: {
    type: Date
  },
  deliveryAttempts: [deliveryAttemptSchema]
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items: IOrderItem[]) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: [true, 'Tax amount is required'],
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  shippingCost: {
    type: Number,
    required: [true, 'Shipping cost is required'],
    min: [0, 'Shipping cost cannot be negative'],
    default: 0
  },
  total: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total cannot be negative']
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: [true, 'Shipping address is required']
  },
  status: {
    type: String,
    enum: {
      values: Object.values(ORDER_STATUSES),
      message: 'Invalid order status'
    },
    default: ORDER_STATUSES.PENDING
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['cod'],
      message: 'Only Cash on Delivery is supported'
    },
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed'],
      message: 'Invalid payment status'
    },
    default: 'pending'
  },
  invoiceUrl: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  statusHistory: {
    type: [statusHistorySchema],
    default: function() {
      return [{
        status: ORDER_STATUSES.PENDING,
        timestamp: new Date(),
        notes: 'Order placed'
      }];
    }
  },
  trackingInfo: trackingInfoSchema,
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  // Additional tracking timestamps
  shippedAt: {
    type: Date
  },
  outForDeliveryAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  customerNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Customer notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for performance
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'trackingInfo.trackingNumber': 1 }, { sparse: true });
orderSchema.index({ shippedAt: -1 });
orderSchema.index({ deliveredAt: -1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    this.orderNumber = `ORD-${timestamp}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to update status history and timestamps
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    // Add to status history
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      notes: `Status updated to ${this.status}`
    });

    // Update specific timestamp fields
    const now = new Date();
    switch (this.status) {
      case ORDER_STATUSES.SHIPPED:
        this.shippedAt = now;
        break;
      case ORDER_STATUSES.OUT_FOR_DELIVERY:
        this.outForDeliveryAt = now;
        break;
      case ORDER_STATUSES.DELIVERED:
        this.deliveredAt = now;
        this.actualDelivery = now;
        this.paymentStatus = 'paid'; // Assuming COD is paid on delivery
        break;
      case ORDER_STATUSES.CANCELLED:
        this.cancelledAt = now;
        break;
    }
  }
  next();
});

// Virtual for current status info
orderSchema.virtual('currentStatus').get(function() {
  return this.statusHistory[this.statusHistory.length - 1];
});

// Virtual for order value (subtotal)
orderSchema.virtual('orderValue').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Method to update status with detailed tracking info
orderSchema.methods.updateStatus = async function(
  newStatus: OrderStatus, 
  options: {
    notes?: string;
    updatedBy?: mongoose.Types.ObjectId;
    location?: string;
    trackingInfo?: Partial<ITrackingInfo>;
    adminNotes?: string;
  } = {}
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    this.status = newStatus;
    
    // Add to status history
    this.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      notes: options.notes || `Status updated to ${newStatus}`,
      updatedBy: options.updatedBy,
      location: options.location
    });
    
    // Update tracking info if provided
    if (options.trackingInfo) {
      if (!this.trackingInfo) {
        this.trackingInfo = {
          deliveryAttempts: []
        };
      }
      Object.assign(this.trackingInfo, options.trackingInfo);
      this.markModified('trackingInfo');
    }
    
    // Update admin notes if provided
    if (options.adminNotes) {
      this.adminNotes = options.adminNotes;
    }
    
    const result = await this.save({ session });
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Method to add delivery attempt
orderSchema.methods.addDeliveryAttempt = async function(
  status: 'successful' | 'failed' | 'rescheduled',
  notes?: string,
  location?: string
) {
  if (!this.trackingInfo) {
    this.trackingInfo = {
      deliveryAttempts: []
    };
  }
  if (!this.trackingInfo.deliveryAttempts) {
    this.trackingInfo.deliveryAttempts = [];
  }
  
  this.trackingInfo.deliveryAttempts.push({
    attemptDate: new Date(),
    status,
    notes,
    location
  });
  
  this.markModified('trackingInfo');
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const result = await this.save({ session });
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Method to get tracking timeline for customer
orderSchema.methods.getTrackingTimeline = function() {
  return this.statusHistory.map((entry: IStatusHistory) => ({
    status: entry.status,
    timestamp: entry.timestamp,
    notes: entry.notes,
    location: entry.location
  })).sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime());
};

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return [ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.PROCESSING].includes(this.status);
};

// Method to estimate delivery date based on current status
orderSchema.methods.getEstimatedDelivery = function() {
  if (this.estimatedDelivery) {
    return this.estimatedDelivery;
  }
  
  const now = new Date();
  const orderDate = this.createdAt || now;
  
  switch (this.status) {
    case ORDER_STATUSES.PENDING:
    case ORDER_STATUSES.CONFIRMED:
      return new Date(orderDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    case ORDER_STATUSES.PROCESSING:
      return new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days
    case ORDER_STATUSES.SHIPPED:
      return new Date(orderDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
    case ORDER_STATUSES.OUT_FOR_DELIVERY:
      return new Date(now.getTime() + (1 * 24 * 60 * 60 * 1000)); // 1 day
    case ORDER_STATUSES.DELIVERED:
      return this.deliveredAt || this.actualDelivery;
    default:
      return null;
  }
};

// Prevent re-compilation in development
const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;