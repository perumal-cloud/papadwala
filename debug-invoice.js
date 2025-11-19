// Debug script to test invoice functionality
// Run with: node debug-invoice.js

const { connectDB } = require('./lib/database/connection.ts');
const Order = require('./lib/models/Order.ts').default;

async function debugInvoice() {
  console.log('=== INVOICE DEBUG SCRIPT ===');
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Find recent orders
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email');
      
    console.log(`📦 Found ${orders.length} recent orders:`);
    
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order: ${order.orderNumber}`);
      console.log(`   User: ${order.userId?.name} (${order.userId?._id})`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Items: ${order.items?.length || 0}`);
      console.log(`   Total: ₹${order.total}`);
      console.log('   ---');
    });
    
    if (orders.length > 0) {
      const firstOrder = orders[0];
      console.log('\n🔍 Testing first order details:');
      console.log('Order ID:', firstOrder._id);
      console.log('Order Number:', firstOrder.orderNumber);
      console.log('User ID:', firstOrder.userId?._id);
      console.log('Has shipping address:', !!firstOrder.shippingAddress);
      console.log('Items count:', firstOrder.items?.length || 0);
      
      if (firstOrder.items?.length > 0) {
        console.log('First item:', firstOrder.items[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

debugInvoice();