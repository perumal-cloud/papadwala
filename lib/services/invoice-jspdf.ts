import { jsPDF } from 'jspdf';
import { emailService } from './email';

export interface InvoiceData {
  orderNumber: string;
  orderDate: Date;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
}

class InvoiceServiceJsPDF {
  private readonly companyInfo = {
    name: 'Papad Wala',
    address: '37/A North street annupanadi, Madurai, Tamil Nadu 625009, India',
    phone: '+91-6369890217',
    email: 'info@papadshop.com',
    website: 'www.papadstore.com',
    gst: 'GST123456789'
  };

  async generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
    try {
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set up margins and page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = margin;

      // Define colors
      const primaryColor = { r: 220, g: 38, b: 38 }; // Red for Papad theme
      const secondaryColor = { r: 55, g: 65, b: 81 }; // Dark gray
      const lightGray = { r: 243, g: 244, b: 246 };

      // Header background
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Company name in header
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(this.companyInfo.name.toUpperCase(), margin, currentY + 8);
      
      // INVOICE text
      doc.setFontSize(20);
      doc.setFont('helvetica', 'normal');
      const invoiceText = 'INVOICE';
      const invoiceWidth = doc.getTextWidth(invoiceText);
      doc.text(invoiceText, pageWidth - margin - invoiceWidth, currentY + 8);

      currentY = 50;

      // Two column layout for company and invoice details
      // Left column - Company Info
      doc.setFontSize(9);
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.setFont('helvetica', 'normal');
      
      const companyLines = [
        this.companyInfo.address,
        'Phone: ' + this.companyInfo.phone,
        'Email: ' + this.companyInfo.email,
        'Website: ' + this.companyInfo.website,
        'GST: ' + this.companyInfo.gst
      ];
      
      companyLines.forEach((line, index) => {
        doc.text(line, margin, currentY + (index * 5));
      });

      // Right column - Invoice Details Box
      const boxX = pageWidth - margin - 70;
      const boxY = currentY - 5;
      doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
      doc.roundedRect(boxX, boxY, 70, 35, 2, 2, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.text('INVOICE NUMBER', boxX + 5, boxY + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(String(invoiceData.orderNumber), boxX + 5, boxY + 11);
      
      doc.setFont('helvetica', 'bold');
      doc.text('DATE', boxX + 5, boxY + 18);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(invoiceData.orderDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }), boxX + 5, boxY + 23);
      
      doc.setFont('helvetica', 'bold');
      doc.text('STATUS', boxX + 5, boxY + 30);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text(String(invoiceData.status).toUpperCase(), boxX + 5, boxY + 35);

      currentY = 95;

      // Customer Information Section with boxes
      doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
      const boxWidth = (pageWidth - (3 * margin)) / 2;
      
      // Bill To Box
      doc.roundedRect(margin, currentY, boxWidth, 35, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text('BILL TO', margin + 5, currentY + 7);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.text(String(invoiceData.customer.name), margin + 5, currentY + 14);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(String(invoiceData.customer.email), margin + 5, currentY + 19);
      if (invoiceData.customer.phone) {
        doc.text(String(invoiceData.customer.phone), margin + 5, currentY + 24);
      }

      // Ship To Box
      const shipToX = pageWidth - margin - boxWidth;
      doc.roundedRect(shipToX, currentY, boxWidth, 35, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text('SHIP TO', shipToX + 5, currentY + 7);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.text(String(invoiceData.shippingAddress.fullName), shipToX + 5, currentY + 14);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      let shipY = currentY + 19;
      doc.text(String(invoiceData.shippingAddress.addressLine1), shipToX + 5, shipY);
      shipY += 4;
      if (invoiceData.shippingAddress.addressLine2) {
        doc.text(String(invoiceData.shippingAddress.addressLine2), shipToX + 5, shipY);
        shipY += 4;
      }
      doc.text(String(invoiceData.shippingAddress.city) + ', ' + String(invoiceData.shippingAddress.state), shipToX + 5, shipY);

      currentY += 45;

      // Items Table
      this.addItemsTable(doc, invoiceData, currentY, margin, pageWidth);
      
      // Calculate new Y position after table
      const tableHeight = (invoiceData.items.length + 2) * 10;
      currentY += tableHeight + 15;

      // Totals
      this.addTotals(doc, invoiceData, currentY, pageWidth, margin);

      // Payment method
      currentY += 45;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.text('PAYMENT METHOD: ', margin, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(String(invoiceData.paymentMethod).toUpperCase(), margin + 35, currentY);

      // Footer
      const footerY = pageHeight - 25;
      
      // Footer line
      doc.setDrawColor(lightGray.r, lightGray.g, lightGray.b);
      doc.setLineWidth(0.5);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      const thankYouText = 'Thank you for your business!';
      const thankYouWidth = doc.getTextWidth(thankYouText);
      doc.text(thankYouText, (pageWidth - thankYouWidth) / 2, footerY);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const footerText2 = 'For queries: info@papadshop.com | +91-6369890217';
      const footerWidth2 = doc.getTextWidth(footerText2);
      doc.text(footerText2, (pageWidth - footerWidth2) / 2, footerY + 5);
      
      doc.setFontSize(7);
      const footerText3 = 'This is a computer-generated invoice and does not require a signature.';
      const footerWidth3 = doc.getTextWidth(footerText3);
      doc.text(footerText3, (pageWidth - footerWidth3) / 2, footerY + 10);

      // Convert to buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      return pdfBuffer;

    } catch (error) {
      console.error('Error generating PDF with jsPDF:', error);
      throw new Error(`Failed to generate PDF: ${error}`);
    }
  }

  private addItemsTable(doc: jsPDF, invoiceData: InvoiceData, startY: number, margin: number, pageWidth: number) {
    const colWidths = {
      item: 12,
      description: 85,
      qty: 18,
      price: 28,
      total: 30
    };

    const primaryColor = { r: 220, g: 38, b: 38 };
    const secondaryColor = { r: 55, g: 65, b: 81 };
    const lightGray = { r: 243, g: 244, b: 246 };

    let currentY = startY;

    // Table header background
    doc.setFillColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
    doc.rect(margin, currentY - 5, pageWidth - (2 * margin), 9, 'F');

    // Table header text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    
    doc.text('#', margin + 2, currentY);
    doc.text('DESCRIPTION', margin + colWidths.item + 2, currentY);
    doc.text('QTY', margin + colWidths.item + colWidths.description + 2, currentY);
    doc.text('PRICE', margin + colWidths.item + colWidths.description + colWidths.qty + 2, currentY);
    doc.text('TOTAL', pageWidth - margin - 28, currentY);

    currentY += 6;

    // Table items with alternating row colors
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
    
    invoiceData.items.forEach((item, index) => {
      // Alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
        doc.rect(margin, currentY - 4, pageWidth - (2 * margin), 9, 'F');
      }

      doc.text(String(index + 1), margin + 2, currentY);
      doc.text(String(item.name), margin + colWidths.item + 2, currentY);
      doc.text(String(item.quantity), margin + colWidths.item + colWidths.description + 2, currentY);
      doc.text('₹' + String(Number(item.price).toFixed(2)), margin + colWidths.item + colWidths.description + colWidths.qty + 2, currentY);
      
      // Right align total
      const totalText = '₹' + String(Number(item.total).toFixed(2));
      const totalWidth = doc.getTextWidth(totalText);
      doc.text(totalText, pageWidth - margin - totalWidth - 2, currentY);
      
      currentY += 10;
    });

    // Bottom border
    doc.setDrawColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY - 3, pageWidth - margin, currentY - 3);
  }

