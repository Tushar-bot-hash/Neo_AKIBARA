const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Helper to generate tokens
const generateTokens = (id) => {
  // Uses REFRESH_SECRET to match your updated Render dashboard
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// @desc    Signup/Login Helper
const sendTokenResponse = async (user, statusCode, res) => {
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token to user's active sessions in DB
  user.refreshTokens.push(refreshToken);
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    // CRITICAL: Must be true and 'none' for Vercel -> Render communication
    secure: true, 
    sameSite: 'none', 
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.status(statusCode).cookie('refreshToken', refreshToken, cookieOptions).json({
    success: true,
    accessToken,
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

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.status(401).json({ message: "No refresh token" });
  
  const oldRefreshToken = cookies.refreshToken;
  const foundUser = await User.findOne({ refreshTokens: oldRefreshToken });

  // REUSE DETECTION
  if (!foundUser) {
    jwt.verify(oldRefreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
      if (err) return; 
      await User.findByIdAndUpdate(decoded.id, { refreshTokens: [] });
    });
    return res.status(403).json({ message: "Security risk: session hijacked." });
  }

  // VALID REFRESH
  const newTokens = generateTokens(foundUser._id);
  foundUser.refreshTokens = foundUser.refreshTokens.filter(rt => rt !== oldRefreshToken);
  foundUser.refreshTokens.push(newTokens.refreshToken);
  await foundUser.save();

  res.cookie('refreshToken', newTokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }).json({ accessToken: newTokens.accessToken });
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
  res.status(200).json({ success: true, message: 'Logged out' });
};