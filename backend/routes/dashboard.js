const express = require('express');
const router = express.Router();

// Safe auth middleware import — won't crash if verifyToken is undefined
let verifyToken;
try {
  const authMiddleware = require('../middleware/auth');
  verifyToken = authMiddleware.verifyToken || authMiddleware.default || authMiddleware;
  // Make sure it's actually a function, else skip it
  if (typeof verifyToken !== 'function') verifyToken = null;
} catch (e) {
  console.warn('Auth middleware not found, running without auth');
  verifyToken = null;
}

const protect = verifyToken
  ? verifyToken
  : (req, res, next) => next(); // passthrough if no auth

const zohoReady = () =>
  process.env.ZOHO_CLIENT_ID && process.env.ZOHO_CLIENT_ID !== 'placeholder';

// GET /api/dashboard
router.get('/', protect, async (req, res) => {
  if (!zohoReady()) {
    return res.json({
      stats: {
        totalRevenue: 0, outstanding: 0,
        overdueCount: 0, overdueAmount: 0,
        totalCustomers: 0, totalInvoices: 0,
      },
      upcomingRenewals: [],
      notice: 'Zoho credentials not connected yet',
    });
  }

  try {
    const zoho = require('../services/zoho');
    const [stats, renewals] = await Promise.all([
      zoho.getDashboardStats(),
      zoho.getUpcomingRenewals(30),
    ]);
    res.json({ stats, upcomingRenewals: renewals.slice(0, 5) });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;