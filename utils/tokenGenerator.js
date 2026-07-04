const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '2d',
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
};

module.exports = generateToken;
