import nodemailer from 'nodemailer';

// Email service configuration
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Send OTP verification email
  async sendOTPEmail(email: string, otp: string, name?: string): Promise<void> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Verify Your Email - Papad Store',
      html: this.getOTPEmailTemplate(otp, name || 'User'),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Welcome to Papad Store!',
      html: this.getWelcomeEmailTemplate(name),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email as it's not critical
    }
  }

  // Send order confirmation email
  async sendOrderConfirmationEmail(
    email: string,
    orderDetails: {
      orderNumber: string;
      customerName: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      shippingAddress: any;
    }
  ): Promise<void> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Order Confirmation - ${orderDetails.orderNumber}`,
      html: this.getOrderConfirmationTemplate(orderDetails),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw new Error('Failed to send order confirmation email');
    }
  }

  // Send invoice email with PDF attachment
  async sendInvoiceEmail(
    email: string,
    orderDetails: {
      orderNumber: string;
      customerName: string;
    },
    invoicePdfBuffer: Buffer
  ): Promise<void> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Invoice - ${orderDetails.orderNumber}`,
      html: this.getInvoiceEmailTemplate(orderDetails),
      attachments: [
        {
          filename: `invoice-${orderDetails.orderNumber}.pdf`,
          content: invoicePdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw new Error('Failed to send invoice email');
    }
  }

  // Send order status update email
  async sendOrderStatusEmail(
    email: string,
    orderDetails: {
      orderNumber: string;
      customerName: string;
      status: string;
      trackingNumber?: string;
    }
  ): Promise<void> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Order Update - ${orderDetails.orderNumber}`,
      html: this.getOrderStatusEmailTemplate(orderDetails),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending order status email:', error);
      // Don't throw error for status updates as they're not critical
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, resetToken: string, name: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Reset Your Password - Papad Store',
      html: this.getPasswordResetEmailTemplate(name, resetUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Send contact form email
  async sendContactEmail(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const adminMailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM,
      subject: `Contact Form: ${contactData.subject}`,
      html: this.getContactEmailTemplate(contactData),
      replyTo: contactData.email,
    };

    const customerMailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: contactData.email,
      subject: 'Thank you for contacting Papad Store',
      html: this.getContactConfirmationEmailTemplate(contactData),
    };

    try {
      // Send email to admin
      await this.transporter.sendMail(adminMailOptions);
      
      // Send confirmation email to customer
      await this.transporter.sendMail(customerMailOptions);
    } catch (error) {
      console.error('Error sending contact email:', error);
      throw new Error('Failed to send contact email');
    }
  }

  // Send newsletter subscription confirmation email
  async sendNewsletterConfirmationEmail(email: string): Promise<void> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Welcome to Papad Store Newsletter!',
      html: this.getNewsletterConfirmationTemplate(email),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending newsletter confirmation email:', error);
      throw new Error('Failed to send newsletter confirmation email');
    }
  }

  // Email templates
  private getOTPEmailTemplate(otp: string, name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 30px; border: 1px solid #ddd; }
            .otp-code { font-size: 32px; font-weight: bold; color: #007bff; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
            .warning { color: #dc3545; font-size: 14px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌶️ Papad Store</h1>
              <h2>Email Verification</h2>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Thank you for registering with Papad Store! To complete your registration, please use the following One-Time Password (OTP):</p>
              
              <div class="otp-code">${otp}</div>
              
              <p>This OTP is valid for 10 minutes. If you didn't request this verification, please ignore this email.</p>
              
              <p class="warning">⚠️ Never share this OTP with anyone. Our team will never ask for your OTP.</p>
              
              <p>Best regards,<br>The Papad Store Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 Papad Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Papad Store</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌶️ Welcome to Papad Store!</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Welcome to Papad Store! Your account has been successfully verified and you're now ready to explore our delicious collection of authentic papads.</p>
              
              <p>🌟 What's next?</p>
              <ul>
                <li>Browse our wide variety of papads</li>
                <li>Add your favorites to cart</li>
                <li>Enjoy fast delivery to your doorstep</li>
                <li>Pay securely with Cash on Delivery</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="button">Start Shopping Now</a>
              </div>
              
              <p>If you have any questions or need assistance, feel free to contact our support team.</p>
              
              <p>Happy shopping!<br>The Papad Store Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Papad Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getOrderConfirmationTemplate(orderDetails: any): string {
    const itemsHtml = orderDetails.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #f8f9fa; padding: 12px; text-align: left; font-weight: bold; }
            .total { font-weight: bold; font-size: 18px; color: #28a745; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Confirmed!</h1>
              <h2>Order #${orderDetails.orderNumber}</h2>
            </div>
            <div class="content">
              <p>Hello ${orderDetails.customerName},</p>
              <p>Thank you for your order! We've received your order and it's being processed.</p>
              
              <h3>Order Details:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold;">Order Total:</td>
                    <td style="padding: 15px; text-align: right;" class="total">₹${orderDetails.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Shipping Address:</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                <p><strong>${orderDetails.shippingAddress.fullName}</strong><br>
                ${orderDetails.shippingAddress.addressLine1}<br>
                ${orderDetails.shippingAddress.addressLine2 ? orderDetails.shippingAddress.addressLine2 + '<br>' : ''}
                ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.postalCode}<br>
                ${orderDetails.shippingAddress.country}<br>
                Phone: ${orderDetails.shippingAddress.phoneNumber}</p>
              </div>
              
              <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
              
              <p>You'll receive another email with tracking information once your order ships.</p>
              
              <p>Thank you for choosing Papad Store!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Papad Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getInvoiceEmailTemplate(orderDetails: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📄 Invoice</h1>
              <h2>Order #${orderDetails.orderNumber}</h2>
            </div>
            <div class="content">
              <p>Hello ${orderDetails.customerName},</p>
              <p>Please find attached the invoice for your recent order.</p>
              
              <p>If you have any questions about this invoice, please contact our support team.</p>
              
              <p>Thank you for your business!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Papad Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getOrderStatusEmailTemplate(orderDetails: any): string {
    const statusMessages: { [key: string]: string } = {
      confirmed: '✅ Your order has been confirmed and is being prepared.',
      processing: '📦 Your order is being processed and packed.',
      shipped: '🚚 Your order has been shipped and is on its way!',
      'out-for-delivery': '🏃‍♂️ Your order is out for delivery and will arrive soon.',
      delivered: '🎉 Your order has been delivered successfully!',
      cancelled: '❌ Your order has been cancelled.',
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Status Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
            .status-message { background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; font-size: 18px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Order Status Update</h1>
              <h2>Order #${orderDetails.orderNumber}</h2>
            </div>
            <div class="content">
              <p>Hello ${orderDetails.customerName},</p>
              
              <div class="status-message">
                ${statusMessages[orderDetails.status] || 'Your order status has been updated.'}
              </div>
              
              ${orderDetails.trackingNumber ? `<p><strong>Tracking Number:</strong> ${orderDetails.trackingNumber}</p>` : ''}
              
              <p>You can track your order status anytime by visiting your account dashboard.</p>
              
              <p>Thank you for choosing Papad Store!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Papad Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>We received a request to reset your password for your Papad Store account.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Your Password</a>
              </div>
              
              <div class="warning">
                <p><strong>⚠️ Security Notice:</strong></p>
                <ul>
                  <li>This link is valid for 1 hour only</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:<br>
              <small>${resetUrl}</small></p>
              
              <p>If you continue to have problems, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Papad Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getContactEmailTemplate(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Form Submission</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
            .info-box { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .message-box { background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 New Contact Form Submission</h1>
            </div>
            <div class="content">
              <p><strong>You have received a new message from your website contact form.</strong></p>
              
              <div class="info-box">
                <h3>Contact Information:</h3>
                <p><strong>Name:</strong> ${contactData.name}</p>
                <p><strong>Email:</strong> ${contactData.email}</p>
                <p><strong>Subject:</strong> ${contactData.subject}</p>
              </div>
              
              <div class="message-box">
                <h3>Message:</h3>
                <p>${contactData.message.replace(/\n/g, '<br>')}</p>
              </div>
              
              <p><em>You can reply directly to this email to respond to the customer.</em></p>
            </div>
            <div class="footer">
              <p>This email was sent from the Papad Store contact form.</p>
              <p>&copy; 2024 Papad Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getContactConfirmationEmailTemplate(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Thank you for contacting us</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
            .message-summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Thank You for Contacting Us!</h1>
            </div>
            <div class="content">
              <p>Hello ${contactData.name},</p>
              <p>Thank you for reaching out to Papad Store! We have received your message and our team will get back to you within 24 hours.</p>
              
              <div class="message-summary">
                <h3>Your Message Summary:</h3>
                <p><strong>Subject:</strong> ${contactData.subject}</p>
                <p><strong>Message:</strong> ${contactData.message.substring(0, 200)}${contactData.message.length > 200 ? '...' : ''}</p>
              </div>
              
              <p>In the meantime, feel free to browse our delicious collection of papads:</p>
              <ul>
                <li>🌶️ Spicy Varieties</li>
                <li>🥜 Traditional Flavors</li>
                <li>🌿 Healthy Options</li>
                <li>🎁 Gift Packages</li>
              </ul>
              
              <p>If you have an urgent inquiry, you can also reach us at:</p>
              <ul>
                <li>📞 Phone: +91 63698 90217</li>
                <li>📧 Email: info@papadshop.com</li>
              </ul>
              
              <p>Best regards,<br>The Papad Store Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Papad Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Newsletter confirmation email template
  private getNewsletterConfirmationTemplate(email: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Our Newsletter</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #14b8a6; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
            .benefits { background-color: #f0fdfa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #14b8a6; }
            .cta-button { display: inline-block; padding: 12px 30px; background-color: #14b8a6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .social-links { text-align: center; margin: 20px 0; }
            .social-links a { display: inline-block; margin: 0 10px; color: #14b8a6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Papad Store Newsletter!</h1>
            </div>
            <div class="content">
              <p>Hello!</p>
              <p>Thank you for subscribing to the Papad Store newsletter! We're excited to have you join our community of papad lovers.</p>
              
              <div class="benefits">
                <h3>📬 What You'll Receive:</h3>
                <ul>
                  <li>✨ Exclusive offers and special discounts</li>
                  <li>🆕 First look at new product launches</li>
                  <li>👨‍🍳 Traditional papad recipes and cooking tips</li>
                  <li>🎁 Special birthday and festival offers</li>
                  <li>📦 Updates on seasonal collections</li>
                </ul>
              </div>
              
              <p>As a welcome gift, here's a special offer just for you:</p>
              <p style="text-align: center; font-size: 18px; color: #14b8a6; font-weight: bold;">
                🎁 Use code <strong style="background-color: #f0fdfa; padding: 5px 10px; border-radius: 3px;">WELCOME10</strong> for 10% off your first order!
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" class="cta-button">
                  Start Shopping
                </a>
              </div>
              
              <p>Don't want to miss out? Follow us on social media for daily updates and behind-the-scenes content!</p>
              
              <div class="social-links">
                <a href="#">Facebook</a> |
                <a href="#">Instagram</a> |
                <a href="#">Twitter</a>
              </div>
              
              <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to reach out to us at:</p>
              <ul>
                <li>📧 Email: ${process.env.EMAIL_FROM || 'info@papadshop.com'}</li>
                <li>📞 Phone: +91 98765 43210</li>
              </ul>
              
              <p style="font-size: 12px; color: #666; margin-top: 30px;">
                You're receiving this email because you subscribed to our newsletter at ${process.env.NEXT_PUBLIC_APP_URL || 'papadshop.com'}. 
                If you wish to unsubscribe, you can do so at any time by clicking the unsubscribe link in our emails.
              </p>
              
              <p>Happy Shopping!<br><strong>The Papad Store Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Papad Store. All rights reserved.</p>
              <p>Handcrafted with ❤️ | Made with Love</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();