const express = require('express');
const router = express.Router();
const path = require('path');
const verifyToken = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

// GET /api/tickets/my-tickets - Get attendee's tickets
router.get('/my-tickets', verifyToken, async (req, res) => {
  try {
    const attendeeId = req.attendeeId || req.userId;
    
    const tickets = await Ticket.find({ attendeeId })
      .populate('eventId', 'title date location')
      .populate('transactionId', 'amount currency createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets: tickets.map(ticket => ({
        ticketId: ticket.ticketId,
        eventTitle: ticket.eventId?.title,
        eventDate: ticket.eventId?.date,
        eventLocation: ticket.eventId?.location,
        amount: ticket.transactionId?.amount,
        currency: ticket.transactionId?.currency,
        status: ticket.status,
        qrCodePath: ticket.qrCodePath,
        createdAt: ticket.createdAt,
        transactionId: ticket.transactionId
      }))
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// GET /api/tickets/:ticketId - Get specific ticket details
router.get('/:ticketId', verifyToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const attendeeId = req.attendeeId || req.userId;
    
    const ticket = await Ticket.findOne({ ticketId, attendeeId })
      .populate('eventId', 'title date location description')
      .populate('transactionId', 'amount currency createdAt')
      .populate('attendeeId', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({
      success: true,
      ticket: {
        ticketId: ticket.ticketId,
        eventTitle: ticket.eventId?.title,
        eventDate: ticket.eventId?.date,
        eventLocation: ticket.eventId?.location,
        eventDescription: ticket.eventId?.description,
        attendeeName: ticket.attendeeId?.name,
        attendeeEmail: ticket.attendeeId?.email,
        amount: ticket.transactionId?.amount,
        currency: ticket.transactionId?.currency,
        status: ticket.status,
        qrCodePath: ticket.qrCodePath,
        createdAt: ticket.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket' });
  }
});

// POST /api/tickets/:ticketId/use - Mark ticket as used (for event organizers)
router.post('/:ticketId/use', verifyToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    // Check if user is organizer of the event
    const ticket = await Ticket.findOne({ ticketId }).populate('eventId', 'organizerId');
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Verify the user is the organizer of this event
    if (ticket.eventId.organizerId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Only event organizer can mark tickets as used' });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ success: false, message: 'Ticket already used' });
    }

    ticket.status = 'used';
    ticket.usedAt = new Date();
    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket marked as used',
      ticket: {
        ticketId: ticket.ticketId,
        status: ticket.status,
        usedAt: ticket.usedAt
      }
    });
  } catch (error) {
    console.error('Error marking ticket as used:', error);
    res.status(500).json({ success: false, message: 'Failed to mark ticket as used' });
  }
});

// GET /api/tickets/:ticketId/qr - Serve QR code image
router.get('/:ticketId/qr', verifyToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const attendeeId = req.attendeeId || req.userId;
    
    const ticket = await Ticket.findOne({ ticketId, attendeeId });
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const qrCodePath = path.join(__dirname, 'tickets', ticket.qrCodePath);
    res.sendFile(qrCodePath);
  } catch (error) {
    console.error('Error serving QR code:', error);
    res.status(500).json({ success: false, message: 'Failed to serve QR code' });
  }
});

module.exports = router;
