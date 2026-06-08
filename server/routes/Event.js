const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const protect = require('../middleware/auth');
const upload = require('../multerConfig');
const jwt = require('jsonwebtoken');

// Get all events — only future/current events for attendee feed
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() },
      status: { $ne: 'cancelled' },
    }).populate('organizer', 'orgName');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'orgName');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new event (protected)
router.post('/', protect, upload.single('banner'), async (req, res) => {
  console.log('POST /api/events - Request received');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  console.log('Organizer ID:', req.organizerId);

  try {
    const { title, description, date, venue, price, ticketsAvailable, category } = req.body;

    const parsedTickets = parseInt(ticketsAvailable);

    const eventData = {
      title,
      description,
      date,
      venue,
      price: parseFloat(price),
      ticketsAvailable: parsedTickets,
      totalCapacity: parsedTickets,
      category,
      organizer: req.organizerId,
    };

    console.log('Event data to save:', eventData);

    if (req.file) {
      eventData.banner = req.file.path;
      console.log('Banner path added:', eventData.banner);
    }

    const event = new Event(eventData);
    const newEvent = await event.save();

    console.log('Event saved successfully:', newEvent._id);
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error saving event:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update an event (protected)
router.put('/:id', protect, upload.single('banner'), async (req, res) => {
  try {
    const { title, description, date, venue, price, ticketsAvailable, category } = req.body;

    const updateData = {
      title,
      description,
      date,
      venue,
      price: parseFloat(price),
      ticketsAvailable: parseInt(ticketsAvailable),
      category,
    };

    if (ticketsAvailable !== undefined) {
      const existing = await Event.findById(req.params.id).select('ticketsSold');
      if (existing) {
        updateData.totalCapacity = parseInt(ticketsAvailable) + (existing.ticketsSold || 0);
      }
    }

    if (req.file) {
      updateData.banner = req.file.path;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Register for a free event (attendee only)
router.post('/:id/register', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'attendee') {
      return res.status(403).json({ message: 'Only attendees can register for events' });
    }

    const attendeeId = decoded.id;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.ticketsAvailable <= 0) {
      return res.status(400).json({ message: 'Event is sold out' });
    }

    const Attendee = require('../models/Attendee');
    const attendee = await Attendee.findById(attendeeId);

    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }

    const isAlreadyRegistered = attendee.registeredEvents.some(
      (reg) => reg.event.toString() === eventId
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    attendee.registeredEvents.push({
      event: eventId,
      registrationDate: new Date(),
      status: 'registered',
    });

    await attendee.save();

    event.ticketsAvailable -= 1;
    await event.save();

    res.json({
      message: 'Successfully registered for event',
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue,
        price: event.price,
      },
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an event (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.organizerId) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/events/:id/cancel
// Organizer only — cancels event, triggers Paystack refunds for all paid tickets
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.organizerId) {
      return res.status(403).json({ message: 'Not authorized to cancel this event' });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({ message: 'Event is already cancelled' });
    }

    // Mark event as cancelled immediately — stops new ticket sales
    event.status = 'cancelled';
    event.cancelledAt = new Date();
    await event.save();

    // Find all successful transactions for this event
    const Transaction = require('../models/Transaction');
    const Ticket = require('../models/Ticket');
    const Attendee = require('../models/Attendee');
    const axios = require('axios');

    const transactions = await Transaction.find({
      eventId: event._id,
      status: 'success',
    });

    let refundsTriggered = 0;
    let refundsFailed = 0;
    const refundErrors = [];

    for (const txn of transactions) {
      try {
        // Trigger Paystack refund — full amount
        if (txn.providerTransactionId) {
          await axios.post(
            'https://api.paystack.co/refund',
            {
              transaction: txn.providerTransactionId,
              amount: Math.round(Number(txn.amount) * 100), // kobo
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );
        }

        // Update transaction status
        txn.status = 'refunded';
        await txn.save();

        // Cancel all tickets on this transaction
        await Ticket.updateMany(
          { transactionId: txn._id },
          { $set: { status: 'cancelled' } }
        );

        // Update attendee's registeredEvents status
        await Attendee.updateOne(
          {
            _id: txn.userId,
            'registeredEvents.event': event._id,
          },
          {
            $set: { 'registeredEvents.$.status': 'cancelled' },
          }
        );

        refundsTriggered++;
      } catch (refundErr) {
        console.error(`Refund failed for transaction ${txn._id}:`, refundErr.response?.data || refundErr.message);
        refundsFailed++;
        refundErrors.push({
          transactionId: txn._id,
          error: refundErr.response?.data?.message || refundErr.message,
        });
      }
    }

    return res.json({
      message: 'Event cancelled successfully',
      refundsTriggered,
      refundsFailed,
      refundErrors: refundErrors.length > 0 ? refundErrors : undefined,
    });
  } catch (err) {
    console.error('Cancel event error:', err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;