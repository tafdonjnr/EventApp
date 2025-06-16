/**
 * Organizer model
 * ----------------
 * Represents an event organizer (planner) account.
 * Stores login credentials and basic profile info.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

/* -----------------------------  Schema  ----------------------------- */
const organizerSchema = new mongoose.Schema(
  {
    // Display name shown on public profile
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Login / contact e-mail (must be unique)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Hashed password (min length checked on creation)
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Short bio or description shown on organizer profile
    bio: {
      type: String,
      default: '',
    },

    // Optional profile/avatar image URL
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,          // adds createdAt & updatedAt
  }
);

/* --------------------  Password-hashing middleware  ------------------ */
/**
 * Before saving, hash the password IF it has been modified
 * (new doc or password change). Uses bcrypt with salt rounds = 10.
 */
organizerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();          // Skip if unchanged
  this.password = await bcrypt.hash(this.password, 10);     // Hash and replace
  next();
});

/* ---------------------  Instance method: compare pwd  ---------------- */
organizerSchema.methods.matchPassword = function (enteredPwd) {
  // Returns a boolean promise: true if passwords match
  return bcrypt.compare(enteredPwd, this.password);
};

/* -----------------------  Export the Mongoose model  ----------------- */
module.exports = mongoose.model('Organizer', organizerSchema);
