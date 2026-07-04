const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    if (req.accepts('html')) {
      return res.redirect('/login.html');
    }
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'توکن منقضی شده',
      expired: true,
    });
  }
}

module.exports = authenticate;
