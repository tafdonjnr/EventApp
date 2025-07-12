require('dotenv').config();
const path = require('path');
const express = require('express');
const { connect } = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Log loaded environment secret (for dev debug only)
console.log('JWT_SECRET is:', process.env.JWT_SECRET);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const organizerAuthRoutes = require('./routes/organizerAuth');
const organizerRoutes     = require('./routes/organizers');
const eventRoutes         = require('./routes/Event');
const attendeeAuthRoutes  = require('./routes/attendeeAuth');

app.use('/api/organizers', organizerAuthRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendees', attendeeAuthRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect DB & start server
connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
