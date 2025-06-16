const express = require('express');
const router = express.Router();
const Organizer = require('../models/Organizer');
const Event = require('../models/Event');
const verifyToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ Multer storage configuration for file uploads (e.g. logo)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique file names
  }
});

// ✅ Optional file filter to only allow image types
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  cb(null, allowed.includes(file.mimetype));
};

// ✅ Multer middleware setup
const upload = multer({ storage, fileFilter });

/* ============================
   GET /api/organizers/dashboard
   Return organizer profile and all events they created
============================ */
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.organizerId).select('name orgName email logo');

    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    const events = await Event.find({ organizer: req.organizerId });

    res.json({
      organizer: {
        orgName: organizer.orgName,
        logo: organizer.logo,
        name: organizer.name,
        email: organizer.email
      },
      events
    });
  } catch (error) {
    console.error('Dashboard route error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   PATCH /api/organizers/profile
   Update organizer profile info (name, orgName, bio)
   ✅ Now also supports file upload (logo)
============================ */
router.patch('/profile', verifyToken, upload.single('logo'), async (req, res) => {
  const { name, orgName, bio } = req.body;
  console.log('🛠️ PATCH /profile payload:', { name, orgName, bio });

  try {
    const organizer = await Organizer.findById(req.organizerId);
    if (!organizer) {
      console.log('❌ Organizer not found with ID:', req.organizerId);
      return res.status(404).json({ message: 'Organizer not found' });
    }

    // Update text fields if provided
    if (name) organizer.name = name;
    if (orgName) organizer.orgName = orgName;
    if (bio) organizer.bio = bio;

    // ✅ Update logo if file uploaded
    if (req.file) {
      organizer.logo = `/uploads/${req.file.filename}`;
    }

    await organizer.save();

    console.log('✅ Organizer updated successfully:', organizer);
    res.json({ message: 'Profile updated', organizer });
  } catch (err) {
    console.error('🔥 Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   POST /api/organizers/login
   Authenticate organizer and return JWT token
============================ */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Login attempt with email:', email);

  try {
    const organizer = await Organizer.findOne({ email });
    if (!organizer) {
      console.log('❌ Organizer not found for email:', email);
      return res.status(404).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, organizer.password);
    if (!isMatch) {
      console.log('❌ Password mismatch for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: organizer._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });
  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
