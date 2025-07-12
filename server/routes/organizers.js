const express = require('express');
const router = express.Router();
const Organizer = require('../models/Organizer');
const Event = require('../models/Event');
const verifyToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ Multer config
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
   GET /api/organizers/dashboard
============================ */
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.organizerId).select('name orgName email logo twitter instagram bio');
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
        bio: organizer.bio
      },
      events
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   PATCH /api/organizers/profile
   ✅ Updates fields and replaces old logo
============================ */
router.patch('/profile', verifyToken, upload.single('logo'), async (req, res) => {
  const { name, orgName, email, twitter, instagram } = req.body;

  try {
    const organizer = await Organizer.findById(req.organizerId);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });

    // Update fields
    if (name !== undefined) organizer.name = name;
    if (orgName !== undefined) organizer.orgName = orgName;
    if (email !== undefined) organizer.email = email;
    if (twitter !== undefined) organizer.twitter = twitter;
    if (instagram !== undefined) organizer.instagram = instagram;

    // ✅ Replace old logo
    if (req.file) {
      if (organizer.logo && organizer.logo.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', organizer.logo);
        fs.unlink(oldPath, (err) => {
          if (err) console.warn('⚠️ Failed to delete old logo:', err.message);
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
        bio: organizer.bio
      }
    });
  } catch (err) {
    console.error('🔥 Profile update error:', err);
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

    const token = jwt.sign({ id: organizer._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });
  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   🚫 DELETE THIS ROUTE — USELESS DUPLICATE
============================ */
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
