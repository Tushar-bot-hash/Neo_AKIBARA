# NEO-AKIHABARA Backend - Express.js + MongoDB

A complete e-commerce backend built with Express.js and MongoDB for the NEO-AKIHABARA anime merchandise store.

## Features

- ✅ User Authentication (JWT)
- ✅ Product Management
- ✅ Shopping Cart
- ✅ Order Management
- ✅ Product Reviews
- ✅ Stripe Payment Integration
- ✅ Admin Panel Features
- ✅ Security Best Practices

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Stripe** - Payment processing
- **bcryptjs** - Password hashing

## Project Structure

```
backend-express/
├── config/
│   └── db.js                 # Database connection
├── controllers/              # Route controllers
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── reviewController.js
│   ├── paymentController.js
│   └── adminController.js
├── middleware/               # Custom middleware
│   ├── auth.js              # Authentication & authorization
│   └── errorHandler.js      # Error handling
├── models/                   # Mongoose models
│   ├── User.js
│   ├── Product.js
│   ├── CartItem.js
│   ├── Order.js
│   ├── Review.js
│   └── PaymentTransaction.js
├── routes/                   # API routes
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   ├── reviews.js
│   ├── payment.js
│   └── admin.js
├── utils/                    # Utility functions
│   └── generateToken.js
├── .env.example             # Environment variables template
├── server.js                # Entry point
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Stripe account (for payments)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend-express
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your configuration:**
   ```env
   PORT=5000
   NODE_ENV=development

   # Your MongoDB connection string
   MONGO_URI=mongodb://localhost:27017/neo-akihabara
   # OR for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neo-akihabara

   JWT_SECRET=your-secure-secret-key-here
   JWT_EXPIRE=30d

   # Optional: For Stripe payments
   STRIPE_SECRET_KEY=sk_test_your_stripe_key

   CORS_ORIGIN=http://localhost:3000
   ```

5. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## MongoDB Setup Options

### Option 1: Local MongoDB

1. Install MongoDB on your machine
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/neo-akihabara`

### Option 2: MongoDB Atlas (Cloud)

1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add database user
4. Whitelist your IP address
5. Get connection string and update `.env`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (Protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user cart (Protected)
- `POST /api/cart` - Add item to cart (Protected)
- `PUT /api/cart/:id` - Update cart item (Protected)
- `DELETE /api/cart/:id` - Remove from cart (Protected)
- `DELETE /api/cart` - Clear cart (Protected)

### Orders
- `GET /api/orders` - Get user orders (Protected)
- `GET /api/orders/:id` - Get single order (Protected)
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Reviews
- `GET /api/reviews/:productId` - Get product reviews
- `POST /api/reviews` - Create review (Protected)

### Payment
- `POST /api/payment/checkout` - Create checkout session (Protected)
- `GET /api/payment/status/:sessionId` - Get payment status (Protected)
- `POST /api/payment/webhook/stripe` - Stripe webhook

### Admin
- `GET /api/admin/users` - Get all users (Admin)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in requests:

**Option 1: Authorization Header**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Option 2: Cookie (automatic)**
The token is also stored in an httpOnly cookie.

## Creating Admin User

After starting the server, you can manually update a user to admin role in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or create a script/endpoint for this (for development only).

## Testing the API

You can test the API using:
- **Postman** - Import the endpoints
- **Thunder Client** (VS Code extension)
- **curl** commands

Example test:
```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"123456"}'

# Get products
curl http://localhost:5000/api/products
```

## Stripe Payment Setup (Optional)

1. Create account at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard
3. Add `STRIPE_SECRET_KEY` to `.env`
4. Use test card: `4242 4242 4242 4242`

## Security Features

- Password hashing with bcrypt
- JWT authentication
- HTTP-only cookies
- CORS configuration
- Rate limiting
- Helmet security headers
- Input validation
- MongoDB injection prevention

## Error Handling

The API uses a centralized error handling middleware that returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## License

ISC
