// Direct test of invoice service - simulating API route usage
async function testInvoiceServiceDirectly() {
  try {
    console.log('Testing invoice service directly...');
    
    // Import the compiled service
    const { invoiceServiceJsPDF } = await import('./lib/services/invoice-jspdf.js');
    
    const testInvoiceData = {
      orderNumber: 'ORD-API-001',
      orderDate: new Date(),
      customer: {
        name: 'API Test User',
        email: 'apitest@example.com',
        phone: '+91-9876543213'
      },
      shippingAddress: {
        fullName: 'API Test User',
        addressLine1: '321 API Lane',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600001',
        country: 'India',
        phoneNumber: '+91-9876543213'
      },
      items: [
        {
          name: 'API Test Papad',
          quantity: 3,
          price: 180,
          total: 540
        },
        {
          name: 'Service Test Papad',
          quantity: 2,
          price: 220,
          total: 440
        }
      ],
      subtotal: 980,
      shippingCost: 80,
      tax: 98,
      total: 1158,
      paymentMethod: 'Net Banking',
      status: 'Confirmed'
    };

    // This should try PDFKit first, then fallback to jsPDF if needed
    const pdfBuffer = await invoiceServiceJsPDF.generateInvoicePDF(testInvoiceData);
    
    console.log('Invoice generated successfully! Size:', pdfBuffer.length, 'bytes');
    
    // Save the result
    const fs = await import('fs');
    const path = await import('path');
    const outputPath = path.join(process.cwd(), 'test-invoice-service.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('Invoice saved to:', outputPath);
    console.log('✅ Invoice service test completed successfully!');
    
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ Invoice service test failed:', error);
    throw error;
  }
}

// Run the test
testInvoiceServiceDirectly().catch(console.error);