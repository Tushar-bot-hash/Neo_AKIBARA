const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // 1. Extract Token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }

  try {
    // 2. Verify Cryptographic Validity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Database Check (The Security Upgrade)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    // 4. Session Validity Check
    // If you nuked refreshTokens in the Controller, this effectively logs them out.
    if (user.refreshTokens.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired or revoked. Please login again.' 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token is invalid or expired' });
  }
};

// Grant access to specific roles (unchanged, but still solid!)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized`
      });
    }
    next();
  };
};