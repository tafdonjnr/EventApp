const express = require('express');
const router = express.Router();
const Attendee = require('../models/Attendee');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verifyToken = require('../middleware/auth');
const { sendOTP } = require('../utils/mailer');

// Helper — generate and store a hashed OTP on a user document
async function attachOTP(user) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = await bcrypt.hash(code, 10);
  user.otpCode = hashed;
  user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();
  return code; // return plain code for sending in email
}

// POST /api/attendees/register
// Creates account, sends OTP — does NOT return token yet
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingAttendee = await Attendee.findOne({ email });
    if (existingAttendee) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const attendee = new Attendee({ name, email, password, phone });
    await attendee.save();

    // Generate OTP and send email
    const code = await attachOTP(attendee);
    await sendOTP({ to: email, code, name });

    res.status(201).json({
      message: 'OTP sent to your email',
      email,
    });
  } catch (error) {
    console.error('Attendee registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/attendees/login
// Login is direct — no OTP on login for pilot speed
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