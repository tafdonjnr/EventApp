const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const protect = require('../middleware/auth');
const upload = require('../multerConfig');
const jwt = require('jsonwebtoken');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'orgName');
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

    const eventData = {
      title,
      description,
      date,
      venue,
      price: parseFloat(price),
      ticketsAvailable: parseInt(ticketsAvailable),
      category,
      organizer: req.organizerId,
    };

    console.log('Event data to save:', eventData);

    // Add banner path if file was uploaded
    if (req.file) {
      eventData.banner = `/uploads/${req.file.filename}`;
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

    // Add banner path if file was uploaded
    if (req.file) {
      updateData.banner = `/uploads/${req.file.filename}`;
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

// Register for an event (attendee only)
router.post('/:id/register', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token and get attendee ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'attendee') {
      return res.status(403).json({ message: 'Only attendees can register for events' });
    }

    const attendeeId = decoded.id;
    const eventId = req.params.id;

    // Check if event exists and has available tickets
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.ticketsAvailable <= 0) {
      return res.status(400).json({ message: 'Event is sold out' });
    }

    // Check if attendee is already registered
    const Attendee = require('../models/Attendee');
    const attendee = await Attendee.findById(attendeeId);
    
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }

    const isAlreadyRegistered = attendee.registeredEvents.some(
      reg => reg.event.toString() === eventId
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Add event to attendee's registered events
    attendee.registeredEvents.push({
      event: eventId,
      registrationDate: new Date(),
      status: 'registered'
    });

    await attendee.save();

    // Decrease available tickets
    event.ticketsAvailable -= 1;
    await event.save();

    res.json({ 
      message: 'Successfully registered for event',
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue,
        price: event.price
      }
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

    // Check if the organizer owns this event
    if (event.organizer.toString() !== req.organizerId) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
