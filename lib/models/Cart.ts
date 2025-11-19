import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  priceSnapshot: number; // Price at the time of adding to cart
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [50, 'Quantity cannot exceed 50 items']
  },
  priceSnapshot: {
    type: Number,
    required: [true, 'Price snapshot is required'],
    min: [0, 'Price cannot be negative']
  }
}, { _id: false });

const cartSchema = new Schema<ICart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

// Indexes for performance
cartSchema.index({ userId: 1 }, { unique: true });
cartSchema.index({ 'items.productId': 1 });
cartSchema.index({ updatedAt: -1 });

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total amount
cartSchema.virtual('totalAmount').get(function() {
  return this.items.reduce((total, item) => total + (item.quantity * item.priceSnapshot), 0);
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId: mongoose.Types.ObjectId, quantity: number, price: number) {
  const existingItemIndex = this.items.findIndex(
    (item: ICartItem) => item.productId.toString() === productId.toString()
  );

  if (existingItemIndex >= 0) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].priceSnapshot = price; // Update with current price
  } else {
    // Add new item
    this.items.push({
      productId,
      quantity,
      priceSnapshot: price
    });
  }
  
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId: mongoose.Types.ObjectId, quantity: number) {
  const itemIndex = this.items.findIndex(
    (item: ICartItem) => item.productId.toString() === productId.toString()
  );

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
    }
  }
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId: mongoose.Types.ObjectId) {
  this.items = this.items.filter(
    (item: ICartItem) => item.productId.toString() !== productId.toString()
  );
  
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Prevent re-compilation in development
const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', cartSchema);

export default Cart;