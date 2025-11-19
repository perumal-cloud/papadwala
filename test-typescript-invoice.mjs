// Test the TypeScript invoice service
import { invoiceServiceJsPDF } from './lib/services/invoice-jspdf.js';
import fs from 'fs';
import path from 'path';

// Test data
const testInvoiceData = {
  orderNumber: 'ORD-TS-001',
  orderDate: new Date(),
  customer: {
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '+91-9876543212'
  },
  shippingAddress: {
    fullName: 'Test Customer',
    addressLine1: '789 Service Street',
    addressLine2: null,
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India',
    phoneNumber: '+91-9876543212'
  },
  items: [
    {
      name: 'Premium Papad',
      quantity: 4,
      price: 200,
      total: 800
    }
  ],
  subtotal: 800,
  shippingCost: 60,
  tax: 80,
  total: 940,
  paymentMethod: 'Cash on Delivery',
  status: 'Processing'
};

async function testTypeScriptInvoiceService() {
  try {
    console.log('Testing TypeScript invoice service...');
    
    const pdfBuffer = await invoiceServiceJsPDF.generateInvoicePDF(testInvoiceData);
    
    console.log('TypeScript PDF generated successfully! Size:', pdfBuffer.length, 'bytes');
    
    const outputPath = path.join(process.cwd(), 'test-typescript-invoice.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('TypeScript PDF saved to:', outputPath);
    console.log('TypeScript test completed successfully!');
    
  } catch (error) {
    console.error('TypeScript test failed:', error);
    process.exit(1);
  }
}

testTypeScriptInvoiceService();