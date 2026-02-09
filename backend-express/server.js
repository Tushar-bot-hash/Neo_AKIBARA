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

/**
 * 🚀 PROXY CONFIGURATION (Crucial for Render/Netlify)
 * Tells Express to trust the 'X-Forwarded-For' header sent by Render's proxy.
 * This fixes the ERR_ERL_UNEXPECTED_X_FORWARDED_FOR error.
 */
app.set('trust proxy', 1); 

// 1. SECURITY & LOGGING MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Helmet config: Allow images from your MongoDB/external sources to load in the browser
app.use(helmet({ 
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" } 
}));

// --- UPDATED CORS LOGIC ---
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5000',
  'https://neoakibara.netlify.app/', // Replace with your ACTUAL Netlify URL
  process.env.FRONTEND_URL
].filter(Boolean); // Removes undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('netlify.app') ||
                      origin.includes('onrender.com');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 2. DATA PARSERS
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. RATE LIMITING
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
  // Optional: removes the validation check that caused the crash
  validate: { xForwardedForHeader: false } 
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

// Health checks
app.get('/api', (req, res) => res.json({ status: 'operational', version: '1.0.0' }));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'healthy' }));

// 5. ERROR HANDLING
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 NEURAL_LINK_ESTABLISHED on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});