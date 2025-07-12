const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    date: {
      type: Date,
      required: true,
    },
    venue: String,
    price: Number,
    ticketsAvailable: Number,
    category: {
      type: String,
      default: 'general',
    },
    banner: String,

    // CHANGE ↓  from String to ObjectId reference
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizer',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);


