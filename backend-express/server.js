const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// 1. SECURITY & LOGGING MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Adjusted for deployment: helmet can sometimes block images from external URLs
app.use(helmet({ contentSecurityPolicy: false }));

// UPDATED CORS: Added support for production Netlify URL
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'localhost',
      'netlify.app', // Allows any netlify preview or production site
      'render.com'
    ];

    const isAllowed = allowedOrigins.some(allowed => origin.includes(allowed));

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'Set-Cookie']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 2. DATA PARSERS
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. RATE LIMITING
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 10 minutes' }
});
app.use('/api/', limiter);

// 4. ROUTE MOUNTING
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payment', require('./routes/payment')); 
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api', (req, res) => res.json({ status: 'operational', version: '1.0.0' }));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'healthy' }));

// 5. ERROR HANDLING
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

// UPDATED PORT LOGIC: Added '0.0.0.0' for Render's network discovery
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NEURAL_LINK_ESTABLISHED on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});