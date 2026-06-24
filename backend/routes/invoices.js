const express = require('express');
const router = express.Router();

let verifyToken;
try {
  const m = require('../middleware/auth');
  verifyToken = m.verifyToken || m.default || m;
  if (typeof verifyToken !== 'function') verifyToken = null;
} catch (e) { verifyToken = null; }

const protect = verifyToken || ((req, res, next) => next());
const zohoReady = () =>
  process.env.ZOHO_CLIENT_ID && process.env.ZOHO_CLIENT_ID !== 'placeholder';

router.get('/upcoming-renewals', protect, async (req, res) => {
  if (!zohoReady()) return res.json({ renewals: [] });
  try {
    const zoho = require('../services/zoho');
    const renewals = await zoho.getUpcomingRenewals(parseInt(req.query.days) || 30);
    res.json({ renewals });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', protect, async (req, res) => {
  if (!zohoReady()) return res.json({ invoices: [], hasMore: false, total: 0 });
  try {
    const zoho = require('../services/zoho');
    const result = await zoho.getInvoices(req.query.status || 'all', parseInt(req.query.page) || 1);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  if (!zohoReady()) return res.status(503).json({ error: 'Zoho not connected' });
  try {
    const zoho = require('../services/zoho');
    const invoice = await zoho.getInvoiceById(req.params.id);
    res.json({ invoice });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', protect, async (req, res) => {
  if (!zohoReady()) return res.status(503).json({ error: 'Zoho not connected' });
  try {
    const zoho = require('../services/zoho');
    const invoice = await zoho.createInvoice(req.body);
    res.status(201).json({ invoice });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;