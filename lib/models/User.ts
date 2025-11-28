import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'admin' | 'customer';
  profilePicture?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty values
        return /^[+]?[(]?[\d\s\-\(\)]{10,15}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    minlength: [60, 'Password hash is invalid'] // bcrypt hash length
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'customer'],
      message: 'Role must be either admin or customer'
    },
    default: 'customer'
  },
  profilePicture: {
    type: String,
    default: null,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow null/empty values
        
        try {
          const url = new URL(v);
          
          // Allow HTTPS and HTTP protocols
          if (url.protocol !== 'https:' && url.protocol !== 'http:') {
            return false;
          }
          
          // Check for trusted domains (Google, Cloudinary, etc.)
          const trustedDomains = [
            'googleusercontent.com',
            'lh3.googleusercontent.com',
            'lh4.googleusercontent.com', 
            'lh5.googleusercontent.com',
            'lh6.googleusercontent.com',
            'graph.google.com',
            'res.cloudinary.com',
            'cloudinary.com'
          ];
          
          const isTrustedDomain = trustedDomains.some(domain => 
            url.hostname === domain || url.hostname.endsWith('.' + domain)
          );
          
          // For Google domains, be more lenient with URL structure
          if (url.hostname.includes('googleusercontent.com') || url.hostname.includes('graph.google.com')) {
            return true;
          }
          
          // For other trusted domains, ensure it looks like an image URL
          if (isTrustedDomain) {
            const pathname = url.pathname.toLowerCase();
            const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(pathname) ||
                                    pathname.includes('/image/') ||
                                    pathname.includes('/upload/') ||
                                    url.search.includes('format=') ||
                                    url.hostname.includes('googleusercontent.com');
            return hasImageExtension;
          }
          
          // For other domains, check if it's a valid image URL
          const pathname = url.pathname.toLowerCase();
          return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(pathname);
          
        } catch {
          return false;
        }
      },
      message: 'Profile picture must be a valid image URL from a trusted domain'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      if ('passwordHash' in ret) delete (ret as any).passwordHash;
      if ('__v' in ret) delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isVerified: 1, role: 1 });

// Prevent re-compilation in development
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;