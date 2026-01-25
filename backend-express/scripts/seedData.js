const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');

dotenv.config();

const seedProducts = [
  {
    name: "Asuka Langley EVA-02",
    description: "Premium action figure of Asuka Langley Soryu with EVA-02. Highly detailed with multiple accessories and articulation points.",
    price: 129.99,
    category: "figures",
    image_url: "https://images.unsplash.com/photo-1660292785457-ef25cffef35c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGFjdGlvbiUyMGZpZ3VyZSUyMHRveXxlbnwwfHx8fDE3NjkzNzAxNjF8MA&ixlib=rb-4.1.0&q=85",
    stock: 50
  },
  {
    name: "Akatsuki Cloud Figure",
    description: "Collectible figure featuring the iconic Akatsuki member. Perfect for Naruto fans and collectors.",
    price: 89.99,
    category: "figures",
    image_url: "https://images.unsplash.com/photo-1764730282820-f9cdd430b1c1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwzfHxhbmltZSUyMGFjdGlvbiUyMGZpZ3VyZSUyMHRveXxlbnwwfHx8fDE3NjkzNzAxNjF8MA&ixlib=rb-4.1.0&q=85",
    stock: 75
  },
  {
    name: "Cyber-Goth Hoodie",
    description: "Premium streetwear hoodie with cyberpunk aesthetic. Comfortable cotton blend with unique anime-inspired graphics.",
    price: 65.00,
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1708533644703-c43549dbdadd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwxfHxhbmltZSUyMHN0cmVldHdlYXIlMjBob29kaWUlMjBmYXNoaW9ufGVufDB8fHx8MTc2OTM3MDE2M3ww&ixlib=rb-4.1.0&q=85",
    stock: 100
  },
  {
    name: "Monkey King Streetwear",
    description: "Exclusive anime streetwear featuring the legendary Monkey King. Limited edition design.",
    price: 55.00,
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1708533643261-0dcdc1aef81f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwzfHxhbmltZSUyMHN0cmVldHdlYXIlMjBob29kaWUlMjBmYXNoaW9ufGVufDB8fHx8MTc2OTM3MDE2M3ww&ixlib=rb-4.1.0&q=85",
    stock: 80
  },
  {
    name: "Kimi No Na Wa Art",
    description: "Beautiful art print from Your Name. Museum-quality poster with vibrant colors.",
    price: 25.00,
    category: "posters",
    image_url: "https://images.unsplash.com/photo-1643560413634-edc1135c7e4b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxhbmltZSUyMHdhbGwlMjBwb3N0ZXIlMjBhcnR8ZW58MHx8fHwxNzY5MzcwMTc5fDA&ixlib=rb-4.1.0&q=85",
    stock: 200
  },
  {
    name: "Window to Tokyo",
    description: "Stunning anime-style Tokyo cityscape poster. Perfect for any otaku's room.",
    price: 22.00,
    category: "posters",
    image_url: "https://images.unsplash.com/photo-1767519865116-03378fec84b8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHw0fHxhbmltZSUyMHdhbGwlMjBwb3N0ZXIlMjBhcnR8ZW58MHx8fHwxNzY5MzcwMTc5fDA&ixlib=rb-4.1.0&q=85",
    stock: 150
  },
  {
    name: "Chibi Acrylic Charm",
    description: "Adorable chibi character acrylic charm keychain. Perfect accessory for your bag or keys.",
    price: 12.00,
    category: "accessories",
    image_url: "https://images.unsplash.com/photo-1741295054871-757d6ce128bb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHw0fHxhbmltZSUyMGtleWNoYWluJTIwYWNjZXNzb3J5fGVufDB8fHx8MTc2OTM3MDE4Mnww&ixlib=rb-4.1.0&q=85",
    stock: 300
  },
  {
    name: "Dragon Ball Z Scouter",
    description: "Replica scouter from Dragon Ball Z. Wearable collectible with LED display.",
    price: 45.00,
    category: "accessories",
    image_url: "https://images.unsplash.com/photo-1572291244855-44aa55da2137?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBhbmltZSUyMGNpdHklMjBuaWdodCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzY5MzcwMTY1fDA&ixlib=rb-4.1.0&q=85",
    stock: 60
  },
  {
    name: "Attack on Titan Survey Corps Jacket",
    description: "Official Survey Corps jacket replica. High-quality materials with embroidered patches.",
    price: 120.00,
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1533484306792-cf313c2b8ab0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwyfHxjeWJlcnB1bmslMjBhbmltZSUyMGNpdHklMjBuaWdodCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzY5MzcwMTY1fDA&ixlib=rb-4.1.0&q=85",
    stock: 40
  },
  {
    name: "Demon Slayer Nichirin Blade",
    description: "Collectible replica of Tanjiro's Nichirin Blade. Display stand included.",
    price: 85.00,
    category: "collectibles",
    image_url: "https://images.unsplash.com/photo-1572291244855-44aa55da2137?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBhbmltZSUyMGNpdHklMjBuaWdodCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzY5MzcwMTY1fDA&ixlib=rb-4.1.0&q=85",
    stock: 90
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected...');

    // Clear existing data
    await Product.deleteMany();
    console.log('Products cleared');

    // Insert products
    await Product.insertMany(seedProducts);
    console.log('Products seeded successfully');

    // Create admin user (optional)
    const adminExists = await User.findOne({ email: 'admin@neo-akihabara.com' });

    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@neo-akihabara.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created - Email: admin@neo-akihabara.com, Password: admin123');
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
