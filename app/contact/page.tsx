'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Reset status after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to send message. Please try again.');
        
        // Reset error status after 5 seconds
        setTimeout(() => {
          setSubmitStatus('idle');
          setErrorMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
    >
      <div className="min-h-screen bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-800 font-medium transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>

        

        {/* Map Section */}
        <div className="max-w-full mx-auto">
         
          <div className="bg-white overflow-hidden border border-gray-100">
            <div className="h-96 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125745.05151901965!2d77.89627847362214!3d9.919382879443995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b1189633%3A0xdc955b7264f63933!2sMadurai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1699883425000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Madurai Location Map"
              ></iframe>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="text-4xl  text-gray-900 mb-8">Get in Touch</h2>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300">
                      <Mail className="h-8 w-8 text-teal-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl  text-gray-900 mb-2">Email Us</h3>
                    <p className="text-gray-600 mb-3">Send us an email and we'll respond within 24 hours</p>
                    <a href="mailto:info@papadshop.com" className="text-teal-600 hover:text-teal-800 font-semibold transition-colors">
                      info@papadshop.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300">
                      <Phone className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl  text-gray-900 mb-2">Call Us</h3>
                    <p className="text-gray-600 mb-3">Speak directly with our customer service team</p>
                    <a href="tel:+916369890217" className="text-teal-600 hover:text-teal-800 font-semibold transition-colors">
                      +91 6369890217
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-8 w-8 text-teal-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl  text-gray-900 mb-2">Visit Us</h3>
                    <p className="text-gray-600 mb-3">Come visit our store in Madurai</p>
                    <address className="text-gray-600 not-italic leading-relaxed">
                      37/A North Street<br />
                      Annuapanadi<br />
                      Madurai, Tamil Nadu 625009<br />
                      India
                    </address>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300">
                      <Clock className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl  text-gray-900 mb-2">Business Hours</h3>
                    <div className="text-gray-600 leading-relaxed">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Contact Form */}
            <div>
              <div>
                
                {submitStatus === 'success' && (
                  <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-green-800 font-semibold">
                          Thank you for your message! We'll get back to you within 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-red-800 font-semibold">
                          {errorMessage || 'Something went wrong. Please try again later.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label htmlFor="name" className="block text-sm  text-gray-700 mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 border-2 border-gray-200  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm  text-gray-700 mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 border-2 border-gray-200  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm  text-gray-700 mb-3">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 border-2 border-gray-200  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="What is this about?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm  text-gray-700 mb-3">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-6 py-4 border-2 border-gray-200  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all duration-200"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-8 hover:from-teal-700 hover:to-teal-800 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center shadow-lg"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 animate-spin border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-3" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}