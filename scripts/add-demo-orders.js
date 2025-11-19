const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Since we can't import ES modules directly, we'll define the schemas here
const { Schema } = mongoose;

const orderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    required: true
  }
}, { _id: false });

const shippingAddressSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'India'
  }
}, { _id: false });

const orderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'cod', 'wallet'],
    required: true
  },
  shippingAddress: shippingAddressSchema
}, {
  timestamps: true
});

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [String]
}, {
  timestamps: true
});

// Create models
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createDemoOrders() {
  try {
    // Get some users and products for demo orders
    const users = await User.find({ role: 'customer' }).limit(5);
    const products = await Product.find().limit(10);

    if (users.length === 0) {
      console.log('❌ No customers found. Please create some users first.');
      return;
    }

    if (products.length === 0) {
      console.log('❌ No products found. Please create some products first.');
      return;
    }

    const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed'];
    const demoOrders = [];

    // Create 20 demo orders
    for (let i = 0; i < 20; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const orderItems = [];
      let total = 0;

      // Add random products to order
      for (let j = 0; j < numItems; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        const price = randomProduct.price;
        
        orderItems.push({
          productId: randomProduct._id,
          name: randomProduct.name,
          price: price,
          quantity: quantity,
          image: randomProduct.images[0] || 'https://via.placeholder.com/300'
        });

        total += price * quantity;
      }

      // Add shipping and tax
      const shipping = 50;
      const tax = total * 0.18; // 18% tax
      total += shipping + tax;

      const order = {
        orderNumber: `ORD-${Date.now()}-${i}`,
        userId: randomUser._id,
        items: orderItems,
        total: Math.round(total),
        subtotal: Math.round(total - shipping - tax),
        tax: Math.round(tax),
        shipping: shipping,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        paymentStatus: Math.random() > 0.3 ? 'paid' : 'pending',
        paymentMethod: Math.random() > 0.5 ? 'card' : 'cod',
        shippingAddress: {
          fullName: randomUser.name,
          email: randomUser.email,
          phone: '+91' + Math.floor(Math.random() * 9000000000 + 1000000000),
          address: `${Math.floor(Math.random() * 999) + 1} Demo Street`,
          city: 'Demo City',
          state: 'Demo State',
          zipCode: '123456',
          country: 'India'
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      };

      demoOrders.push(order);
    }

    // Insert demo orders
    await Order.insertMany(demoOrders);
    console.log(`✅ Created ${demoOrders.length} demo orders successfully!`);

    // Show summary
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    console.log('\n📊 Order Status Summary:');
    statusCounts.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} orders, ₹${stat.totalAmount.toLocaleString('en-IN')}`);
    });

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $match: { status: { $in: ['completed', 'delivered'] } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    console.log(`\n💰 Total Orders: ${totalOrders}`);
    console.log(`💰 Total Revenue: ₹${(totalRevenue[0]?.total || 0).toLocaleString('en-IN')}`);

  } catch (error) {
    console.error('❌ Error creating demo orders:', error);
  }
}

async function main() {
  await connectToDatabase();
  await createDemoOrders();
  mongoose.connection.close();
  console.log('\n✅ Demo orders creation completed!');
}

main().catch(console.error);