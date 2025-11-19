'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Scale, ShoppingBag, CreditCard, Truck, AlertTriangle, Calendar, Mail, Phone } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Scale className="h-16 w-16 mx-auto mb-6 text-white" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Terms of Service</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Please read these terms carefully before using our services
            </p>
            <p className="mt-4 text-lg opacity-90">
              Last updated: November 7, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Agreement to Terms */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <FileText className="h-8 w-8 text-teal-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Agreement to Terms</h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              These Terms of Service (&quot;Terms&quot;) govern your use of PapadShop&apos;s website located at papadshop.com (the &quot;Service&quot;) operated by PapadShop (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
            </p>
            <div className="p-4 bg-teal-50 border-l-4 border-teal-500">
              <p className="text-gray-700">
                <strong>Important:</strong> By creating an account or making a purchase, you confirm that you have read, understood, and agree to these Terms of Service.
              </p>
            </div>
          </div>
        </section>

        {/* Use of Service */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Use of Service</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Eligibility</h3>
                <p className="text-gray-600 mb-3">To use our Service, you must:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Be at least 18 years of age or have parental consent</li>
                  <li>Provide accurate and complete information when creating an account</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not use the Service for any illegal or unauthorized purpose</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Responsibilities</h3>
                <p className="text-gray-600 mb-3">When you create an account, you agree to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Provide accurate, current, and complete account information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Prohibited Uses</h3>
                <p className="text-gray-600 mb-3">You may not use our Service:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>For any unlawful purpose or to solicit others to unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations or laws</li>
                  <li>To transmit or procure the sending of any advertising or promotional material</li>
                  <li>To impersonate or attempt to impersonate another person</li>
                  <li>To engage in any other conduct that restricts or inhibits anyone&apos;s use</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Products and Orders */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <ShoppingBag className="h-8 w-8 text-teal-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Products and Orders</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Product Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>We strive to display accurate product information, but cannot guarantee completeness</li>
                  <li>Colors and appearance may vary due to monitor settings</li>
                  <li>Product availability is subject to change without notice</li>
                  <li>All prices are in Indian Rupees (INR) unless otherwise stated</li>
                  <li>We reserve the right to correct pricing errors</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Order Acceptance</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>All orders are subject to acceptance and availability</li>
                  <li>We reserve the right to refuse or cancel any order</li>
                  <li>Order confirmation does not guarantee product availability</li>
                  <li>We may require additional verification for certain orders</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Order Modifications</h3>
                <p className="text-gray-600 mb-3">
                  Orders can be modified or cancelled within 1 hour of placement. After this time, modifications may not be possible if the order has entered processing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Terms */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <CreditCard className="h-8 w-8 text-teal-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Payment Terms</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Accepted Payment Methods</h3>
                <p className="text-gray-600">We accept credit cards, debit cards, UPI, net banking, and digital wallets. All payments are processed securely through trusted payment gateways.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Processing</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Payment is required at the time of order placement</li>
                  <li>We do not store your payment information on our servers</li>
                  <li>Failed payments may result in order cancellation</li>
                  <li>Currency conversion fees may apply for international payments</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Refunds</h3>
                <p className="text-gray-600">Refunds will be processed to the original payment method within 5-7 business days of approval. Processing times may vary by payment provider.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping and Delivery */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <Truck className="h-8 w-8 text-teal-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Shipping and Delivery</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Shipping Areas</h3>
                <p className="text-gray-600">We currently ship within India. International shipping may be available for select products and destinations.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delivery Times</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Standard delivery: 3-5 business days</li>
                  <li>Express delivery: 1-2 business days</li>
                  <li>Delivery times may vary based on location and product availability</li>
                  <li>Orders placed on weekends/holidays will be processed on the next business day</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Risk of Loss</h3>
                <p className="text-gray-600">Risk of loss and title for products pass to you upon delivery to the carrier. We are not responsible for packages once they leave our facility.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Returns and Exchanges */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Returns and Exchanges</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Return Policy</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Returns accepted within 7 days of delivery</li>
                  <li>Products must be unopened and in original packaging</li>
                  <li>Due to food safety regulations, opened food items cannot be returned</li>
                  <li>Customer is responsible for return shipping costs unless product was defective</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Damaged or Defective Products</h3>
                <p className="text-gray-600">If you receive damaged or defective products, contact us within 48 hours with photos. We will arrange for replacement or full refund at no cost to you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Intellectual Property Rights</h2>
            
            <p className="text-gray-600 mb-4">
              The Service and its original content, features, and functionality are and will remain the exclusive property of PapadShop and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your License</h3>
                <p className="text-gray-600">We grant you a limited, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial purposes.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Restrictions</h3>
                <p className="text-gray-600">You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, or transmit any content without our written permission.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimers */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-8 w-8 text-teal-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Disclaimers and Limitation of Liability</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Disclaimer</h3>
                <p className="text-gray-600 mb-3">
                  The information on this website is provided on an "as is" basis. We disclaim all warranties, express or implied, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Warranties of merchantability and fitness for a particular purpose</li>
                  <li>Warranties regarding the accuracy, reliability, or completeness of information</li>
                  <li>Warranties that the service will be uninterrupted or error-free</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h3>
                <p className="text-gray-600">
                  In no event shall PapadShop be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                </p>
              </div>

              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="text-gray-700">
                  <strong>Maximum Liability:</strong> Our total liability to you for any damages shall not exceed the amount you paid us in the 12 months preceding the claim.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Governing Law and Jurisdiction</h2>
            
            <p className="text-gray-600 mb-4">
              These Terms shall be interpreted and governed by the laws of India. Any disputes arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Dispute Resolution</h3>
                <p className="text-gray-600">We encourage you to contact us first to resolve any disputes. For unresolved issues, both parties agree to binding arbitration under Indian Arbitration and Conciliation Act, 2015.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <Calendar className="h-8 w-8 text-teal-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Changes to Terms</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide at least 30 days notice prior to any new terms taking effect</li>
              <li>Notify you via email or through a prominent notice on our Service</li>
              <li>Update the "Last updated" date at the top of this page</li>
            </ul>
            
            <p className="text-gray-600 mt-4">
              Your continued use of the Service after any changes constitute acceptance of the new Terms.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
            
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-teal-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:info@papadshop.com" className="text-teal-600 hover:text-teal-800">
                    info@papadshop.com
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
                <strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM IST
              </p>
            </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="text-center">
          <Link
            href="/privacy"
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors mr-4"
          >
            Privacy Policy
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center px-6 py-3 border border-teal-600 text-teal-600 font-medium rounded-lg hover:bg-teal-50 transition-colors"
          >
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}