import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  userEmail: string;
  codeHash: string;
  expiresAt: Date;
  used: boolean;
  attempts: number;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>({
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  codeHash: {
    type: String,
    required: [true, 'OTP code hash is required']
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  used: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: [5, 'Too many verification attempts']
  }
}, {
  timestamps: true
});

// Indexes for performance and TTL
otpSchema.index({ userEmail: 1, used: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ createdAt: -1 });

// Compound index for efficient lookups
otpSchema.index({ userEmail: 1, used: 1, expiresAt: 1 });

// Prevent re-compilation in development
const OTP = mongoose.models.OTP || mongoose.model<IOTP>('OTP', otpSchema);

export default OTP;