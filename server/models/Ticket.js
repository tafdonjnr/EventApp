const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true, // already indexed via unique
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  attendeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendee',
    required: true,
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
  },
  qrCodePath: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled'],
    default: 'active',
  },
  usedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// attendeeId — most common query: fetch all tickets for a given attendee
// GET /api/tickets/my-tickets filters by attendeeId
ticketSchema.index({ attendeeId: 1 });

// transactionId — used in webhook/verify to check if tickets already exist
// also used in cancel endpoint to bulk-cancel tickets per transaction
ticketSchema.index({ transactionId: 1 });

// eventId + status compound — used in organizer scanner and cancel flow
// e.g. find all active tickets for an event
ticketSchema.index({ eventId: 1, status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);