// authtest.js - Save this in backend folder
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function testAuth() {
  console.log("🔍 AUTH TEST STARTING...\n");
  
  try {
    // 1. Connect to DB
    console.log("1. 📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected\n");
    
    // 2. Load User model
    const User = require("./models/User");
    
    // 3. Check if admin exists
    console.log("2. 🔍 Checking for admin user...");
    const admin = await User.findOne({ email: "admin@neo-akihabara.com" }).select("+password");
    
    if (!admin) {
      console.log("❌ ADMIN NOT FOUND! Creating one...\n");
      
      // Create admin
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const newAdmin = await User.create({
        name: "Admin",
        email: "admin@neo-akihabara.com",
        password: hashedPassword,
        role: "admin"
      });
      
      console.log("✅ Admin created:");
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Password: admin123`);
      console.log(`   Role: ${newAdmin.role}\n`);
      
      await mongoose.connection.close();
      console.log("🚀 Now try logging in with: admin@neo-akihabara.com / admin123");
      return;
    }
    
    console.log("✅ Admin found:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created: ${admin.createdAt}\n`);
    
    // 4. Test password
    console.log('3. 🔑 Testing password "admin123"...');
    const isMatch = await bcrypt.compare("admin123", admin.password);
    
    if (isMatch) {
      console.log("✅ Password CORRECT!");
    } else {
      console.log("❌ Password WRONG! Resetting...\n");
      
      // Reset password
      const newHash = await bcrypt.hash("admin123", 10);
      admin.password = newHash;
      await admin.save();
      
      console.log("✅ Password reset to: admin123");
    }
    
    // 5. Test JWT token generation
    console.log("\n4. 🎫 Testing JWT token...");
    const jwt = require("jsonwebtoken");
    
    if (!process.env.JWT_SECRET) {
      console.log("❌ JWT_SECRET not set in .env");
    } else {
      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      console.log("✅ Token generated successfully");
      console.log(`   Token starts with: ${token.substring(0, 50)}...`);
    }
    
    console.log("\n🎉 AUTH TEST COMPLETE!");
    console.log("\n📋 Login credentials:");
    console.log("   Email: admin@neo-akihabara.com");
    console.log("   Password: admin123");
    console.log("\n🚀 Next steps:");
    console.log("   1. Start backend: npm run dev");
    console.log("   2. Login at: http://localhost:5173/login");
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error("❌ TEST FAILED:", error.message);
    
    if (error.name === "MongoServerSelectionError") {
      console.log("\n💡 MongoDB not running. Start it with:");
      console.log("   Windows: Open Command Prompt as Administrator and run:");
      console.log("   net start MongoDB");
      console.log("   Or run: mongod");
    }
    
    process.exit(1);
  }
}

testAuth();
