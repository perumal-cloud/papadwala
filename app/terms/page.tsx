'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Scale, ShoppingBag, CreditCard, Truck, AlertTriangle, Calendar, Mail, Phone } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/images/terms.jpg')"
      }}
    >
      {/* Background Overlay */}
      <div className="min-h-screen bg-white/90 backdrop-blur-sm">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative py-40 bg-cover bg-center" style={{ backgroundImage: "url('/images/terms.jpg')" }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <Scale className="h-16 w-16 mx-auto mb-6 text-white" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">Terms of Service</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white">
              Please read these terms carefully before using our services
            </p>
            <p className="mt-4 text-lg opacity-90 text-white">
              Last updated: December 1, 2025
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
              These Terms of Service (&quot;Terms&quot;) govern your use of Papad&apos;s website (papad.com) and e-commerce platform for authentic Indian snacks, traditional delicacies, and handcrafted papads. Our services include online ordering, secure checkout, Cash on Delivery (COD) payment, order tracking, and delivery within India.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              By creating an account, placing an order, or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service. Papad is operated from Madurai, Tamil Nadu, India.
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
                  <li>Complete OTP (One-Time Password) verification via email for account activation</li>
                  <li>Maintain the security of your password (encrypted and stored securely)</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access or security breach</li>
                  <li>Provide accurate shipping address, phone number, and contact information</li>
                  <li>Keep your profile information up to date for smooth order delivery</li>
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
                  <li>We strive to display accurate product information including ingredients, weight, and nutritional facts</li>
                  <li>Product colors and appearance may vary slightly due to monitor settings and photography</li>
                  <li>Product availability and stock levels are subject to change without prior notice</li>
                  <li>All prices are in Indian Rupees (₹) and include applicable taxes</li>
                  <li>We reserve the right to correct pricing errors and will notify you before processing your order</li>
                  <li>Best before dates are clearly mentioned on products - we ensure minimum shelf life on delivery</li>
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
                <h3 className="text-lg font-semibold text-gray-900">Order Modifications & Cancellation</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Orders can be cancelled before they are marked as &quot;Confirmed&quot; or &quot;Shipped&quot;</li>
                  <li>Cancellation can be done from &quot;My Orders&quot; page or by contacting customer support</li>
                  <li>Once an order is delivered, cancellation is not possible</li>
                  <li>Modifications to shipping address must be requested immediately after placing the order</li>
                </ul>
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
                <p className="text-gray-600">Currently, we accept Cash on Delivery (COD) as our payment method. You can pay in cash when your order is delivered to your doorstep. We are working on integrating online payment options including credit cards, debit cards, UPI, net banking, and popular digital wallets for your convenience.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cash on Delivery (COD)</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Pay in cash when you receive your order</li>
                  <li>No online payment required at checkout</li>
                  <li>Inspect your products before making payment</li>
                  <li>Please keep exact change ready for faster delivery</li>
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
                <p className="text-gray-600">We currently ship to all serviceable pin codes within India. International shipping is not available at this time. Please enter your pin code at checkout to verify delivery availability in your area.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">Shipping Charges</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>Orders below ₹500:</strong> ₹50 shipping charge</li>
                  <li><strong>Orders ₹500 and above:</strong> FREE shipping!</li>
                  <li>Shipping charges are automatically calculated at checkout</li>
                  <li>No hidden charges - what you see is what you pay</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delivery Times</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Standard delivery: 3-7 business days within India (varies by location)</li>
                  <li>Metro cities and major towns: 3-5 business days</li>
                  <li>Remote areas may take 5-7 business days</li>
                  <li>Orders placed on weekends/holidays will be processed on the next business day</li>
                  <li>You will receive order confirmation via email with expected delivery date</li>
                  <li>Track your order anytime from the &quot;My Orders&quot; section in your account</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Risk of Loss</h3>
                <p className="text-gray-600">Risk of loss and title for products pass to you upon delivery to the carrier. We are not responsible for packages once they leave our facility.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Secure Shopping */}
        <section id="secure-shopping" className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <svg className="h-8 w-8 text-teal-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 6h2v7h-2V8zm0-3h2v2h-2V5z"/>
              </svg>
              <h2 className="text-3xl font-bold text-gray-900">Secure Shopping</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Security is Our Priority</h3>
                <p className="text-gray-600 mb-3">
                  At Papad, we take your security seriously. We implement industry-standard security measures to protect your personal and payment information at every step of your shopping experience. Your trust is our most valuable asset.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Protection</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>SSL Encryption:</strong> All data transmitted between your browser and our servers is encrypted using 256-bit SSL (Secure Socket Layer) technology</li>
                  <li><strong>Secure Payment Gateway:</strong> We use PCI-DSS compliant payment gateways to process all transactions</li>
                  <li><strong>No Card Storage:</strong> We do not store your credit/debit card information on our servers</li>
                  <li><strong>Privacy Protection:</strong> Your personal information is never shared with third parties without your consent</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Cash on Delivery (COD)</h3>
                <p className="text-gray-600 mb-3">
                  For added peace of mind, we currently offer Cash on Delivery as our primary payment method. This means:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>No need to share your card or banking details online</li>
                  <li>Pay in cash when you receive your order</li>
                  <li>Inspect your products before making payment</li>
                  <li>100% secure and hassle-free shopping experience</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Security</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>OTP (One-Time Password) verification for account creation and login</li>
                  <li>Secure password requirements to protect your account</li>
                  <li>Activity monitoring to detect and prevent unauthorized access</li>
                  <li>Instant notifications for important account activities</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Fraud Prevention</h3>
                <p className="text-gray-600 mb-3">
                  We actively monitor all transactions and orders to prevent fraudulent activities:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Advanced fraud detection systems</li>
                  <li>Order verification for suspicious activities</li>
                  <li>Secure delivery confirmation process</li>
                  <li>24/7 customer support for security concerns</li>
                </ul>
              </div>

              <div className="p-6 bg-teal-50 border-l-4 border-teal-600 rounded-r-lg">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="h-5 w-5 text-teal-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Security Tips
                </h4>
                <ul className="text-gray-700 space-y-1 ml-7 text-sm">
                  <li>• Never share your password with anyone</li>
                  <li>• Always log out after shopping on shared devices</li>
                  <li>• Keep your contact information updated for order notifications</li>
                  <li>• Report any suspicious activity to our support team immediately</li>
                  <li>• Contact us at <a href="mailto:info@papadshop.com" className="text-teal-600 hover:underline">info@papadshop.com</a> or call +91 6369890217 for security concerns</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Returns and Exchanges */}
        <section id="returns" className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Returns and Exchanges</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Return Policy</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Returns accepted within 7 days of delivery for unopened products</li>
                  <li>Products must be unopened, unused, and in original sealed packaging</li>
                  <li>Due to food safety and hygiene regulations, opened food items cannot be returned or exchanged</li>
                  <li>Return requests must be initiated through your account or by contacting customer support</li>
                  <li>Return shipping costs are borne by the customer unless the product was defective or incorrect</li>
                  <li>Refunds will be processed within 5-7 business days after receiving the returned item</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Damaged or Defective Products</h3>
                <p className="text-gray-600">If you receive damaged, defective, or incorrect products, please contact us within 48 hours of delivery with clear photos showing the issue. We will arrange for a free replacement or provide a full refund at no cost to you. For damaged products, you don't need to return the item - we trust your judgment.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Intellectual Property Rights</h2>
            
            <p className="text-gray-600 mb-4">
              The Service and its original content, features, and functionality are and will remain the exclusive property of Papad and its licensors. The Service is protected by copyright, trademark, and other intellectual property laws of India.
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
                  In no event shall Papad be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service. This limitation applies to the fullest extent permitted by law.
                </p>
              </div>

              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="text-gray-700">
                  <strong>Maximum Liability:</strong> Our total liability to you for any damages arising from your purchase or use of our Service shall not exceed the amount you paid us for the specific order in question, or ₹1,000, whichever is less.
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
              These Terms shall be interpreted and governed by the laws of India. Any disputes arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in Madurai, Tamil Nadu, India.
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
              <p className="text-sm text-gray-600 mb-2">
                <strong>Business Hours:</strong> Monday - Friday: 9:00 AM - 6:00 PM IST | Saturday: 10:00 AM - 4:00 PM IST | Sunday: Closed
              </p>
              <p className="text-sm text-gray-600">
                <strong>Address:</strong> 37/A North Street, Annuapanadi, Madurai, Tamil Nadu 625009, India
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
    </div>
  );
}