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
      maxlength: 300,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    logo: {
      type: String, // Cloudinary URL
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

    // OTP verification
    otpCode:      { type: String },
    otpExpiresAt: { type: Date },
    isVerified:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

organizerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

organizerSchema.methods.matchPassword = function (enteredPwd) {
  return bcrypt.compare(enteredPwd, this.password);
};

module.exports = mongoose.model('Organizer', organizerSchema);