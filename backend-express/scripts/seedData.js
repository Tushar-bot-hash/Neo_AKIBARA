const mongoose = require('mongoose');
require('dotenv').config();

// Pathing - assuming this file is in /scripts
const User = require('../models/User');
const Product = require('../models/Product');

const seedProducts = [
  {
    name: "Asuka Langley EVA-02",
    description: "Premium action figure of Asuka Langley Soryu with EVA-02. Highly detailed with multiple accessories and articulation points.",
    price: 129.99,
    category: "figures",
    image_url: "https://images.unsplash.com/photo-1660292785457-ef25cffef35c",
    stock: 50,
    featured: true,
    discount: 10,
    tags: ["evangelion", "figure", "anime"]
  },
  {
    name: "Akatsuki Cloud Figure",
    description: "Collectible figure featuring the iconic Akatsuki member. Perfect for Naruto fans and collectors.",
    price: 89.99,
    category: "figures",
    image_url: "https://images.unsplash.com/photo-1764730282820-f9cdd430b1c1",
    stock: 75,
    featured: false,
    discount: 5,
    tags: ["naruto", "akatsuki", "figure"]
  },
  {
    name: "Cyber-Goth Hoodie",
    description: "Premium streetwear hoodie with cyberpunk aesthetic. Comfortable cotton blend with unique anime-inspired graphics.",
    price: 65.00,
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1708533644703-c43549dbdadd",
    stock: 100,
    featured: true,
    discount: 15,
    tags: ["hoodie", "cyberpunk", "clothing"]
  },
  {
    name: "Monkey King Streetwear",
    description: "Exclusive anime streetwear featuring the legendary Monkey King. Limited edition design.",
    price: 55.00,
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1708533643261-0dcdc1aef81f",
    stock: 80,
    featured: false,
    discount: 0,
    tags: ["streetwear", "monkey king", "clothing"]
  },
  {
    name: "Kimi No Na Wa Art",
    description: "Beautiful art print from Your Name. Museum-quality poster with vibrant colors.",
    price: 25.00,
    category: "posters",
    image_url: "https://images.unsplash.com/photo-1643560413634-edc1135c7e4b",
    stock: 200,
    featured: true,
    discount: 0,
    tags: ["poster", "your name", "art"]
  },
  {
    name: "Window to Tokyo",
    description: "Stunning anime-style Tokyo cityscape poster. Perfect for any otaku's room.",
    price: 22.00,
    category: "posters",
    image_url: "https://images.unsplash.com/photo-1767519865116-03378fec84b8",
    stock: 150,
    featured: false,
    discount: 10,
    tags: ["tokyo", "poster", "cityscape"]
  },
  {
    name: "Chibi Acrylic Charm",
    description: "Adorable chibi character acrylic charm keychain. Perfect accessory for your bag or keys.",
    price: 12.00,
    category: "accessories",
    image_url: "https://images.unsplash.com/photo-1741295054871-757d6ce128bb",
    stock: 300,
    featured: false,
    discount: 5,
    tags: ["charm", "keychain", "accessory"]
  },
  {
    name: "Dragon Ball Z Scouter",
    description: "Replica scouter from Dragon Ball Z. Wearable collectible with LED display.",
    price: 45.00,
    category: "accessories",
    image_url: "https://images.unsplash.com/photo-1572291244855-44aa55da2137",
    stock: 60,
    featured: true,
    discount: 20,
    tags: ["dragon ball", "scouter", "collectible"]
  },
  {
    name: "Attack on Titan Survey Corps Jacket",
    description: "Official Survey Corps jacket replica. High-quality materials with embroidered patches.",
    price: 120.00,
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1533484306792-cf313c2b8ab0",
    stock: 40,
    featured: true,
    discount: 25,
    tags: ["attack on titan", "jacket", "cosplay"]
  },
  {
    name: "Demon Slayer Nichirin Blade",
    description: "Collectible replica of Tanjiro's Nichirin Blade. Display stand included.",
    price: 85.00,
    category: "collectibles",
    image_url: "https://images.unsplash.com/photo-1572291244855-44aa55da2137",
    stock: 90,
    featured: true,
    discount: 15,
    tags: ["demon slayer", "sword", "replica"]
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/animehub';
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected Successfully');

    console.log('🧹 Clearing existing data...');
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Data cleared');

    // FIX: DO NOT HASH HERE. The User model hashes the password on save.
    console.log('👑 Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@neo-akihabara.com',
      password: 'admin123', // Send plain text
      role: 'admin'
    });
    console.log(`✅ Admin user created: ${adminUser.email} / admin123`);

    console.log('👤 Creating regular user...');
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@animehub.com',
      password: 'user123', // Send plain text
      role: 'user'
    });
    console.log(`✅ Regular user created: ${regularUser.email} / user123`);

    console.log('📦 Creating products...');
    await Product.insertMany(seedProducts);
    console.log(`✅ Created products successfully`);

    console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('====================================');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('Admin: admin@neo-akihabara.com / admin123');
    console.log('User: user@animehub.com / user123');

    setTimeout(() => {
      console.log('\n✨ Seed complete. Exiting...');
      mongoose.connection.close();
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error('❌ ERROR SEEDING DATABASE:', error.message);
    process.exit(1);
  }
};

seedDatabase();