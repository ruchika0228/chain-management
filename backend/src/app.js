require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const cron    = require('node-cron');
const { testConnection } = require('./config/db');
const { getPendingEmployees } = require('./services/taskService');

const app = express();

// CORS — allow the configured frontend URL plus common dev/Docker origins.
// In Docker the browser makes requests from the host IP (e.g. http://192.168.1.68:8080).
// We build an allow-list from FRONTEND_URL plus any extra space-separated origins in
// EXTRA_CORS_ORIGINS, so you never need to rebuild just to add an origin.
const _corsOrigins = (() => {
  const list = [];
  if (process.env.FRONTEND_URL) list.push(process.env.FRONTEND_URL);
  if (process.env.EXTRA_CORS_ORIGINS) {
    process.env.EXTRA_CORS_ORIGINS.split(' ').forEach(o => o && list.push(o.trim()));
  }
  // Always allow localhost for dev convenience
  ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'].forEach(o => {
    if (!list.includes(o)) list.push(o);
  });
  return list;
})();

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no Origin header (curl, mobile apps, same-origin nginx proxy)
    if (!origin) return cb(null, true);
    if (_corsOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (no auth)
app.use('/api/public', require('./routes/public'));

// Protected routes (JWT required)
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/forms', require('./routes/forms'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/attendance', require('./routes/attendance'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// Global error handler
app.use((err, req, res, next) => {
  const status  = err.status  || 500;
  const message = err.message || 'Internal server error.';
  if (status === 500) console.error(err);
  res.status(status).json({ success: false, message });
});

// ── 6 PM daily reminder ─────────────────────────────────────────
// Runs at 18:00 every day; logs employees who haven't submitted today.
// Frontend polls /api/tasks/daily-status to surface the notification.
cron.schedule('0 18 * * *', async () => {
  try {
    const pending = await getPendingEmployees();
    if (pending.length === 0) {
      console.log('[6PM Reminder] All employees have submitted their tasks today.');
    } else {
      console.log(`[6PM Reminder] ${pending.length} employee(s) have NOT submitted today:`);
      pending.forEach(e => console.log(`  • ${e.name} <${e.email}>`));
    }
  } catch (err) {
    console.error('[6PM Reminder] Error checking pending employees:', err.message);
  }
}, { timezone: 'Asia/Kolkata' });

const PORT = process.env.PORT || 5000;
const SERVER_IP = process.env.SERVER_IP || '0.0.0.0';

(async () => {
  await testConnection();
  app.listen(PORT, SERVER_IP, () => {
    const protocol = process.env.NODE_ENV === 'production' ? 'http' : 'http';
    console.log(`✓  Server  →  ${protocol}://${SERVER_IP}:${PORT}`);
  });
})();
