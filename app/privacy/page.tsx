'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, FileText, Mail, Phone, Calendar } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/images/privacy.jpg')"
      }}
    >
      {/* Background Overlay */}
      <div className="min-h-screen bg-white/90 backdrop-blur-sm">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative py-40 bg-cover bg-center" style={{ backgroundImage: "url('/images/privacy.jpg')" }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-white" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">Privacy Policy</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="mt-4 text-lg opacity-90 text-white">
              Last updated: December 1, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <FileText className="h-8 w-8 text-teal-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Introduction</h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              PapadWala (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website PapadWala.com and use our services.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              We operate an e-commerce platform for authentic handcrafted papads, offering Cash on Delivery (COD) payment and secure order management services.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              By using our website, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our website.
            </p>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <Eye className="h-8 w-8 text-teal-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                <p className="text-gray-600 mb-3">We collect the following personal information when you use our services:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>Account Registration:</strong> Name, email address, phone number, password (encrypted)</li>
                  <li><strong>OTP Verification:</strong> Phone number for account verification via One-Time Password</li>
                  <li><strong>Order Information:</strong> Shipping address (full name, address, city, state, postal code, landmark)</li>
                  <li><strong>Payment Method:</strong> Cash on Delivery (COD) - No credit card or banking details are collected or stored</li>
                  <li><strong>Order History:</strong> Past orders, order status, tracking information</li>
                  <li><strong>Profile Information:</strong> Optional profile picture (stored on Cloudinary), delivery preferences</li>
                  <li><strong>Newsletter:</strong> Email address if you subscribe to our newsletter</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
                <p className="text-gray-600 mb-3">When you visit our website, we automatically collect:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring website information</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <Lock className="h-8 w-8 text-teal-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            
            <p className="text-gray-600 mb-4">We use the collected information for the following purposes:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
              <li><strong>Account Authentication:</strong> OTP verification via email, JWT-based session management</li>
              <li><strong>Order Processing:</strong> To process COD orders, manage cart, calculate shipping charges (₹50 for orders below ₹500, free above ₹500)</li>
              <li><strong>Order Fulfillment:</strong> To package and ship products to your provided address</li>
              <li><strong>Email Notifications:</strong> Order confirmation, shipping updates, order tracking, OTP codes (via Nodemailer)</li>
              <li><strong>Customer Support:</strong> To respond to inquiries via contact form, help with order issues</li>
              <li><strong>Newsletter:</strong> To send product updates, offers, and papad recipes (opt-in only)</li>
              <li><strong>Security:</strong> To prevent fraud, protect user accounts, monitor suspicious activities</li>
              <li><strong>Website Improvement:</strong> To analyze usage patterns and improve user experience</li>
              <li><strong>Legal Compliance:</strong> To comply with Indian laws and regulations</li>
            </ul>
          </div>
        </section>

        {/* Information Sharing */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Information Sharing and Disclosure</h2>
            
            <p className="text-gray-600 mb-4">We may share your information with third-party service providers only as necessary to operate our business:</p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Email Service Provider</h3>
                <p className="text-gray-600">We use <strong>Nodemailer</strong> with SMTP to send transactional emails (OTP codes, order confirmations, shipping updates, newsletters). Your email address is shared only for email delivery purposes.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Image Storage</h3>
                <p className="text-gray-600">Profile pictures and product images are stored on <strong>Cloudinary</strong>, a secure cloud-based image management service. Images are stored with appropriate privacy settings.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">Shipping Partners</h3>
                <p className="text-gray-600">Your shipping address and contact details are shared with our courier partners only to facilitate order delivery within India.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Legal Requirements</h3>
                <p className="text-gray-600">We may disclose your information if required by Indian law, court order, or government investigation.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">No Sale of Data</h3>
                <p className="text-gray-600"><strong>We do NOT sell, rent, or trade your personal information to third parties for marketing purposes.</strong></p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Security</h2>
            
            <p className="text-gray-600 mb-4">We implement industry-standard security measures to protect your personal information:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Password Encryption:</strong> All passwords are encrypted using bcrypt hashing algorithm before storage</li>
              <li><strong>JWT Authentication:</strong> Secure token-based authentication with access and refresh tokens</li>
              <li><strong>OTP Verification:</strong> Email-based OTP verification for account registration and login</li>
              <li><strong>SSL/TLS Encryption:</strong> All data transmitted between your browser and our servers is encrypted</li>
              <li><strong>MongoDB Security:</strong> Secure database with authentication and access controls</li>
              <li><strong>No Payment Data Storage:</strong> We use Cash on Delivery - no credit card or banking information is collected or stored</li>
              <li><strong>Cloudinary Security:</strong> Profile images stored on secure, industry-standard cloud infrastructure</li>
              <li><strong>Session Management:</strong> Automatic logout after inactivity, secure cookie handling</li>
            </ul>
            
            <div className="mt-6 p-4 bg-teal-50 border-l-4 border-teal-500">
              <p className="text-gray-700">
                <strong>Note:</strong> While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.
              </p>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Rights and Choices</h2>
            
            <p className="text-gray-600 mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Access:</strong> Request access to your personal information we hold</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Request a copy of your data in a structured format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Cookie Control:</strong> Manage cookie preferences through your browser settings</li>
            </ul>
            
            <p className="text-gray-600 mt-4">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookies and Tracking Technologies</h2>
            
            <p className="text-gray-600 mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Remember your preferences and settings</li>
              <li>Keep you logged in to your account</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Provide personalized content and advertisements</li>
              <li>Improve website performance and functionality</li>
            </ul>
            
            <p className="text-gray-600 mt-4">
              You can control cookie settings through your browser preferences. Note that disabling certain cookies may affect website functionality.
            </p>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Children&apos;s Privacy</h2>
            
            <p className="text-gray-600">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
            </p>
          </div>
        </section>

        {/* Updates */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <Calendar className="h-8 w-8 text-teal-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Policy Updates</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time. When we make changes, we will:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Update the "Last updated" date at the top of this policy</li>
              <li>Notify you by email if the changes are significant</li>
              <li>Post a notice on our website</li>
            </ul>
            
            <p className="text-gray-600 mt-4">
              We encourage you to review this policy periodically to stay informed about how we protect your information.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
            
            <p className="text-gray-600 mb-6">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-teal-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:privacy@papad.com" className="text-teal-600 hover:text-teal-800">
                    privacy@papad.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-teal-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <a href="tel:+916369890217" className="text-teal-600 hover:text-teal-800">
                    +91 6369890217
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Response Time:</strong> We will respond to your privacy-related inquiries within 30 days of receipt.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="text-center">
          <Link
            href="/help"
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors mr-4"
          >
            Visit Help Center
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-teal-600 text-teal-600 font-medium rounded-lg hover:bg-teal-50 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}