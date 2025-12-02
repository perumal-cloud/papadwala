# Contact Form Integration with Nodemailer

This document explains how the contact form email functionality is implemented using Nodemailer.

## 📧 Features

### For Users:
- **Contact Form**: Simple form with name, email, subject, and message fields
- **Real-time Validation**: Client-side and server-side validation
- **Success Feedback**: Instant feedback when message is sent
- **Error Handling**: Clear error messages for any issues

### For Admins:
- **Email Notifications**: Receive contact form submissions directly in your inbox
- **Customer Confirmation**: Automatic confirmation emails sent to customers
- **Professional Templates**: Beautiful HTML email templates
- **Reply Integration**: Can reply directly to customer emails

## 🛠️ Technical Implementation

### 1. Email Service (`lib/services/email.ts`)
- **EmailService Class**: Handles all email operations
- **Nodemailer Integration**: SMTP configuration for reliable email delivery
- **Template System**: HTML email templates for different email types
- **Error Handling**: Robust error handling and logging

### 2. API Endpoint (`app/api/contact/route.ts`)
- **POST /api/contact**: Handles contact form submissions
- **Validation**: Server-side validation using custom validation functions
- **Dual Emails**: Sends both admin notification and customer confirmation

### 3. Contact Page (`app/contact/page.tsx`)
- **React Form**: Interactive contact form with real-time feedback
- **State Management**: Handles form state, loading, and success/error states
- **User Experience**: Loading indicators and clear success/error messages

### 4. Validation (`lib/services/validation.ts`)
- **Input Validation**: Validates name, email, subject, and message
- **Security**: Prevents spam and validates email formats
- **Error Messages**: User-friendly validation error messages

## 🔧 Configuration

### Environment Variables (`.env.local`)
```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Settings
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Papad Store
ADMIN_EMAIL=admin@PapadWala.com
```

### SMTP Setup for Gmail:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password for your application
3. Use the App Password in `SMTP_PASS` (not your regular password)

## 📨 Email Templates

### 1. Admin Notification Email
- **Subject**: "Contact Form: [User's Subject]"
- **Content**: User's contact information and message
- **Features**: Reply-to header set to user's email for easy responses

### 2. Customer Confirmation Email
- **Subject**: "Thank you for contacting Papad Store"
- **Content**: Acknowledgment and next steps
- **Features**: Professional branding and helpful information

## 🚀 Usage

### For Customers:
1. Visit `/contact` page
2. Fill out the contact form
3. Submit the form
4. Receive instant feedback and confirmation email

### For Admins:
1. Receive email notifications for all contact form submissions
2. Reply directly to customer emails from your email client
3. Customer information and message are included in the notification

## 🧪 Testing

### Test Email Functionality:
```bash
cd /home/laabam/papad
node scripts/test-contact-email.js
```

This script will:
1. Test SMTP connection
2. Send test contact emails
3. Verify email functionality

### Manual Testing:
1. Start the development server: `npm run dev`
2. Navigate to `/contact`
3. Fill out and submit the form
4. Check both admin and customer emails

## 🛡️ Security Features

### Input Validation:
- **Name**: 2-100 characters, no special validation
- **Email**: Valid email format required
- **Subject**: 3-200 characters
- **Message**: 10-2000 characters

### Spam Prevention:
- Server-side validation
- Rate limiting (can be added)
- Input sanitization

### Email Security:
- SMTP authentication required
- No sensitive data in email templates
- Professional email formatting

## 🔍 Troubleshooting

### Common Issues:

1. **Email not sending**:
   - Check SMTP credentials in `.env.local`
   - Verify Gmail App Password is correct
   - Ensure 2FA is enabled on Gmail account

2. **Customer not receiving confirmation**:
   - Check customer's spam folder
   - Verify `EMAIL_FROM` is a valid email address
   - Test with different email providers

3. **Admin not receiving notifications**:
   - Verify `ADMIN_EMAIL` is correct in environment variables
   - Check admin's spam folder
   - Test SMTP connection using the test script

### Debug Steps:
1. Run the test script: `node scripts/test-contact-email.js`
2. Check server logs for error messages
3. Verify environment variables are loaded correctly
4. Test with a simple email client

## 📋 Form Fields

| Field | Validation | Required | Max Length |
|-------|------------|----------|------------|
| Name | 2+ characters | Yes | 100 |
| Email | Valid email format | Yes | - |
| Subject | 3+ characters | Yes | 200 |
| Message | 10+ characters | Yes | 2000 |

## 🎨 Customization

### Email Templates:
- Modify templates in `EmailService` class methods
- Update branding colors and styling
- Add company logo or additional information

### Form Fields:
- Add new fields to the contact form
- Update validation rules in `validateContactForm`
- Modify API endpoint to handle new fields

### Styling:
- Update CSS classes in contact page
- Modify Tailwind classes for different appearance
- Add animations or transitions

## 📝 API Reference

### POST /api/contact

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I have questions about your papads..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Thank you for your message! We will get back to you soon."
}
```

**Error Response (400/500):**
```json
{
  "error": "Validation failed",
  "details": ["Name is required", "Email must be valid"],
  "success": false
}
```

## 🔄 Future Enhancements

### Possible Improvements:
1. **Rate Limiting**: Prevent spam submissions
2. **File Attachments**: Allow users to attach files
3. **Auto-Responses**: More sophisticated auto-response system
4. **Admin Dashboard**: View contact submissions in admin panel
5. **Email Templates Editor**: Allow admins to customize email templates
6. **Analytics**: Track contact form submission rates and response times

### Integration Options:
1. **CRM Integration**: Connect to customer relationship management systems
2. **Slack Notifications**: Send notifications to Slack channels
3. **Ticket System**: Create support tickets from contact form submissions
4. **Email Marketing**: Add customers to email marketing lists

This contact form integration provides a professional, reliable way for customers to reach out while ensuring admins receive and can respond to inquiries efficiently.