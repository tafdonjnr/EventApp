const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Attendee = require('../models/Attendee');
const Organizer = require('../models/Organizer');
const { sendOTP } = require('../utils/mailer');

// Helper — find user by email in both collections
async function findUserByEmail(email) {
  const attendee = await Attendee.findOne({ email });
  if (attendee) return { user: attendee, role: 'attendee' };
  const organizer = await Organizer.findOne({ email });
  if (organizer) return { user: organizer, role: organizer.role };
  return null;
}

// Helper — generate JWT
function genToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/verify-otp
// Verifies the 6-digit code and returns a token if valid
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const found = await findUserByEmail(email);
    if (!found) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const { user, role } = found;

    // Check expiry first
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP has expired — request a new one' });
    }

    // Compare submitted code against stored hash
    const isMatch = await bcrypt.compare(code, user.otpCode);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    // Clear OTP fields and mark verified
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    user.isVerified = true;
    await user.save();

    // Return token + user shape matching existing login responses
    const token = genToken(user._id, role);

    if (role === 'attendee') {
      return res.json({
        message: 'Email verified',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'attendee',
        },
      });
    } else {
      return res.json({
        message: 'Email verified',
        token,
        user: {
          id: user._id,
          name: user.name,
          orgName: user.orgName,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/resend-otp
// Generates a new code and resends — invalidates the previous one
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const found = await findUserByEmail(email);
    if (!found) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const { user } = found;

    // Generate new code — overwrites old one
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = await bcrypt.hash(code, 10);
    user.otpCode = hashed;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTP({ to: email, code, name: user.name });

    res.json({ message: 'New OTP sent' });
  } catch (err) {
    console.error('resend-otp error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;