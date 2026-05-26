// AUTHENTICATING TRADER VIA JWT TOKEN

const jwt = require('jsonwebtoken');

exports.isAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization format' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.trader = decoded; // Decodes JWT token data
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};