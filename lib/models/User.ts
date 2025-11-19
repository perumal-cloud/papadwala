import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
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
        // Basic URL validation for profile picture
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Profile picture must be a valid image URL'
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