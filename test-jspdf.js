// Test jsPDF invoice generation
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
    phone: '+91-6369890217'
  },
  shippingAddress: {
    fullName: 'Jane Smith',
    addressLine1: '456 Test Avenue',
    addressLine2: 'Suite 2C',
    city: 'Delhi',
    state: 'Delhi',
    postalCode: '110001',
    country: 'India',
    phoneNumber: '+91-6369890217'
  },
  items: [
    {
      name: 'Spiced Papad',
      quantity: 4,
      price: 120,
      total: 480
    },
    {
      name: 'Roasted Papad',
      quantity: 2,
      price: 140,
      total: 280
    }
  ],
  subtotal: 760,
  shippingCost: 75,
  tax: 76,
  total: 911,
  paymentMethod: 'UPI',
  status: 'Processing'
};

function generateJsPDFTest() {
  try {
    console.log('Creating jsPDF document...');
    
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set up margins and page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = margin;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text('INVOICE', pageWidth / 2, currentY, { align: 'center' });
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

    // Invoice Details (right side)
    const rightColumnX = pageWidth - 80;
    let rightY = 40;
    
    doc.setFontSize(12);
    doc.text('Invoice Details:', rightColumnX, rightY);
    rightY += 8;
    
    doc.setFontSize(10);
    doc.text(`Invoice #: ${testInvoiceData.orderNumber}`, rightColumnX, rightY);
    rightY += 6;
    doc.text(`Date: ${new Date(testInvoiceData.orderDate).toLocaleDateString()}`, rightColumnX, rightY);
    rightY += 6;
    doc.text(`Status: ${testInvoiceData.status}`, rightColumnX, rightY);

    // Customer Information
    currentY += 10;
    doc.setFontSize(12);
    doc.text('Bill To:', margin, currentY);
    doc.text('Ship To:', pageWidth / 2, currentY);
    currentY += 8;

    doc.setFontSize(10);
    // Billing info (left side)
    doc.text(testInvoiceData.customer.name, margin, currentY);
    doc.text(testInvoiceData.customer.email, margin, currentY + 6);

    // Shipping info (right side)
    const shipToX = pageWidth / 2;
    doc.text(testInvoiceData.shippingAddress.fullName, shipToX, currentY);
    doc.text(testInvoiceData.shippingAddress.addressLine1, shipToX, currentY + 6);
    doc.text(`${testInvoiceData.shippingAddress.city}, ${testInvoiceData.shippingAddress.state}`, shipToX, currentY + 12);

    currentY += 35;

    // Items Table Header
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Item', margin, currentY);
    doc.text('Description', margin + 15, currentY);
    doc.text('Qty', margin + 95, currentY);
    doc.text('Price', margin + 115, currentY);
    doc.text('Total', margin + 145, currentY);

    currentY += 6;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 4;

    // Table items
    doc.setFontSize(9);
    testInvoiceData.items.forEach((item, index) => {
      doc.text((index + 1).toString(), margin, currentY);
      doc.text(item.name, margin + 15, currentY);
      doc.text(item.quantity.toString(), margin + 95, currentY);
      doc.text(`₹${item.price.toFixed(2)}`, margin + 115, currentY);
      doc.text(`₹${item.total.toFixed(2)}`, margin + 145, currentY);
      currentY += 8;
    });

    // Bottom line
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    // Totals
    const rightX = pageWidth - margin - 60;
    const valueX = pageWidth - margin - 20;

    doc.setFontSize(10);
    doc.text('Subtotal:', rightX, currentY);
    doc.text(`₹${testInvoiceData.subtotal.toFixed(2)}`, valueX, currentY, { align: 'right' });
    currentY += 8;

    doc.text('Shipping:', rightX, currentY);
    doc.text(`₹${testInvoiceData.shippingCost.toFixed(2)}`, valueX, currentY, { align: 'right' });
    currentY += 8;

    doc.text('Tax:', rightX, currentY);
    doc.text(`₹${testInvoiceData.tax.toFixed(2)}`, valueX, currentY, { align: 'right' });
    currentY += 8;

    // Total line
    doc.line(rightX, currentY, valueX, currentY);
    currentY += 6;

    // Total
    doc.setFontSize(12);
    doc.text('Total:', rightX, currentY);
    doc.text(`₹${testInvoiceData.total.toFixed(2)}`, valueX, currentY, { align: 'right' });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;

  } catch (error) {
    console.error('Error generating PDF with jsPDF:', error);
    throw error;
  }
}

async function testJsPDFGeneration() {
  try {
    console.log('Testing jsPDF invoice generation...');
    
    const pdfBuffer = generateJsPDFTest();
    
    console.log('jsPDF generated successfully! Size:', pdfBuffer.length, 'bytes');
    
    // Save the PDF
    const outputPath = path.join(__dirname, 'test-invoice-jspdf.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('jsPDF saved to:', outputPath);
    console.log('jsPDF test completed successfully!');
    
  } catch (error) {
    console.error('jsPDF test failed:', error);
    process.exit(1);
  }
}

testJsPDFGeneration();