const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const axios = require('axios');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

const verifyToken = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Event = require('../models/Event');
const Attendee = require('../models/Attendee');
const WebhookLog = require('../models/WebhookLog');
const Ticket = require('../models/Ticket');

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Helper to naira->kobo
function toMinorUnit(amount) {
  return Math.round(Number(amount) * 100);
}

// Generate unique ticket ID
function generateTicketId() {
  return `TKT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// Generate QR code and upload to Cloudinary
async function generateAndSaveQRCode(ticketData, ticketId) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(ticketData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
    });

    const cloudinary = require('cloudinary').v2;
    const uploadRes = await cloudinary.uploader.upload(qrCodeDataURL, {
      folder: 'verse/qrcodes',
      public_id: ticketId,
      overwrite: true,
    });

    console.log(`QR code uploaded to Cloudinary: ${uploadRes.secure_url}`);
    return uploadRes.secure_url;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Send ticket email — COMMENTED OUT FOR DEV
// async function sendTicketEmail(attendeeEmail, eventTitle, ticketId, qrCodePath) {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });
//     const qrCodeFullPath = path.join(__dirname, 'tickets', qrCodePath);
//     await transporter.sendMail({
//       from: `"EventApp" <${process.env.EMAIL_USER}>`,
//       to: attendeeEmail,
//       subject: `Your Ticket for ${eventTitle}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #333;">🎫 Your Event Ticket</h2>
//           <p>Thank you for your purchase! Your ticket has been successfully generated.</p>
//           <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
//             <h3 style="margin-top: 0; color: #495057;">Event Details</h3>
//             <p><strong>Event:</strong> ${eventTitle}</p>
//             <p><strong>Ticket ID:</strong> ${ticketId}</p>
//             <p><strong>Purchase Date:</strong> ${new Date().toLocaleDateString()}</p>
//           </div>
//           <p>Please present this QR code at the event entrance. Keep it safe!</p>
//           <div style="text-align: center; margin: 30px 0;">
//             <img src="cid:qr-code" alt="QR Code" style="max-width: 200px; border: 2px solid #ddd; border-radius: 8px;" />
//           </div>
//           <p style="color: #6c757d; font-size: 14px;">
//             If you have any questions, please contact the event organizer.
//           </p>
//         </div>
//       `,
//       attachments: [
//         {
//           filename: `ticket-${ticketId}.png`,
//           path: qrCodeFullPath,
//           cid: 'qr-code'
//         }
//       ]
//     });
//     console.log(`Ticket email sent successfully to ${attendeeEmail}`);
//     return true;
//   } catch (error) {
//     console.error('Error sending ticket email:', error);
//     throw new Error('Failed to send ticket email');
//   }
// }


// POST /api/payments/initiate
// Requires auth; body: { eventId, ticketCount }
router.post('/initiate', verifyToken, async (req, res) => {
  try {
    const { eventId, ticketCount = 1 } = req.body;
    const attendeeId = req.attendeeId || req.userId;

    if (!attendeeId) {
      return res.status(403).json({ message: 'Only attendees can initiate payments' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.ticketsAvailable < ticketCount) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    const amount = Number(event.price) * Number(ticketCount);

    // Try to fetch attendee email for Paystack
    let email = 'noemail@example.com';
    try {
      const attendee = await Attendee.findById(attendeeId).select('email');
      if (attendee && attendee.email) email = attendee.email;
    } catch (_) {}

    // Create pending transaction in DB first
    const reference = `evt_${eventId}_${attendeeId}_${Date.now()}`;
    const txn = await Transaction.create({
      reference,
      userId: attendeeId,
      eventId: eventId,
      ticketCount,
      amount,
      currency: 'NGN',
      status: 'pending',
      paymentMethod: 'paystack',
      metadata: { eventTitle: event.title },
    });

    // Initialize Paystack transaction
    const initRes = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: toMinorUnit(amount),
        reference,
        currency: 'NGN',
        metadata: {
          eventId,
          userId: attendeeId,
          ticketCount,
        },
        callback_url: `${process.env.CLIENT_BASE_URL || ''}/ticket/success?ref=${reference}`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.json({
      authorizationUrl: initRes.data?.data?.authorization_url,
      reference,
    });
  } catch (err) {
    console.error('Payment initiate error:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Failed to initiate payment' });
  }
});


// POST /api/payments/webhook
// Called by Paystack servers only — HMAC-SHA512 signature verified
// express.raw() middleware must be set for this route in index.js
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const secret = PAYSTACK_SECRET_KEY;
    if (!signature || !secret) return res.status(400).send('Bad Request');

    const hash = crypto
      .createHmac('sha512', secret)
      .update(req.rawBody)
      .digest('hex');

    const isValid = hash === signature;
    const parsed = JSON.parse(req.rawBody || '{}');
    const reference = parsed?.data?.reference;
    const eventType = parsed?.event;

    console.log('Webhook received:', { eventType, reference, isValid });

    await WebhookLog.create({
      headers: req.headers,
      rawBody: req.rawBody,
      signature,
      validSignature: isValid,
      reference,
      eventType,
    });

    if (!isValid) return res.status(401).send('Invalid signature');

    const event = parsed;
    const data = event?.data;

    if (!reference) return res.status(200).send('ok');

    const txn = await Transaction.findOne({ reference });
    if (!txn) return res.status(200).send('ok');

    // Verify with Paystack to confirm status
    const verifyRes = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    const status = verifyRes.data?.data?.status;
    const providerId = verifyRes.data?.data?.id;

    if (status === 'success') {
      // Idempotency: only run side-effects once
      const wasSuccessful = txn.status === 'success';
      txn.status = 'success';
      txn.providerTransactionId = providerId;
      txn.rawWebhookPayload = event;
      await txn.save();

      if (!wasSuccessful) {
        // Decrement available tickets AND increment ticketsSold atomically
        // ticketsSold tracks running sold count for per-event analytics
        await Event.findByIdAndUpdate(txn.eventId, {
          $inc: {
            ticketsAvailable: -txn.ticketCount,
            ticketsSold: txn.ticketCount,
          },
        });

        // Get event details for ticket creation
        const eventDoc = await Event.findById(txn.eventId);

        // Create one ticket per purchased ticket count
        console.log(`Creating ${txn.ticketCount} tickets for transaction ${txn._id}`);

        for (let i = 0; i < txn.ticketCount; i++) {
          try {
            const ticketId = generateTicketId();

            const ticketData = {
              eventId: txn.eventId,
              attendeeId: txn.userId,
              ticketId: ticketId,
              transactionId: txn._id,
            };

            const qrCodePath = await generateAndSaveQRCode(ticketData, ticketId);

            const savedTicket = await Ticket.create({
              ticketId: ticketId,
              eventId: txn.eventId,
              attendeeId: txn.userId,
              transactionId: txn._id,
              qrCodePath: qrCodePath,
            });

            console.log(`Ticket ${ticketId} created successfully`);
          } catch (ticketError) {
            console.error(`Error creating ticket ${i + 1}:`, ticketError);
            // Continue with remaining tickets even if one fails
          }
        }

        // Send ticket email — COMMENTED OUT FOR DEV
        // try {
        //   const attendee = await Attendee.findById(txn.userId).select('email');
        //   if (attendee && attendee.email) {
        //     const firstTicket = await Ticket.findOne({
        //       transactionId: txn._id
        //     }).sort({ createdAt: 1 });
        //     if (firstTicket) {
        //       await sendTicketEmail(
        //         attendee.email,
        //         eventDoc.title,
        //         firstTicket.ticketId,
        //         firstTicket.qrCodePath
        //       );
        //     }
        //   }
        // } catch (emailError) {
        //   console.error("Error sending ticket email:", emailError);
        // }

        // Add event to attendee's registered events if not already present
        try {
          const attendee = await Attendee.findById(txn.userId);
          if (attendee) {
            const already = attendee.registeredEvents.some(
              (r) => r.event.toString() === String(txn.eventId)
            );
            if (!already) {
              attendee.registeredEvents.push({
                event: txn.eventId,
                registrationDate: new Date(),
                status: 'registered',
              });
              await attendee.save();
            }
          }
        } catch (_) {}
      }
    } else if (status === 'failed' || status === 'abandoned') {
      txn.status = 'failed';
      txn.providerTransactionId = providerId;
      txn.rawWebhookPayload = event;
      await txn.save();
    }

    // Mark webhook log as handled
    await WebhookLog.updateMany({ reference }, { $set: { handled: true } });
    return res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook error:', err.response?.data || err.message);
    return res.status(200).send('ok');
  }
});


