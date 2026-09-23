// Populates the database with sample products for local testing.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Wireless Headphones',
    description: 'Over-ear headphones with active noise cancellation and 30-hour battery life.',
    price: 89.99,
    category: 'Electronics',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80']
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Compact 75% mechanical keyboard with hot-swappable switches.',
    price: 119.0,
    category: 'Electronics',
    stock: 15,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80']
  },
  {
    name: 'Ceramic Coffee Mug',
    description: 'Matte-finish 350ml mug, dishwasher and microwave safe.',
    price: 14.5,
    category: 'Home',
    stock: 60,
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80']
  },
  {
    name: 'Canvas Tote Bag',
    description: 'Heavy-duty cotton canvas tote for groceries or everyday carry.',
    price: 22.0,
    category: 'Accessories',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80']
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated 750ml bottle, keeps drinks cold for 24 hours.',
    price: 27.99,
    category: 'Home',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80']
  },
  {
    name: 'Notebook Set (3-pack)',
    description: 'Dot-grid notebooks, 120 pages each, lay-flat binding.',
    price: 18.0,
    category: 'Office',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80']
  },
  {
    name: 'Desk Lamp',
    description: 'Adjustable LED desk lamp with 3 brightness levels and USB port.',
    price: 34.99,
    category: 'Home',
    stock: 20,
    images: ['https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=600&auto=format&fit=crop&q=80']
  },
  {
    name: 'Running Socks (3-pack)',
    description: 'Moisture-wicking athletic socks, cushioned sole.',
    price: 16.0,
    category: 'Apparel',
    stock: 45,
    images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&auto=format&fit=crop&q=80']
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable waterproof speaker with 12-hour playtime.',
    price: 49.99,
    category: 'Electronics',
    stock: 18,
    images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80']
  },
  {
    name: 'Yoga Mat',
    description: '6mm non-slip mat with carrying strap.',
    price: 29.0,
    category: 'Fitness',
    stock: 30,
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80']
  },
  {
    name: 'Leather Wallet',
    description: 'Slim bifold wallet, genuine leather, 6 card slots.',
    price: 39.0,
    category: 'Accessories',
    stock: 22,
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80']
  },
  {
    name: 'Ceramic Plant Pot',
    description: '15cm pot with drainage hole and saucer, matte white.',
    price: 19.5,
    category: 'Home',
    stock: 28,
    images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80']
  }
];

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
  await mongoose.connect(uri);
  console.log('Connected. Clearing existing products...');
  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log(`Seeded ${sampleProducts.length} products.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
