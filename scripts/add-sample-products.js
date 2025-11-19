#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Category schema
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Product schema (simplified)
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  images: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);

async function addSampleProducts() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/papad-store';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find the "4 1/2 inch Papad" category
    const category = await Category.findOne({ slug: '4-12-inch-papad' });
    if (!category) {
      console.log('Category "4 1/2 inch Papad" not found!');
      return;
    }

    console.log(`Found category: ${category.name} (ID: ${category._id})`);

    // Sample products for the 4 1/2 inch category
    const sampleProducts = [
      {
        name: 'Jeera Papad 4.5"',
        slug: 'jeera-papad-45',
        categoryId: category._id,
        description: 'Crispy jeera (cumin) flavored papad - 4.5 inch size, perfect for families',
        price: 45,
        stock: 25,
        images: [],
        isActive: true
      },
      {
        name: 'Plain Papad 4.5"',
        slug: 'plain-papad-45',
        categoryId: category._id,
        description: 'Traditional plain papad - 4.5 inch size, ideal for large gatherings',
        price: 40,
        stock: 30,
        images: [],
        isActive: true
      },
      {
        name: 'Garlic Papad 4.5"',
        slug: 'garlic-papad-45',
        categoryId: category._id,
        description: 'Aromatic garlic flavored papad - 4.5 inch size, great with meals',
        price: 50,
        stock: 20,
        images: [],
        isActive: true
      }
    ];

    // Add products one by one
    for (const productData of sampleProducts) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({ slug: productData.slug });
        if (existingProduct) {
          console.log(`Product "${productData.name}" already exists, skipping...`);
          continue;
        }

        const product = new Product(productData);
        await product.save();
        console.log(`✅ Added product: ${product.name} (₹${product.price}, Stock: ${product.stock})`);
      } catch (error) {
        console.error(`❌ Error adding product "${productData.name}":`, error.message);
      }
    }

    // Verify the results
    console.log('\n=== VERIFICATION ===');
    const categoryProducts = await Product.find({ 
      categoryId: category._id, 
      isActive: true 
    }).lean();
    
    console.log(`Category "${category.name}" now has ${categoryProducts.length} active products:`);
    categoryProducts.forEach((prod, index) => {
      console.log(`${index + 1}. ${prod.name} - ₹${prod.price} (Stock: ${prod.stock})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

addSampleProducts();