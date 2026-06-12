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

    // Extended profile fields
    username: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // allows multiple null values without unique conflict
      unique: true,
    },
    avatar: {
      type: String, // Cloudinary URL
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 200,
    },
    dob: {
      type: Date, // stored as full date, age derived on read
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'prefer-not-to-say', ''],
      default: '',
    },
    showAttendance: {
      type: Boolean,
      default: true, // whether other users can see what events they're attending
    },
    location: {
      city: { type: String, default: 'Abuja' },
      area: { type: String, default: '' }, // e.g. "Wuse", "Maitama"
    },

    profilePicture: {
      type: String, // legacy field — superseded by avatar
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

    // Social graph — populated in social system session
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendee' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendee' }],

    // OTP verification
    otpCode:      { type: String },
    otpExpiresAt: { type: Date },
    isVerified:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

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

attendeeSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Attendee', attendeeSchema);