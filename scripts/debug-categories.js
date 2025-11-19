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
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);

async function debugCategoriesAndProducts() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/papad-store';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await Category.find({}).lean();
    console.log('\n=== CATEGORIES ===');
    console.log(`Found ${categories.length} categories:`);
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. Name: "${cat.name}", Slug: "${cat.slug}", Active: ${cat.isActive}, ID: ${cat._id}`);
    });

    // Get all products
    const products = await Product.find({}).populate('categoryId', 'name slug').lean();
    console.log('\n=== PRODUCTS ===');
    console.log(`Found ${products.length} products:`);
    products.forEach((prod, index) => {
      console.log(`${index + 1}. Name: "${prod.name}", Category: "${prod.categoryId?.name}" (${prod.categoryId?.slug}), Active: ${prod.isActive}, Stock: ${prod.stock}`);
    });

    // Test category filtering
    console.log('\n=== TESTING CATEGORY FILTERING ===');
    for (const category of categories) {
      const categoryProducts = await Product.find({ 
        categoryId: category._id, 
        isActive: true 
      }).populate('categoryId', 'name slug').lean();
      
      console.log(`Category "${category.name}" (${category.slug}) has ${categoryProducts.length} active products:`);
      categoryProducts.forEach(prod => {
        console.log(`  - ${prod.name} (Stock: ${prod.stock})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

debugCategoriesAndProducts();