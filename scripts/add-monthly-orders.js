const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Schema definitions (reusing from previous script)
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

async function createMonthlyOrders() {
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

    // Create orders for last 6 months
    const currentDate = new Date();
    
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const targetMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset + 1, 1);
      
      // Create 5-15 orders per month
      const ordersThisMonth = Math.floor(Math.random() * 11) + 5;
      
      for (let i = 0; i < ordersThisMonth; i++) {
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

        // Random date within the target month
        const randomDate = new Date(
          targetMonth.getTime() + Math.random() * (nextMonth.getTime() - targetMonth.getTime())
        );

        const order = {
          orderNumber: `ORD-${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}-${i + 1}`,
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
          createdAt: randomDate,
          updatedAt: randomDate
        };

        demoOrders.push(order);
      }
    }

    // Insert demo orders
    await Order.insertMany(demoOrders);
    console.log(`✅ Created ${demoOrders.length} monthly demo orders successfully!`);

    // Show monthly summary
    const monthlyStats = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          completedOrders: {
            $sum: {
              $cond: {
                if: { $in: ['$status', ['completed', 'delivered']] },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      }
    ]);

    console.log('\n📊 Monthly Order Summary:');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthlyStats.forEach(stat => {
      const monthName = monthNames[stat._id.month - 1];
      console.log(`   ${monthName} ${stat._id.year}: ${stat.totalOrders} orders, ${stat.completedOrders} completed, ₹${stat.totalRevenue.toLocaleString('en-IN')}`);
    });

    const totalOrders = await Order.countDocuments();
    console.log(`\n💰 Total Orders in Database: ${totalOrders}`);

  } catch (error) {
    console.error('❌ Error creating monthly orders:', error);
  }
}

async function main() {
  await connectToDatabase();
  await createMonthlyOrders();
  mongoose.connection.close();
  console.log('\n✅ Monthly orders creation completed!');
}

main().catch(console.error);