const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

const zohoReady = () =>
  process.env.ZOHO_CLIENT_ID && process.env.ZOHO_CLIENT_ID !== 'placeholder';

router.get('/upcoming-renewals', async (req, res) => {
  if (!zohoReady()) return res.json({ renewals: [] });
  try {
    const zoho = require('../services/zoho');
    const renewals = await zoho.getUpcomingRenewals(parseInt(req.query.days) || 30);
    res.json({ renewals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  if (!zohoReady()) return res.json({ invoices: [], hasMore: false, total: 0 });
  try {
    const zoho = require('../services/zoho');
    const result = await zoho.getInvoices(req.query.status || 'all', parseInt(req.query.page) || 1);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  if (!zohoReady()) return res.status(503).json({ error: 'Zoho not connected' });
  try {
    const zoho = require('../services/zoho');
    const invoice = await zoho.getInvoiceById(req.params.id);
    res.json({ invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  if (!zohoReady()) return res.status(503).json({ error: 'Zoho not connected' });
  try {
    const zoho = require('../services/zoho');
    const invoice = await zoho.createInvoice(req.body);
    res.status(201).json({ invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;