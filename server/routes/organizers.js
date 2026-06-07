const express = require('express');
const router = express.Router();
const Organizer = require('../models/Organizer');
const Event = require('../models/Event');
const Transaction = require('../models/Transaction');
const verifyToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  cb(null, allowed.includes(file.mimetype));
};
const upload = multer({ storage, fileFilter });

/* ============================
   GET /api/organizers/analytics
   Returns platform-wide stats for the authenticated organizer plus
   a perEventStats array with per-event sold/remaining/revenue breakdown
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

    // Revenue over time — last 30 days, one entry per day
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

    // Per-event breakdown — uses ticketsSold field added to Event model
    // ticketsSold is incremented by the webhook/verify handlers on each successful payment
    // totalCapacity is set at event creation and never mutated
    // estimatedGross = ticketsSold * price (accurate for single-tier events)
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
      // Sell-through rate per event: 0 if totalCapacity not set (pre-migration events)
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
      // New field — per-event breakdown for earnings screen
      perEventStats,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   GET /api/organizers/dashboard
   Returns organizer profile + events list
   Events now include ticketsSold and totalCapacity fields
============================ */
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.organizerId).select(
      'name orgName email logo twitter instagram bio'
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
      },
      // Events now include ticketsSold and totalCapacity from updated Event model
      events,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   PATCH /api/organizers/profile
   Updates profile fields and replaces old logo file
============================ */
router.patch('/profile', verifyToken, upload.single('logo'), async (req, res) => {
  const { name, orgName, email, twitter, instagram } = req.body;

  try {
    const organizer = await Organizer.findById(req.organizerId);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });

    if (name !== undefined) organizer.name = name;
    if (orgName !== undefined) organizer.orgName = orgName;
    if (email !== undefined) organizer.email = email;
    if (twitter !== undefined) organizer.twitter = twitter;
    if (instagram !== undefined) organizer.instagram = instagram;

    // Replace old logo file on disk if a new one is uploaded
    if (req.file) {
      if (organizer.logo && organizer.logo.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', organizer.logo);
        fs.unlink(oldPath, (err) => {
          if (err) console.warn('Failed to delete old logo:', err.message);
        });
      }
      organizer.logo = `/uploads/${req.file.filename}`;
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

// REMOVE this — it doesn't update anything
// router.post('/profile', upload.single('logo'), async (req, res) => {
//   try {
//     console.log("Received profile update");
//     console.log("Body:", req.body);
//     console.log("File:", req.file);
//   } catch (error) {
//     console.error("Error saving profile:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

module.exports = router;