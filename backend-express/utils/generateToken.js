const jwt = require('jsonwebtoken');

/**
 * Generate Access Token (Short-lived)
 * This goes in the JSON response and is used for every request.
 */
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m' // 15 minutes - Short window of risk if stolen
  });
};

/**
 * Generate Refresh Token (Long-lived)
 * This goes in the HttpOnly cookie and is stored in MongoDB.
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d' // 7 days - Keeps the user logged in
  });
};

module.exports = { generateAccessToken, generateRefreshToken };