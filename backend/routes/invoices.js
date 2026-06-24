const express = require('express');
const router = express.Router();
const zoho = require('../services/zoho');
const { verifyToken } = require('../middleware/auth');

// All routes protected
router.use(verifyToken);

// GET /api/invoices?status=unpaid&page=1
router.get('/', async (req, res) => {
  try {
    const { status = 'all', page = 1 } = req.query;
    const result = await zoho.getInvoices(status, parseInt(page));
    res.json(result);
  } catch (err) {
    console.error('Invoices fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch invoices', message: err.message });
  }
});

// GET /api/invoices/upcoming-renewals?days=30
router.get('/upcoming-renewals', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const renewals = await zoho.getUpcomingRenewals(parseInt(days));
    res.json({ renewals });
  } catch (err) {
    console.error('Renewals fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch renewals', message: err.message });
  }
});

// GET /api/invoices/:id
router.get('/:id', async (req, res) => {
  try {
    const invoice = await zoho.getInvoiceById(req.params.id);
    res.json({ invoice });
  } catch (err) {
    console.error('Invoice fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch invoice', message: err.message });
  }
});

// POST /api/invoices
router.post('/', async (req, res) => {
  try {
    const invoice = await zoho.createInvoice(req.body);
    res.status(201).json({ invoice });
  } catch (err) {
    console.error('Invoice create error:', err.message);
    res.status(500).json({ error: 'Failed to create invoice', message: err.message });
  }
});

module.exports = router;