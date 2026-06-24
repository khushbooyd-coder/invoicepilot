const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/dashboard
router.get('/', async (req, res) => {
  // Return empty structure if Zoho not connected yet
  if (!process.env.ZOHO_CLIENT_ID || process.env.ZOHO_CLIENT_ID === 'placeholder') {
    return res.json({
      stats: {
        totalRevenue: 0, outstanding: 0,
        overdueCount: 0, overdueAmount: 0,
        totalCustomers: 0, totalInvoices: 0
      },
      upcomingRenewals: [],
      notice: 'Zoho credentials not connected yet'
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
    console.error('Dashboard fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard data', message: err.message });
  }
});

module.exports = router;