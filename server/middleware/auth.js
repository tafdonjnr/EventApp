// middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);

  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  console.log('Extracted token:', token);

  if (!token) return res.status(401).json({ message: 'Invalid token format' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('JWT verification error:', err);
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    console.log('Decoded token:', decoded);
    req.organizerId = decoded.id;
    next();
  });
};

module.exports = verifyToken;