  private addTotals(doc: jsPDF, invoiceData: InvoiceData, startY: number, pageWidth: number, margin: number) {
    const primaryColor = { r: 220, g: 38, b: 38 };
    const secondaryColor = { r: 55, g: 65, b: 81 };
    const lightGray = { r: 243, g: 244, b: 246 };
    
    const boxWidth = 75;
    const boxX = pageWidth - margin - boxWidth;
    const labelX = boxX + 5;
    const valueX = pageWidth - margin - 5;
    let currentY = startY;

    // Background box for totals
    doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
    const boxHeight = (invoiceData.shippingCost > 0 ? 7 : 0) + (invoiceData.tax > 0 ? 7 : 0) + 25;
    doc.roundedRect(boxX, currentY - 5, boxWidth, boxHeight, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);

    // Subtotal
    doc.text('Subtotal:', labelX, currentY);
    const subtotalText = '₹' + String(Number(invoiceData.subtotal).toFixed(2));
    const subtotalWidth = doc.getTextWidth(subtotalText);
    doc.text(subtotalText, valueX - subtotalWidth, currentY);
    currentY += 7;

    // Shipping
    if (invoiceData.shippingCost > 0) {
      doc.text('Shipping:', labelX, currentY);
      const shippingText = '₹' + String(Number(invoiceData.shippingCost).toFixed(2));
      const shippingWidth = doc.getTextWidth(shippingText);
      doc.text(shippingText, valueX - shippingWidth, currentY);
      currentY += 7;
    }

    // Tax
    if (invoiceData.tax > 0) {
      doc.text('Tax (GST):', labelX, currentY);
      const taxText = '₹' + String(Number(invoiceData.tax).toFixed(2));
      const taxWidth = doc.getTextWidth(taxText);
      doc.text(taxText, valueX - taxWidth, currentY);
      currentY += 7;
    }

    // Divider line
    doc.setDrawColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
    doc.setLineWidth(0.8);
    doc.line(labelX, currentY, valueX - 2, currentY);
    currentY += 6;

    // Total with highlight
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(boxX, currentY - 5, boxWidth, 10, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL:', labelX, currentY);
    const totalText = '₹' + String(Number(invoiceData.total).toFixed(2));
    const totalWidth = doc.getTextWidth(totalText);
    doc.text(totalText, valueX - totalWidth, currentY);
  }

  async sendInvoiceEmail(invoiceData: InvoiceData, pdfBuffer: Buffer): Promise<void> {
    await emailService.sendInvoiceEmail(
      invoiceData.customer.email,
      {
        orderNumber: invoiceData.orderNumber,
        customerName: invoiceData.customer.name
      },
      pdfBuffer
    );
  }

  async generateAndSendInvoice(invoiceData: InvoiceData): Promise<Buffer> {
    try {
      const pdfBuffer = await this.generateInvoicePDF(invoiceData);
      await this.sendInvoiceEmail(invoiceData, pdfBuffer);
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating and sending invoice:', error);
      throw new Error('Failed to generate and send invoice');
    }
  }
}

export const invoiceServiceJsPDF = new InvoiceServiceJsPDF();