// GET /api/payments/verify/:reference
// Poll transaction status — queries both local DB and Paystack
// Also creates tickets if webhook was missed and payment succeeded
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    let txn = await Transaction.findOne({ reference });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });

    try {
      const verifyRes = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
      );
      const status = verifyRes.data?.data?.status;
      const providerId = verifyRes.data?.data?.id;

      if (status === 'success' && txn.status !== 'success') {
        txn.status = 'success';
        txn.providerTransactionId = providerId;
        await txn.save();

        // Check if tickets were already created by the webhook
        const existingTickets = await Ticket.find({ transactionId: txn._id });

        if (existingTickets.length === 0) {
          // Webhook was missed — handle side effects here as fallback
          // Decrement available tickets AND increment ticketsSold
          await Event.findByIdAndUpdate(txn.eventId, {
            $inc: {
              ticketsAvailable: -txn.ticketCount,
              ticketsSold: txn.ticketCount,
            },
          });

          // Create tickets
          for (let i = 0; i < txn.ticketCount; i++) {
            try {
              const ticketId = generateTicketId();
              const ticketData = {
                eventId: txn.eventId,
                attendeeId: txn.userId,
                ticketId,
                transactionId: txn._id,
              };

              const qrCodePath = await generateAndSaveQRCode(ticketData, ticketId);

              await Ticket.create({
                ticketId,
                eventId: txn.eventId,
                attendeeId: txn.userId,
                transactionId: txn._id,
                qrCodePath,
              });

              console.log(`Ticket ${ticketId} created via verify endpoint`);
            } catch (ticketError) {
              console.error(`Error creating ticket ${i + 1}:`, ticketError);
            }
          }

          // Add to attendee registered events
          try {
            const attendee = await Attendee.findById(txn.userId);
            if (attendee) {
              const already = attendee.registeredEvents.some(
                (r) => r.event.toString() === String(txn.eventId)
              );
              if (!already) {
                attendee.registeredEvents.push({
                  event: txn.eventId,
                  registrationDate: new Date(),
                  status: 'registered',
                });
                await attendee.save();
              }
            }
          } catch (_) {}
        }
      } else if (status && txn.status !== 'success') {
        txn.status = status === 'failed' ? 'failed' : txn.status;
        txn.providerTransactionId = providerId || txn.providerTransactionId;
        await txn.save();
      }
    } catch (err) {
      console.warn('On-demand verify failed:', err.response?.data || err.message);
    }

    txn = await Transaction.findOne({ reference });

    return res.json({
      status: txn.status,
      reference: txn.reference,
      eventId: txn.eventId,
      amount: txn.amount,
      ticketCount: txn.ticketCount,
      currency: txn.currency,
      method: txn.paymentMethod,
      createdAt: txn.createdAt,
      transactionId: txn._id,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Verification failed' });
  }
});


// POST /api/payments/manual-verify
// Diagnostic tool — resyncs transaction status from Paystack
// Does NOT trigger ticket creation side effects
router.post('/manual-verify', async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ message: 'reference required' });

    const verifyRes = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );
    const status = verifyRes.data?.data?.status;
    const providerId = verifyRes.data?.data?.id;

    const txn = await Transaction.findOneAndUpdate(
      { reference },
      {
        $set: {
          status: status === 'success' ? 'success' : status === 'failed' ? 'failed' : 'pending',
          providerTransactionId: providerId,
        },
      },
      { new: true }
    );

    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    return res.json({ message: 'verified', status: txn.status });
  } catch (err) {
    console.error('manual-verify error', err.response?.data || err.message);
    return res.status(500).json({ message: 'Manual verify failed' });
  }
});


module.exports = router;