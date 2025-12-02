const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// User Schema (copy from your model)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 60
  },
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  },
  profilePicture: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      if ('passwordHash' in ret) delete ret.passwordHash;
      if ('__v' in ret) delete ret.__v;
      return ret;
    }
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@PapadWala.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@PapadWala.com');
      console.log('Current role:', existingAdmin.role);
      
      // Update role to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated user role to admin');
      }
      
      process.exit(0);
    }
    
    // Create admin user
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('admin123', saltRounds);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@PapadWala.com',
      passwordHash: passwordHash,
      role: 'admin',
      isVerified: true
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@PapadWala.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: admin');
    console.log('');
    console.log('You can now login with these credentials and access the admin dashboard!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdminUser();