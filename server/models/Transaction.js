const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true }, // already indexed via unique
    providerTransactionId: { type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendee',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    ticketCount: { type: Number, default: 1 },
    amount: { type: Number, required: true }, // in base currency unit (NGN)
    currency: { type: String, default: 'NGN' },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'paystack' },
    metadata: { type: Object },
    rawWebhookPayload: { type: Object },
  },
  { timestamps: true }
);

// eventId + status compound — most critical query
// analytics endpoint: Transaction.find({ eventId: { $in: eventIds }, status: 'success' })
// cancel endpoint: Transaction.find({ eventId: event._id, status: 'success' })
transactionSchema.index({ eventId: 1, status: 1 });

// userId — for any future attendee transaction history endpoint
transactionSchema.index({ userId: 1 });

// createdAt — used in analytics revenueOverTime date range filter
transactionSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
