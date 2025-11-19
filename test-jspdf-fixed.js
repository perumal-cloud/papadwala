// Test updated jsPDF implementation
const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

// Test data
const testInvoiceData = {
  orderNumber: 'ORD-TEST-002',
  orderDate: new Date(),
  customer: {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91-9876543211'
  },
  shippingAddress: {
    fullName: 'Jane Smith',
    addressLine1: '456 Test Avenue',
    addressLine2: 'Suite 5C',
    city: 'Delhi',
    state: 'Delhi',
    postalCode: '110001',
    country: 'India',
    phoneNumber: '+91-9876543211'
  },
  items: [
    {
      name: 'Spicy Papad',
      quantity: 5,
      price: 120,
      total: 600
    },
    {
      name: 'Jeera Papad',
      quantity: 2,
      price: 140,
      total: 280
    }
  ],
  subtotal: 880,
  shippingCost: 75,
  tax: 88,
  total: 1043,
  paymentMethod: 'UPI',
  status: 'Paid'
};

function generateTestJsPDF() {
  try {
    console.log('Creating jsPDF document...');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = margin;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    const headerText = 'INVOICE TEST';
    const headerWidth = doc.getTextWidth(headerText);
    doc.text(headerText, (pageWidth - headerWidth) / 2, currentY);
    currentY += 15;

    // Company Info
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Papad Store', margin, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.text('37/A North street annupanadi, Madurai, Tamil Nadu 625009, India', margin, currentY);
    currentY += 6;
    doc.text('Phone: +91-6369890217', margin, currentY);
    currentY += 6;
    doc.text('Email: info@papadshop.com', margin, currentY);
    currentY += 15;

    // Invoice Details
    const rightColumnX = pageWidth - 80;
    let rightY = 40;
    
    doc.setFontSize(12);
    doc.text('Invoice Details:', rightColumnX, rightY);
    rightY += 8;
    
    doc.setFontSize(10);
    doc.text('Invoice #: ' + String(testInvoiceData.orderNumber), rightColumnX, rightY);
    rightY += 6;
    doc.text('Date: ' + new Date().toLocaleDateString(), rightColumnX, rightY);
    rightY += 6;
    doc.text('Status: ' + String(testInvoiceData.status), rightColumnX, rightY);

    // Customer Info
    currentY += 10;
    doc.setFontSize(12);
    doc.text('Bill To:', margin, currentY);
    doc.text('Ship To:', pageWidth / 2, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.text(String(testInvoiceData.customer.name), margin, currentY);
    doc.text(String(testInvoiceData.customer.email), margin, currentY + 6);

    const shipToX = pageWidth / 2;
    doc.text(String(testInvoiceData.shippingAddress.fullName), shipToX, currentY);
    doc.text(String(testInvoiceData.shippingAddress.addressLine1), shipToX, currentY + 6);

    currentY += 25;

    // Items Table
    doc.setFontSize(10);
    doc.text('Item', margin, currentY);
    doc.text('Description', margin + 15, currentY);
    doc.text('Qty', margin + 95, currentY);
    doc.text('Price', margin + 115, currentY);
    doc.text('Total', margin + 140, currentY);

    currentY += 6;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 4;

    doc.setFontSize(9);
    testInvoiceData.items.forEach((item, index) => {
      doc.text(String(index + 1), margin, currentY);
      doc.text(String(item.name), margin + 15, currentY);
      doc.text(String(item.quantity), margin + 95, currentY);
      doc.text('₹' + String(Number(item.price).toFixed(2)), margin + 115, currentY);
      doc.text('₹' + String(Number(item.total).toFixed(2)), margin + 140, currentY);
      currentY += 8;
    });

    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    // Totals
    const rightX = pageWidth - margin - 60;
    const valueX = pageWidth - margin - 20;

    doc.setFontSize(10);
    doc.text('Subtotal:', rightX, currentY);
    const subtotalText = '₹' + String(Number(testInvoiceData.subtotal).toFixed(2));
    const subtotalWidth = doc.getTextWidth(subtotalText);
    doc.text(subtotalText, valueX - subtotalWidth, currentY);
    currentY += 8;

    doc.text('Tax:', rightX, currentY);
    const taxText = '₹' + String(Number(testInvoiceData.tax).toFixed(2));
    const taxWidth = doc.getTextWidth(taxText);
    doc.text(taxText, valueX - taxWidth, currentY);
    currentY += 8;

    doc.setFontSize(12);
    doc.text('Total:', rightX, currentY);
    const totalText = '₹' + String(Number(testInvoiceData.total).toFixed(2));
    const totalWidth = doc.getTextWidth(totalText);
    doc.text(totalText, valueX - totalWidth, currentY);

    // Save as buffer and file
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    console.log('jsPDF generated successfully! Size:', pdfBuffer.length, 'bytes');
    
    const outputPath = path.join(__dirname, 'test-jspdf-fixed.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('jsPDF saved to:', outputPath);
    console.log('jsPDF test completed successfully!');
    
    return pdfBuffer;
    
  } catch (error) {
    console.error('jsPDF test failed:', error);
    throw error;
  }
}

generateTestJsPDF();