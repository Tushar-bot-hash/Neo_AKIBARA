const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    console.log(`🔗 Connecting to MongoDB Atlas...`);
    console.log(`📡 URI: ${mongoURI.replace(/\/\/.*@/, '//***@')}`); // Hide password
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout for Atlas
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Create admin user
    await createAdminUser();
    
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Failed: ${error.message}`);
    console.log('💡 Atlas Troubleshooting:');
    console.log('1. Check if your IP is whitelisted in MongoDB Atlas');
    console.log('2. Verify username/password in connection string');
    console.log('3. Check network connectivity (no VPN blocking)');
    console.log('4. Try connecting with MongoDB Compass first');
    
    // Don't exit - let app run in development
    console.log('⚠️ Continuing without database connection...');
  }
};

async function createAdminUser() {
  try {
    const bcrypt = require('bcryptjs');
    
    // Define User schema if not exists
    const userSchema = new mongoose.Schema({
      email: { type: String, unique: true, required: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, default: 'user', enum: ['user', 'admin'] },
      createdAt: { type: Date, default: Date.now }
    });
    
    // Create model if not exists
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: "admin@neoakihabara.com" });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        email: "admin@neoakihabara.com",
        password: hashedPassword,
        name: "Cyber Admin",
        role: "admin"
      });
      
      console.log("👑 Admin user created: admin@neoakihabara.com / admin123");
    } else {
      console.log("👑 Admin user already exists");
      
      // Ensure admin role is set
      if (adminExists.role !== 'admin') {
        await User.updateOne(
          { email: "admin@neoakihabara.com" },
          { $set: { role: 'admin' } }
        );
        console.log("👑 Updated existing user to admin role");
      }
    }
  } catch (error) {
    console.log("⚠️ Could not create/admin user:", error.message);
  }
}

module.exports = connectDB;