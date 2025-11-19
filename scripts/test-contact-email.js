/**
 * Test script for contact form email functionality
 * This script tests the email service integration
 */

require('dotenv').config({ path: '.env.local' });
const { emailService } = require('../lib/services/email');

async function testContactEmail() {
  console.log('🧪 Testing Contact Form Email Functionality...\n');

  try {
    // Test 1: Check email service connection
    console.log('1. Testing email service connection...');
    const isConnected = await emailService.testConnection();
    console.log(`   Connection status: ${isConnected ? '✅ Connected' : '❌ Failed'}\n`);

    if (!isConnected) {
      console.log('❌ Email service connection failed. Please check your SMTP configuration.');
      return;
    }

    // Test 2: Send test contact email
    console.log('2. Sending test contact email...');
    const testContactData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Contact Form Submission',
      message: 'This is a test message from the contact form to verify email functionality.'
    };

    await emailService.sendContactEmail(testContactData);
    console.log('   ✅ Contact email sent successfully!\n');

    console.log('🎉 All tests passed! Contact form email functionality is working correctly.');
    console.log('\nWhat happens when a user submits the contact form:');
    console.log('1. 📧 Admin receives an email notification');
    console.log('2. 📬 Customer receives a confirmation email');
    console.log('3. ✅ User sees success message on the website');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check your .env.local file has correct SMTP settings');
    console.log('2. Ensure EMAIL_FROM and ADMIN_EMAIL are valid email addresses');
    console.log('3. Verify SMTP credentials are correct');
    console.log('4. Check if your email provider requires app-specific passwords');
  }
}

// Run the test
testContactEmail();