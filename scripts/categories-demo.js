// Demo categories for your papad store
// You can add these through the admin panel at /admin/categories

const demoCategories = [
  {
    name: "2 1/2 inch Papad",
    description: "Small size traditional papad - 2.5 inches diameter. Perfect for individual servings and quick snacks."
  },
  {
    name: "4 1/2 inch Papad",
    description: "Medium size traditional papad - 4.5 inches diameter. Ideal for family meals and sharing."
  },
  {
    name: "Small Size Appalam",
    description: "Crispy small appalam variety made with traditional recipes. Light and crunchy texture."
  },
  {
    name: "Large Size Papad",
    description: "Large traditional papad for family meals. Perfect for special occasions and gatherings."
  },
  {
    name: "Masala Papad",
    description: "Spiced papad with traditional masala mix. Flavored with cumin, black pepper, and aromatic spices."
  },
  {
    name: "Plain Papad",
    description: "Classic plain papad without spices. Traditional taste with simple ingredients."
  },
  {
    name: "Rice Papad",
    description: "Light and crispy papad made from rice flour. Gluten-free option for all customers."
  },
  {
    name: "Urad Dal Papad",
    description: "Traditional papad made from black gram dal. Rich protein content with authentic taste."
  }
];

console.log('='.repeat(60));
console.log('🥘 PAPAD STORE CATEGORIES 🥘');
console.log('='.repeat(60));
console.log('\nAdd these categories through your admin panel at /admin/categories:\n');

demoCategories.forEach((category, index) => {
  console.log(`${index + 1}. ${category.name}`);
  console.log(`   Description: ${category.description}`);
  console.log('');
});

console.log('='.repeat(60));
console.log('How to add categories:');
console.log('1. Go to http://localhost:3000/admin/categories');
console.log('2. Click "Add Category" button');
console.log('3. Enter the category name and description');
console.log('4. Click "Add Category" to save');
console.log('='.repeat(60));