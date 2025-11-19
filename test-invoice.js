// Test script to verify invoice functionality
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_ORDER_ID = 'ORD-20241112-001'; // Replace with actual order number

async function testInvoiceDownload() {
  try {
    console.log('Testing invoice download endpoint...');
    
    // Note: In a real test, you would need a valid JWT token
    // For now, let's test without authentication to see the error handling
    
    const response = await fetch(`${BASE_URL}/api/orders/${TEST_ORDER_ID}/invoice`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // 'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
      }
    });
    
    const result = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', result.substring(0, 200) + '...');
    
    if (response.status === 401) {
      console.log('✅ Authentication is working correctly (401 expected without token)');
    } else if (response.status === 200) {
      console.log('✅ Invoice download working correctly');
    } else {
      console.log('❌ Unexpected response');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Run the test
testInvoiceDownload();