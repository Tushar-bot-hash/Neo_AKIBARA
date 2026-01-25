# Quick Start Guide - NEO-AKIHABARA Backend

Get your backend up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd backend-express
npm install
```

## Step 2: Set Up MongoDB

### Option A: Use MongoDB Atlas (Cloud - Recommended)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy your connection string

### Option B: Use Local MongoDB

1. Install MongoDB on your computer
2. Start MongoDB service
3. Connection string will be: `mongodb://localhost:27017/neo-akihabara`

## Step 3: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` file:

```env
PORT=5000
NODE_ENV=development

# IMPORTANT: Replace with your MongoDB connection string
MONGO_URI=mongodb://localhost:27017/neo-akihabara
# Or for Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neo-akihabara

# Change this to a secure secret
JWT_SECRET=your-super-secret-key-change-this

# Optional: Add later for payments
# STRIPE_SECRET_KEY=sk_test_your_stripe_key

CORS_ORIGIN=http://localhost:3000
```

## Step 4: Seed the Database

Populate your database with sample products and an admin user:

```bash
npm run seed
```

This will create:
- 10 sample anime products
- Admin user: `admin@neo-akihabara.com` / `admin123`

## Step 5: Start the Server

```bash
# Development mode (auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:
```
MongoDB Connected: ...
Server running in development mode on port 5000
```

## Step 6: Test the API

Open your browser or Postman and try:

```
http://localhost:5000/api
```

You should see:
```json
{
  "message": "NEO-AKIHABARA API - Express.js Edition"
}
```

Try getting products:
```
http://localhost:5000/api/products
```

## Quick Test Commands

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neo-akihabara.com","password":"admin123"}'
```

### Get all products:
```bash
curl http://localhost:5000/api/products
```

## Common Issues

### Issue: Can't connect to MongoDB
- Make sure MongoDB is running (if local)
- Check your connection string in `.env`
- For Atlas: Whitelist your IP address in Atlas dashboard

### Issue: Port 5000 already in use
- Change `PORT=5001` in `.env` file

### Issue: JWT errors
- Make sure `JWT_SECRET` is set in `.env`

## Next Steps

1. **Connect your frontend** - Update frontend API URL to `http://localhost:5000`
2. **Set up Stripe** - Add `STRIPE_SECRET_KEY` for payments
3. **Customize products** - Modify `scripts/seedData.js`
4. **Deploy** - Ready for Heroku, Railway, or any Node.js hosting

## Admin Access

Default admin credentials:
- **Email:** admin@neo-akihabara.com
- **Password:** admin123

**Important:** Change this password in production!

## API Documentation

Full API documentation is available in `README.md`

## Need Help?

- Check the main `README.md` for detailed docs
- All routes are in the `routes/` folder
- Controllers contain the business logic
- Models define the database schemas

---

That's it! Your backend is ready to rock! 🚀
