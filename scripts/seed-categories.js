const axios = require('axios');

const API_URL = 'https://strapi.lust66.com';

// Sample categories to create
const categories = [
  {
    name: 'SPA',
    slug: 'spa',
    order: 1
  },
  {
    name: 'Massage',
    slug: 'massage',
    order: 2
  },
  {
    name: 'Beauty Services',
    slug: 'beauty-services',
    order: 3
  },
  {
    name: 'Wellness',
    slug: 'wellness',
    order: 4
  },
  {
    name: 'Fitness',
    slug: 'fitness',
    order: 5
  }
];

async function seedCategories() {
  console.log('Creating sample categories...');
  
  for (const category of categories) {
    try {
      const response = await axios.post(`${API_URL}/api/categories`, {
        data: category
      });
      console.log(`✅ Created category: ${category.name}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already exists')) {
        console.log(`⚠️  Category "${category.name}" already exists, skipping...`);
      } else {
        console.error(`❌ Error creating category "${category.name}":`, error.response?.data || error.message);
      }
    }
  }
  
  console.log('\n✨ Categories seeding completed!');
  console.log('\nNote: To use this script, you may need to:');
  console.log('1. Make sure your Strapi instance is running');
  console.log('2. Update API permissions to allow public category creation (temporarily)');
  console.log('3. Or add authentication headers to this script');
}

seedCategories(); 