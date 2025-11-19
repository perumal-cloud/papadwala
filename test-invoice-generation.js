// Test invoice generation - simpler approach
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Test data
const testInvoiceData = {
  orderNumber: 'ORD-TEST-001',
  orderDate: new Date(),
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91-6369890217'
  },
  shippingAddress: {
    fullName: 'John Doe',
    addressLine1: '123 Test Street',
    addressLine2: 'Apt 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    phoneNumber: '+91-6369890217'
  },
  items: [
    {
      name: 'Masala Papad',
      quantity: 2,
      price: 150,
      total: 300
    },
    {
      name: 'Plain Papad',
      quantity: 3,
      price: 100,
      total: 300
    }
  ],
  subtotal: 600,
  shippingCost: 50,
  tax: 60,
  total: 710,
  paymentMethod: 'Credit Card',
  status: 'Paid'
};

function generateTestPDF() {
  return new Promise((resolve, reject) => {
    try {
      console.log('Creating PDF document...');
      
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        autoFirstPage: true,
        bufferPages: true,
      });

      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', (error) => {
        console.error('PDF generation error:', error);
        reject(error);
      });

      // Add simple content without font specifications
      doc.fontSize(20)
         .text('INVOICE TEST', 50, 50, { align: 'center' })
         .moveDown(2);

      doc.fontSize(12)
         .text('Papad Store', 50, doc.y)
         .text('123 Spice Street, Mumbai', 50, doc.y + 20)
         .text('Phone: +91-6369890217', 50, doc.y + 40);

      doc.fontSize(10)
         .text(`Invoice #: ${testInvoiceData.orderNumber}`, 400, 120)
         .text(`Date: ${new Date().toLocaleDateString()}`, 400, 135)
         .text(`Status: ${testInvoiceData.status}`, 400, 150);

      doc.fontSize(12)
         .text('Bill To:', 50, 200)
         .fontSize(10)
         .text(testInvoiceData.customer.name, 50, 220)
         .text(testInvoiceData.customer.email, 50, 235);

      doc.fontSize(10)
         .text('Item', 50, 280)
         .text('Description', 150, 280)
         .text('Qty', 350, 280)
         .text('Price', 400, 280)
         .text('Total', 480, 280);

      // Add line
      doc.lineWidth(1)
         .moveTo(50, 295)
         .lineTo(550, 295)
         .stroke();

      let currentY = 305;
      testInvoiceData.items.forEach((item, index) => {
        doc.text((index + 1).toString(), 50, currentY)
           .text(item.name, 150, currentY)
           .text(item.quantity.toString(), 350, currentY)
           .text(`₹${item.price.toFixed(2)}`, 400, currentY)
           .text(`₹${item.total.toFixed(2)}`, 480, currentY);
        currentY += 20;
      });

      // Add totals
      doc.fontSize(10)
         .text('Subtotal:', 400, currentY + 20)
         .text(`₹${testInvoiceData.subtotal.toFixed(2)}`, 480, currentY + 20)
         .text('Tax:', 400, currentY + 35)
         .text(`₹${testInvoiceData.tax.toFixed(2)}`, 480, currentY + 35)
         .text('Total:', 400, currentY + 50)
         .text(`₹${testInvoiceData.total.toFixed(2)}`, 480, currentY + 50);

      console.log('Finishing PDF...');
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

async function testInvoiceGeneration() {
  try {
    console.log('Testing invoice generation...');
    
    const pdfBuffer = await generateTestPDF();
    
    console.log('PDF generated successfully! Size:', pdfBuffer.length, 'bytes');
    
    // Save the PDF to test-invoice.pdf
    const outputPath = path.join(__dirname, 'test-invoice-output.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('PDF saved to:', outputPath);
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testInvoiceGeneration();