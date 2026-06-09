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

    // Event lifecycle status
    // draft     → created but not yet published (future use)
    // live      → active, tickets on sale (default)
    // cancelled → organizer cancelled, refunds triggered
    // completed → event has passed (future use for payout cooldown)
    status: {
      type: String,
      enum: ['draft', 'live', 'cancelled', 'completed'],
      default: 'live',
    },

    // Set when organizer cancels — used for audit trail and attendee messaging
    cancelledAt: {
      type: Date,
    },

    // ObjectId reference to the organizer who created this event
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizer',
      required: true,
    },
  },
  { timestamps: true }
);

// organizer — most common query: fetch all events for a given organizer
// dashboard, analytics, and events list all filter by organizer
eventSchema.index({ organizer: 1 });

// date + status compound — public event listing filters by date and status
// GET /api/events: { date: { $gte: now }, status: { $ne: 'cancelled' } }
eventSchema.index({ date: 1, status: 1 });

// category — attendee home screen filters by category
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);