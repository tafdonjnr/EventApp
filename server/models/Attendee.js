const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const attendeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    phone: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    preferences: {
      categories: [String],
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
    },
    registeredEvents: [{
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
      registrationDate: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['registered', 'attended', 'cancelled'],
        default: 'registered',
      },
    }],

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
attendeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare plain password against stored hash
attendeeSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Attendee', attendeeSchema);