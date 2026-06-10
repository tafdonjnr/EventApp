/**
 * Organizer model
 * ----------------
 * Represents an event organizer (planner) account.
 * Stores login credentials and basic profile info.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const organizerSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['organizer', 'admin'],
      default: 'organizer',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    orgName: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bio: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    twitter: {
      type: String,
      default: '',
      trim: true,
    },
    instagram: {
      type: String,
      default: '',
      trim: true,
    },

    // OTP verification fields
    // otpCode stores a bcrypt hash of the 6-digit code — never store plain OTP
    // otpExpiresAt is checked on verify — codes expire after 10 minutes
    // isVerified gates token issuance — unverified accounts cannot log in
    otpCode:      { type: String },
    otpExpiresAt: { type: Date },
    isVerified:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
organizerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare plain password against stored hash
organizerSchema.methods.matchPassword = function (enteredPwd) {
  return bcrypt.compare(enteredPwd, this.password);
};

module.exports = mongoose.model('Organizer', organizerSchema);