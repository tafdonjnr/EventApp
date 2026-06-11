const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Organizer = require('../models/Organizer');

// Generate JWT token
const genToken = (id, role = 'organizer') =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/organizers/register
// Creates account and returns token immediately
// OTP flow is built (utils/mailer.js, routes/auth.js) but disabled for pilot
// To re-enable: call attachOTP(org) + sendOTP() here and return { message, email } instead
exports.register = async (req, res) => {
  console.log('REGISTER CONTROLLER HIT');
  const { name, email, password, bio, orgName, adminKey } = req.body;

  try {
    const exists = await Organizer.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already used' });
    }

    // Only elevate to admin if correct adminKey provided
    let role = 'organizer';
    if (
      adminKey &&
      process.env.ADMIN_SECRET_KEY &&
      adminKey === process.env.ADMIN_SECRET_KEY
    ) {
      role = 'admin';
    }

    const org = await Organizer.create({ name, email, password, bio, orgName, role });

    res.status(201).json({
      message: 'Account created successfully',
      token: genToken(org._id, org.role),
      organizer: {
        id: org._id,
        name: org.name,
        orgName: org.orgName,
        email: org.email,
        logo: org.logo,
        role: org.role,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/organizers/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const org = await Organizer.findOne({ email });
    if (!org) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await org.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      token: genToken(org._id, org.role),
      organizer: {
        id: org._id,
        name: org.name,
        orgName: org.orgName,
        email: org.email,
        logo: org.logo,
        role: org.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/organizers/profile
exports.updateProfile = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.organizerId);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });

    organizer.name = req.body.name || organizer.name;
    organizer.orgName = req.body.orgName || organizer.orgName;
    organizer.bio = req.body.bio || organizer.bio;
    organizer.twitter = req.body.twitter || organizer.twitter;
    organizer.instagram = req.body.instagram || organizer.instagram;

    if (req.file) {
      organizer.logo = `/uploads/${req.file.filename}`;
    }

    const updated = await organizer.save();
    res.status(200).json({ updatedOrganizer: updated });
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};