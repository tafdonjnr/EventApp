const express = require('express');
const router = express.Router();
const Organizer = require('../models/Organizer');
const Event = require('../models/Event');
const Transaction = require('../models/Transaction');
const verifyToken = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadLogo } = require('../utils/cloudinary');

/* ============================
   GET /api/organizers/analytics
============================ */
router.get('/analytics', verifyToken, async (req, res) => {
  try {
    const organizerId = req.organizerId;
    const events = await Event.find({ organizer: organizerId }).lean();
    const eventIds = events.map((e) => e._id);

    const now = new Date();
    const upcomingEvents = events.filter((e) => new Date(e.date) > now);

    const transactions = await Transaction.find({
      eventId: { $in: eventIds },
      status: 'success',
    }).lean();

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const ticketsSold = transactions.reduce((sum, t) => sum + (t.ticketCount || 0), 0);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTx = transactions.filter(
      (t) => t.createdAt && new Date(t.createdAt) >= thirtyDaysAgo
    );
    const byDate = {};
    for (let d = 0; d <= 30; d++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + d);
      byDate[date.toISOString().split('T')[0]] = 0;
    }
    recentTx.forEach((t) => {
      const d = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : null;
      if (d && byDate.hasOwnProperty(d)) byDate[d] += t.amount || 0;
    });
    const revenueOverTime = Object.entries(byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({ date, amount }));

    const perEventStats = events.map((e) => ({
      _id: e._id,
      title: e.title,
      date: e.date,
      venue: e.venue,
      category: e.category,
      price: e.price || 0,
      totalCapacity: e.totalCapacity || 0,
      ticketsSold: e.ticketsSold || 0,
      ticketsRemaining: e.ticketsAvailable || 0,
      estimatedGross: (e.ticketsSold || 0) * (e.price || 0),
      sellThroughRate:
        e.totalCapacity > 0
          ? Math.round(((e.ticketsSold || 0) / e.totalCapacity) * 100)
          : null,
      isFree: !e.price || e.price === 0,
      isPast: new Date(e.date) <= now,
    }));

    res.json({
      totalEvents: events.length,
      ticketsSold,
      totalRevenue,
      upcomingEvents: upcomingEvents.length,
      revenueOverTime,
      perEventStats,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   GET /api/organizers/dashboard
============================ */
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.organizerId).select(
      'name orgName email logo twitter instagram bio website'
    );
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });

    const events = await Event.find({ organizer: req.organizerId });

    res.json({
      organizer: {
        name: organizer.name,
        orgName: organizer.orgName,
        email: organizer.email,
        logo: organizer.logo,
        twitter: organizer.twitter,
        instagram: organizer.instagram,
        bio: organizer.bio,
        website: organizer.website,
      },
      events,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   PATCH /api/organizers/profile
   Now uses Cloudinary — no local disk writes
============================ */
router.patch('/profile', verifyToken, uploadLogo.single('logo'), async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.organizerId);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });

    const { name, orgName, email, twitter, instagram, bio, website } = req.body;

    if (name !== undefined)      organizer.name = name.trim();
    if (orgName !== undefined)   organizer.orgName = orgName.trim();
    if (email !== undefined)     organizer.email = email.trim().toLowerCase();
    if (twitter !== undefined)   organizer.twitter = twitter.trim();
    if (instagram !== undefined) organizer.instagram = instagram.trim();
    if (bio !== undefined)       organizer.bio = bio.trim();
    if (website !== undefined)   organizer.website = website.trim();

    // Cloudinary URL is in req.file.path when upload succeeds
    if (req.file) {
      organizer.logo = req.file.path;
    }

    await organizer.save();

    res.json({
      message: 'Profile updated successfully',
      organizer: {
        name: organizer.name,
        orgName: organizer.orgName,
        email: organizer.email,
        logo: organizer.logo,
        twitter: organizer.twitter,
        instagram: organizer.instagram,
        bio: organizer.bio,
        website: organizer.website,
      },
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   POST /api/organizers/login
============================ */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const organizer = await Organizer.findOne({ email });
    if (!organizer) return res.status(404).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, organizer.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: organizer._id, role: 'organizer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      organizer: {
        id: organizer._id,
        name: organizer.name,
        orgName: organizer.orgName,
        email: organizer.email,
        logo: organizer.logo,
        role: 'organizer',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;