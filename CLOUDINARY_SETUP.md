# Cloudinary Configuration Required

To fix the avatar upload issue, you need to set up your Cloudinary environment variables.

## 1. Create a `.env.local` file in your project root:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: File upload limits
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

## 2. Get your Cloudinary credentials:

1. Go to https://cloudinary.com/
2. Sign up or log in to your account
3. Go to your Dashboard
4. Copy your:
   - Cloud Name
   - API Key
   - API Secret

## 3. Test the configuration:

Visit: http://localhost:3000/api/test/cloudinary

This will show if your Cloudinary connection is working properly.

## 4. Restart your development server:

```bash
npm run dev
```

## Current Error:
The error "Failed to upload avatar. Please try again." occurs because Cloudinary environment variables are not configured, so the upload service cannot connect to Cloudinary.