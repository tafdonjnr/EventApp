const express = require('express');
const router = express.Router();
const Attendee = require('../models/Attendee');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');

// POST /api/attendees/register
// Creates account and returns token immediately
// OTP flow is built (utils/mailer.js, routes/auth.js) but disabled for pilot
// To re-enable: call attachOTP(attendee) + sendOTP() here and return { message, email } instead
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingAttendee = await Attendee.findOne({ email });
    if (existingAttendee) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const attendee = new Attendee({ name, email, password, phone });
    await attendee.save();

    const token = jwt.sign(
      { id: attendee._id, role: 'attendee' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      attendee: {
        id: attendee._id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
      },
    });
  } catch (error) {
    console.error('Attendee registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/attendees/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const attendee = await Attendee.findOne({ email });
    if (!attendee) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await attendee.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: attendee._id, role: 'attendee' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      attendee: {
        id: attendee._id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
      },
    });
  } catch (error) {
    console.error('Attendee login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendees/profile (protected)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.attendeeId)
      .select('-password -otpCode -otpExpiresAt')
      .populate('registeredEvents.event');

    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }

    res.json(attendee);
  } catch (error) {
    console.error('Get attendee profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/attendees/profile (protected)
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, preferences } = req.body;

    const attendee = await Attendee.findById(req.attendeeId);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }

    if (name !== undefined) attendee.name = name;
    if (phone !== undefined) attendee.phone = phone;
    if (preferences !== undefined) {
      attendee.preferences = { ...attendee.preferences, ...preferences };
    }

    await attendee.save();

    res.json({
      message: 'Profile updated successfully',
      attendee: {
        id: attendee._id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        preferences: attendee.preferences,
      },
    });
  } catch (error) {
    console.error('Update attendee profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;