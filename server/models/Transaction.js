const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    providerTransactionId: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendee', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketCount: { type: Number, default: 1 },
    amount: { type: Number, required: true }, // in base currency unit (e.g. NGN)
    currency: { type: String, default: 'NGN' },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    paymentMethod: { type: String, default: 'paystack' },
    metadata: { type: Object },
    rawWebhookPayload: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);


