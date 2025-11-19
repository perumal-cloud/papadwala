// PDF Configuration
export const PDF_CONFIG = {
  // Preferred PDF library: 'pdfkit' | 'jspdf' | 'auto' (fallback)
  preferredLibrary: 'auto',
  
  // PDFKit specific settings
  pdfkit: {
    margin: 50,
    size: 'A4',
    autoFirstPage: true,
    bufferPages: true,
    // Don't specify font to avoid font loading issues
    disableFontSubsetting: true,
  },

  // jsPDF specific settings  
  jspdf: {
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  },

  // General settings
  company: {
    name: 'Papad Wala',
    address: '37/A North street annupanadi, Madurai, Tamil Nadu 625009, India',
    phone: '+91-6369890217',
    email: 'info@papadshop.com',
    website: 'www.papadstore.com',
    gst: 'GST123456789'
  },

  // Layout settings
  layout: {
    headerFontSize: 20,
    companyNameFontSize: 16,
    sectionHeaderFontSize: 12,
    bodyFontSize: 10,
    footerFontSize: 8,
    lineHeight: 6,
    sectionSpacing: 15,
  }
};

export default PDF_CONFIG;