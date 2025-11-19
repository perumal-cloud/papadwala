// Script to create default papad categories
// Run this with: node scripts/create-categories.js

const { connectDB } = require('../lib/database');
const { Category } = require('../lib/models');

const defaultCategories = [
  {
    name: '2 1/2 inch Papad',
    description: 'Small size traditional papad - 2.5 inches diameter'
  },
  {
    name: '4 1/2 inch Papad',
    description: 'Medium size traditional papad - 4.5 inches diameter'
  },
  {
    name: 'Small Size Appalam',
    description: 'Crispy small appalam variety'
  },
  {
    name: 'Large Size Papad',
    description: 'Large traditional papad for family meals'
  },
  {
    name: 'Masala Papad',
    description: 'Spiced papad with traditional masala mix'
  },
  {
    name: 'Plain Papad',
    description: 'Classic plain papad without spices'
  }
];

async function createCategories() {
  try {
    await connectDB();
    console.log('Connected to database...');

    for (const categoryData of defaultCategories) {
      // Check if category already exists
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') } 
      });

      if (!existingCategory) {
        const category = new Category({
          ...categoryData,
          isActive: true
        });
        
        await category.save();
        console.log(`✅ Created category: ${categoryData.name}`);
      } else {
        console.log(`⚠️  Category already exists: ${categoryData.name}`);
      }
    }

    console.log('\n🎉 Categories setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating categories:', error);
    process.exit(1);
  }
}

createCategories();