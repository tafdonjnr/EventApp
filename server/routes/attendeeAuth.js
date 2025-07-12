const express = require('express');
const router = express.Router();
const Attendee = require('../models/Attendee');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');

// Register new attendee
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if attendee already exists
    const existingAttendee = await Attendee.findOne({ email });
    if (existingAttendee) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new attendee
    const attendee = new Attendee({
      name,
      email,
      password,
      phone,
    });

    await attendee.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: attendee._id, role: 'attendee' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Attendee registered successfully',
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

// Login attendee
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find attendee by email
    const attendee = await Attendee.findOne({ email });
    if (!attendee) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await attendee.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
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

// Get attendee profile (protected)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.attendeeId)
      .select('-password')
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

// Update attendee profile (protected)
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, preferences } = req.body;

    const attendee = await Attendee.findById(req.attendeeId);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }

    // Update fields
    if (name !== undefined) attendee.name = name;
    if (phone !== undefined) attendee.phone = phone;
    if (preferences !== undefined) attendee.preferences = { ...attendee.preferences, ...preferences };

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