const jwt = require('jsonwebtoken');
const Organizer = require('../models/Organizer');

// Generate JWT token
const genToken = (id) =>
  jwt.sign({ id, role: 'organizer' }, process.env.JWT_SECRET, { expiresIn: '7d' });

// REGISTER controller
exports.register = async (req, res) => {
  console.log("REGISTER CONTROLLER HIT");
  const { name, email, password, bio, orgName } = req.body;

  try {
    const exists = await Organizer.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already used' });
    }

    const org = await Organizer.create({ name, email, password, bio, orgName });

    res.status(201).json({
      _id: org._id,
      name: org.name,
      email: org.email,
      orgName: org.orgName,
      token: genToken(org._id),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
};

// LOGIN controller
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
      _id: org._id,
      name: org.name,
      email: org.email,
      token: genToken(org._id),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE PROFILE controller
exports.updateProfile = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.organizerId); // from verifyToken
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

