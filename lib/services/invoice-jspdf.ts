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
      const margin = 20;
      let currentY = margin;

      // Header - use simple positioning without align options
      doc.setFontSize(24);
      doc.setTextColor(40, 40, 40);
      const headerText = 'INVOICE';
      const headerWidth = doc.getTextWidth(headerText);
      doc.text(headerText, (pageWidth - headerWidth) / 2, currentY);
      currentY += 15;

      // Company Info
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(this.companyInfo.name, margin, currentY);
      currentY += 8;
      
      doc.setFontSize(10);
      doc.text(this.companyInfo.address, margin, currentY);
      currentY += 6;
      doc.text('Phone: ' + this.companyInfo.phone, margin, currentY);
      currentY += 6;
      doc.text('Email: ' + this.companyInfo.email, margin, currentY);
      currentY += 6;
      doc.text('Website: ' + this.companyInfo.website, margin, currentY);
      currentY += 6;
      doc.text('GST: ' + this.companyInfo.gst, margin, currentY);
      currentY += 15;

      // Invoice Details (right side)
      const rightColumnX = pageWidth - 80;
      let rightY = 40;
      
      doc.setFontSize(12);
      doc.text('Invoice Details:', rightColumnX, rightY);
      rightY += 8;
      
      doc.setFontSize(10);
      doc.text('Invoice #: ' + String(invoiceData.orderNumber), rightColumnX, rightY);
      rightY += 6;
      doc.text('Date: ' + new Date(invoiceData.orderDate).toLocaleDateString(), rightColumnX, rightY);
      rightY += 6;
      doc.text('Status: ' + String(invoiceData.status), rightColumnX, rightY);
      rightY += 6;
      doc.text('Payment: ' + String(invoiceData.paymentMethod), rightColumnX, rightY);

      // Customer Information
      currentY += 10;
      doc.setFontSize(12);
      doc.text('Bill To:', margin, currentY);
      doc.text('Ship To:', pageWidth / 2, currentY);
      currentY += 8;

      doc.setFontSize(10);
      // Billing info (left side)
      doc.text(String(invoiceData.customer.name), margin, currentY);
      doc.text(String(invoiceData.customer.email), margin, currentY + 6);
      if (invoiceData.customer.phone) {
        doc.text(String(invoiceData.customer.phone), margin, currentY + 12);
      }

      // Shipping info (right side)
      const shipToX = pageWidth / 2;
      doc.text(String(invoiceData.shippingAddress.fullName), shipToX, currentY);
      doc.text(String(invoiceData.shippingAddress.addressLine1), shipToX, currentY + 6);
      if (invoiceData.shippingAddress.addressLine2) {
        doc.text(String(invoiceData.shippingAddress.addressLine2), shipToX, currentY + 12);
        currentY += 6;
      }
      doc.text(String(invoiceData.shippingAddress.city) + ', ' + String(invoiceData.shippingAddress.state), shipToX, currentY + 12);
      doc.text(String(invoiceData.shippingAddress.postalCode) + ', ' + String(invoiceData.shippingAddress.country), shipToX, currentY + 18);
      doc.text('Phone: ' + String(invoiceData.shippingAddress.phoneNumber), shipToX, currentY + 24);

      currentY += 35;

      // Items Table
      this.addItemsTable(doc, invoiceData, currentY, margin, pageWidth);
      
      // Calculate new Y position after table
      const tableHeight = (invoiceData.items.length + 2) * 8;
      currentY += tableHeight + 20;

      // Totals
      this.addTotals(doc, invoiceData, currentY, pageWidth, margin);

      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 30;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      const footerText1 = 'Thank you for your business!';
      const footerWidth1 = doc.getTextWidth(footerText1);
      doc.text(footerText1, (pageWidth - footerWidth1) / 2, footerY);
      
      const footerText2 = 'For any queries, please contact us at info@papadshop.com or +91-6369890217';
      const footerWidth2 = doc.getTextWidth(footerText2);
      doc.text(footerText2, (pageWidth - footerWidth2) / 2, footerY + 6);
      
      const footerText3 = 'This is a computer-generated invoice and does not require a signature.';
      const footerWidth3 = doc.getTextWidth(footerText3);
      doc.text(footerText3, (pageWidth - footerWidth3) / 2, footerY + 12);

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
      item: 15,
      description: 80,
      qty: 20,
      price: 25,
      total: 30
    };

    let currentY = startY;

    // Table header
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Item', margin, currentY);
    doc.text('Description', margin + colWidths.item, currentY);
    doc.text('Qty', margin + colWidths.item + colWidths.description, currentY);
    doc.text('Price', margin + colWidths.item + colWidths.description + colWidths.qty, currentY);
    doc.text('Total', margin + colWidths.item + colWidths.description + colWidths.qty + colWidths.price, currentY);

    currentY += 6;

    // Header line
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 4;

    // Table items
    doc.setFontSize(9);
    invoiceData.items.forEach((item, index) => {
      doc.text(String(index + 1), margin, currentY);
      doc.text(String(item.name), margin + colWidths.item, currentY);
      doc.text(String(item.quantity), margin + colWidths.item + colWidths.description, currentY);
      doc.text('₹' + String(Number(item.price).toFixed(2)), margin + colWidths.item + colWidths.description + colWidths.qty, currentY);
      doc.text('₹' + String(Number(item.total).toFixed(2)), margin + colWidths.item + colWidths.description + colWidths.qty + colWidths.price, currentY);
      currentY += 8;
    });

    // Bottom line
    doc.line(margin, currentY, pageWidth - margin, currentY);
  }

  private addTotals(doc: jsPDF, invoiceData: InvoiceData, startY: number, pageWidth: number, margin: number) {
    const rightX = pageWidth - margin - 60;
    const valueX = pageWidth - margin - 20;
    let currentY = startY;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Subtotal
    doc.text('Subtotal:', rightX, currentY);
    const subtotalText = '₹' + String(Number(invoiceData.subtotal).toFixed(2));
    const subtotalWidth = doc.getTextWidth(subtotalText);
    doc.text(subtotalText, valueX - subtotalWidth, currentY);
    currentY += 8;

    // Shipping
    if (invoiceData.shippingCost > 0) {
      doc.text('Shipping:', rightX, currentY);
      const shippingText = '₹' + String(Number(invoiceData.shippingCost).toFixed(2));
      const shippingWidth = doc.getTextWidth(shippingText);
      doc.text(shippingText, valueX - shippingWidth, currentY);
      currentY += 8;
    }

    // Tax
    if (invoiceData.tax > 0) {
      doc.text('Tax:', rightX, currentY);
      const taxText = '₹' + String(Number(invoiceData.tax).toFixed(2));
      const taxWidth = doc.getTextWidth(taxText);
      doc.text(taxText, valueX - taxWidth, currentY);
      currentY += 8;
    }

    // Total line
    doc.line(rightX, currentY, valueX, currentY);
    currentY += 6;

    // Total
    doc.setFontSize(12);
    doc.text('Total:', rightX, currentY);
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