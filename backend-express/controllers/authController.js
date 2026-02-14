const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Helper to generate tokens
const generateTokens = (id) => {
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.status(statusCode).cookie('refreshToken', refreshToken, cookieOptions).json({
    success: true,
    accessToken, // Sent in body so frontend can store in memory
    user: { id: user._id, name: user.name, role: user.role }
  });
};

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

// @desc    Refresh Token Logic (The Security Core)
exports.refresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(401);
  const oldRefreshToken = cookies.refreshToken;

  const foundUser = await User.findOne({ refreshTokens: oldRefreshToken });

  // REUSE DETECTION: Token is valid but NOT in our DB list?
  if (!foundUser) {
    jwt.verify(oldRefreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
      if (err) return; 
      // Compromised! Clear ALL tokens for this user
      await User.findByIdAndUpdate(decoded.id, { refreshTokens: [] });
    });
    return res.status(403).json({ message: "Security risk: session hijacked." });
  }

  // VALID REFRESH: Rotate tokens
  const newTokens = generateTokens(foundUser._id);
  foundUser.refreshTokens = foundUser.refreshTokens.filter(rt => rt !== oldRefreshToken);
  foundUser.refreshTokens.push(newTokens.refreshToken);
  await foundUser.save();

  res.cookie('refreshToken', newTokens.refreshToken, { /* same options as login */ });
  res.json({ accessToken: newTokens.accessToken });
};

exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await User.findOneAndUpdate(
      { refreshTokens: refreshToken },
      { $pull: { refreshTokens: refreshToken } }
    );
  }
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out' });
};