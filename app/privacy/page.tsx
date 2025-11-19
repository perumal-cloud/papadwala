'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, FileText, Mail, Phone, Calendar } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
      <div className="bg-gradient-to-r from-teal-600 via-red-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-white" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="mt-4 text-lg opacity-90">
              Last updated: November 7, 2025
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
              PapadShop (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
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
                <p className="text-gray-600 mb-3">We may collect the following personal information:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely by our payment providers)</li>
                  <li>Order history and preferences</li>
                  <li>Account credentials (username, password)</li>
                  <li>Communication preferences</li>
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
              <li><strong>Order Processing:</strong> To process and fulfill your orders, including payment processing and shipping</li>
              <li><strong>Account Management:</strong> To create and manage your user account</li>
              <li><strong>Customer Service:</strong> To respond to your inquiries and provide customer support</li>
              <li><strong>Communication:</strong> To send order confirmations, shipping updates, and promotional emails (with your consent)</li>
              <li><strong>Website Improvement:</strong> To analyze website usage and improve our services</li>
              <li><strong>Security:</strong> To protect against fraud and ensure website security</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              <li><strong>Marketing:</strong> To send you promotional offers and product recommendations (you can opt-out anytime)</li>
            </ul>
          </div>
        </section>

        {/* Information Sharing */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Information Sharing and Disclosure</h2>
            
            <p className="text-gray-600 mb-4">We may share your information in the following circumstances:</p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Service Providers</h3>
                <p className="text-gray-600">We work with third-party service providers for payment processing, shipping, email marketing, and website analytics. These providers have access to your information only to perform specific tasks on our behalf.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Legal Requirements</h3>
                <p className="text-gray-600">We may disclose your information if required by law, court order, or government investigation.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Business Transfers</h3>
                <p className="text-gray-600">In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Consent</h3>
                <p className="text-gray-600">We may share your information with your explicit consent for specific purposes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Security</h2>
            
            <p className="text-gray-600 mb-4">We implement appropriate security measures to protect your personal information:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>SSL encryption for data transmission</li>
              <li>Secure servers and databases</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and employee training</li>
              <li>Payment data is processed by PCI-compliant payment processors</li>
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
  );
}