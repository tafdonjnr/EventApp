// middleware/auth.js
const jwt = require('jsonwebtoken');
const Organizer = require('../models/Organizer');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.userRole = decoded.role;

    if (decoded.role === 'organizer' || decoded.role === 'admin') {
      req.organizerId = decoded.id;
      const organizer = await Organizer.findById(decoded.id).select('-password');
      if (organizer) {
        req.user = { id: organizer._id, name: organizer.name, email: organizer.email, role: organizer.role };
      }
    } else if (decoded.role === 'attendee') {
      req.attendeeId = decoded.id;
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = verifyToken;
