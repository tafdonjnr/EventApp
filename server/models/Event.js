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

    // Original ticket capacity — set once at creation, never mutated
    // Used to calculate sell-through rate: ticketsSold / totalCapacity
    totalCapacity: {
      type: Number,
      default: 0,
    },

    // Live inventory counter — decrements on each successful purchase
    ticketsAvailable: Number,

    // Running count of tickets sold — increments on each successful webhook
    // Kept separate from totalCapacity so both are always queryable independently
    ticketsSold: {
      type: Number,
      default: 0,
    },

    category: {
      type: String,
      default: 'general',
    },
    banner: String,

    // ObjectId reference to the organizer who created this event
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizer',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);