const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const adminMiddlewareModule = require('../middleware/adminMiddleware');

// Support both default export and named export (handler must be a function)
const verifyToken = typeof authMiddleware === 'function' ? authMiddleware : authMiddleware?.verifyToken;
const adminMiddleware = typeof adminMiddlewareModule === 'function' ? adminMiddlewareModule : adminMiddlewareModule?.default;

if (typeof verifyToken !== 'function') {
  throw new Error('admin routes: verifyToken middleware is not a function. Check middleware/auth.js exports.');
}
if (typeof adminMiddleware !== 'function') {
  throw new Error('admin routes: adminMiddleware is not a function. Check middleware/adminMiddleware.js exports.');
}

const Organizer = require('../models/Organizer');
const Attendee = require('../models/Attendee');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Transaction = require('../models/Transaction');

// Admin login (public) — only admins can log in here; organizers get 403
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const org = await Organizer.findOne({ email });
    if (!org) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await org.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (org.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const token = jwt.sign(
      { id: org._id, role: org.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      _id: org._id,
      name: org.name,
      email: org.email,
      role: org.role,
      token,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// All admin routes below: verifyToken → adminMiddleware → handler
router.get('/stats', verifyToken, adminMiddleware, async (req, res) => {
    try {
      const totalOrganizers = await Organizer.countDocuments();
      const totalAttendees = await Attendee.countDocuments();
      const totalEvents = await Event.countDocuments();
      const totalTransactions = await Transaction.countDocuments();
  
      // Revenue from successful transactions
      const revenueData = await Transaction.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
  
      const totalRevenue = revenueData[0]?.total || 0;
  
      const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
      const activeEvents = await Event.countDocuments({ status: 'active' });
  
      res.json({
        totalUsers: totalOrganizers + totalAttendees,
        totalEvents,
        totalTransactions,
        totalRevenue,
        pendingTransactions,
        activeEvents
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });

// Get All Users
router.get('/users', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const organizers = await Organizer.find().select('-password').lean();
    const attendees = await Attendee.find().select('-password').lean();
    const users = [
      ...organizers.map((o) => ({ ...o, role: o.role || 'organizer', type: 'organizer' })),
      ...attendees.map((a) => ({ ...a, role: 'attendee', type: 'attendee' })),
    ];
    const total = users.length;
    res.json({ organizers, attendees, users, totalPages: 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Recent transactions (for dashboard)
router.get('/transactions/recent', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const recent = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('eventId', 'title')
      .populate('userId', 'name email');
    res.json(recent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Recent events (for dashboard)
router.get('/events/recent', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const recent = await Event.find().sort({ createdAt: -1 }).limit(10).select('title date status');
    res.json(recent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Paginated admin events (for admin Events page)
router.get('/events', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const status = req.query.status || 'all';
    const search = (req.query.search || '').trim();
    const skip = (page - 1) * limit;

    const filter = {};
    if (status !== 'all') filter.status = status;
    if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];

    const [events, total] = await Promise.all([
      Event.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Event.countDocuments(filter)
    ]);
    res.json({ events, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Paginated admin transactions (for admin Transactions page)
router.get('/transactions', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const status = req.query.status || 'all';
    const skip = (page - 1) * limit;

    const filter = status === 'all' ? {} : { status };
    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('eventId', 'title').populate('userId', 'name email').lean(),
      Transaction.countDocuments(filter)
    ]);
    const revenueData = await Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;
    res.json({ transactions, totalPages: Math.ceil(total / limit), totalRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
