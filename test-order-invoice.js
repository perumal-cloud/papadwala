/**
 * Test script to verify order creation with automatic invoice generation
 * 
 * This script tests the automatic invoice email functionality when an order is placed.
 * Make sure you have:
 * 1. A verified user account
 * 2. Products in the database
 * 3. Email service configured with valid SMTP settings
 */

const API_BASE_URL = 'http://localhost:3000';

// Sample test data - replace with your test values
const TEST_DATA = {
  userEmail: 'test@example.com', // Replace with a test user email
  userPassword: 'password123',   // Replace with test user password
  productId: '60f1b2b2c9e5c12a3c4d5e6f', // Replace with actual product ID
};

async function testOrderWithInvoice() {
  try {
    console.log('🧪 Starting order invoice test...\n');

    // Step 1: Login to get access token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_DATA.userEmail,
        password: TEST_DATA.userPassword,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const accessToken = loginData.accessToken;
    console.log('✅ Login successful');

    // Step 2: Create test order
    console.log('2. Creating test order...');
    const orderData = {
      items: [
        {
          productId: TEST_DATA.productId,
          quantity: 2,
          priceSnapshot: 25.00
        }
      ],
      shippingAddress: {
        fullName: 'Test Customer',
        email: TEST_DATA.userEmail,
        addressLine1: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
        country: 'India',
        phoneNumber: '+91-6369890217'
      },
      paymentMethod: 'cod',
      orderNotes: 'Test order for invoice generation'
    };

    const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(`Order creation failed: ${orderResponse.status} - ${errorData.error || orderResponse.statusText}`);
    }

    const orderResult = await orderResponse.json();
    console.log('✅ Order created successfully!');
    console.log('📦 Order Number:', orderResult.order.orderNumber);
    console.log('💰 Total Amount: ₹', orderResult.order.totalAmount);
    
    console.log('\n🎯 Test completed! Check the following:');
    console.log('1. Order confirmation email should be sent to:', TEST_DATA.userEmail);
    console.log('2. Invoice email with PDF attachment should be sent to:', TEST_DATA.userEmail);
    console.log('3. Check your email inbox and spam folder');
    console.log('4. Check server console for email sending logs');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure Next.js server is running (npm run dev)');
    console.log('2. Verify test user exists and is verified');
    console.log('3. Ensure product ID exists in database');
    console.log('4. Check email service configuration in .env file');
    console.log('5. Verify database connection is working');
  }
}

// Helper function to check if server is running
async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🌶️  PAPAD STORE - Order Invoice Test\n');
  console.log('This test will create an order and verify that:');
  console.log('• Order confirmation email is sent');
  console.log('• Invoice PDF is generated and emailed\n');

  const serverRunning = await checkServerHealth();
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start with: npm run dev');
    return;
  }

  await testOrderWithInvoice();
}

// Run the test
main();