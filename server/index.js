const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

function fatal(message, err) {
  console.error('[FATAL]', message);
  if (err && err.stack) console.error(err.stack);
  else if (err) console.error(err);
  process.exit(1);
}

process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException:', err && err.stack ? err.stack : err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  console.error('[FATAL] unhandledRejection:', err.stack || err);
  process.exit(1);
});

let express;
let connect;
let cors;
try {
  express = require('express');
  ({ connect } = require('mongoose'));
  cors = require('cors');
} catch (err) {
  fatal(
    'Failed to load core dependencies (express / mongoose / cors). ' +
      'On Render, set Root Directory to `server` so `npm install` runs there (see render.yaml rootDir). ' +
      `cwd=${process.cwd()} __dirname=${__dirname}`,
    err
  );
}

const app = express();
const PORT = Number(process.env.PORT) || 5000;

console.log('[startup]', {
  cwd: process.cwd(),
  __dirname,
  NODE_ENV: process.env.NODE_ENV || '(not set)',
  PORT,
  MONGO_URI_set: Boolean(process.env.MONGO_URI && String(process.env.MONGO_URI).trim()),
  JWT_SECRET_set: Boolean(process.env.JWT_SECRET),
});

const mongoUri = process.env.MONGO_URI;
if (!mongoUri || !String(mongoUri).trim()) {
  fatal(
    'MONGO_URI is missing or empty. Add it in Render → Environment (Atlas connection string). ' +
      'A local .env file is not deployed to Render.'
  );
}

// Middleware
app.use(cors());

// Raw body for Paystack webhook signature verification
app.post('/api/payments/webhook', express.raw({ type: '*/*' }), (req, res, next) => {
  req.rawBody = req.body.toString('utf8');
  next();
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes (load after middleware so failures are attributed clearly)
let organizerAuthRoutes;
let organizerRoutes;
let eventRoutes;
let attendeeAuthRoutes;
let paymentRoutes;
let ticketRoutes;
let adminRoutes;
try {
  organizerAuthRoutes = require('./routes/organizerAuth');
  organizerRoutes = require('./routes/organizers');
  eventRoutes = require('./routes/Event');
  attendeeAuthRoutes = require('./routes/attendeeAuth');
  paymentRoutes = require('./routes/payments');
  ticketRoutes = require('./routes/tickets');
  adminRoutes = require('./routes/admin');
} catch (err) {
  fatal('Failed loading route modules', err);
}

app.use('/api/organizers', organizerAuthRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendees', attendeeAuthRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 20000,
};

connect(mongoUri, MONGO_OPTIONS)
  .then(() => {
    console.log('[startup] MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[startup] HTTP listening on 0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[FATAL] MongoDB connection failed:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  });
