const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
// Import your new helper functions
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenGenerator');

// @desc    Signup/Login Helper
const sendTokenResponse = async (user, statusCode, res) => {
  // Use your new specific generator functions
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to user's active sessions in DB for reuse detection
  user.refreshTokens.push(refreshToken);
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: true,      // Required for sameSite: 'none'
    sameSite: 'none',  // Required for cross-domain (Vercel to Render)
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (matching your 7d secret expiry)
  };

  res.status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions) // Set the cookie
    .json({
      success: true,
      accessToken, // Sent to frontend Local Storage
      user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
      }
    });
};

// --- EXPORTS ---

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ success: false, error: 'Email exists' });

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

// @desc    Refresh Token Logic with Rotation
exports.refresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.status(401).json({ message: "No refresh token provided" });
  
  const oldRefreshToken = cookies.refreshToken;
  const foundUser = await User.findOne({ refreshTokens: oldRefreshToken });

  // REUSE DETECTION: If token is valid but user not found, clear all sessions (security risk)
  if (!foundUser) {
    jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return; 
      await User.findByIdAndUpdate(decoded.id, { refreshTokens: [] });
    });
    return res.status(403).json({ message: "Security alert: Refresh token reused or hijacked." });
  }

  // VALID REFRESH: Generate new pair
  const newAccessToken = generateAccessToken(foundUser._id);
  const newRefreshToken = generateRefreshToken(foundUser._id);

  // ROTATE: Remove old token, add new one
  foundUser.refreshTokens = foundUser.refreshTokens.filter(rt => rt !== oldRefreshToken);
  foundUser.refreshTokens.push(newRefreshToken);
  await foundUser.save();

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }).json({ accessToken: newAccessToken });
};

exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await User.findOneAndUpdate(
      { refreshTokens: refreshToken },
      { $pull: { refreshTokens: refreshToken } }
    );
  }
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.status(200).json({ success: true, message: 'Successfully logged out' });
};