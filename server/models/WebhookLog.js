const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema(
  {
    provider: { type: String, default: 'paystack' },
    headers: { type: Object },
    rawBody: { type: String },
    signature: { type: String },
    validSignature: { type: Boolean },
    reference: { type: String },
    eventType: { type: String },
    handled: { type: Boolean, default: false },
    error: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebhookLog', webhookLogSchema);


