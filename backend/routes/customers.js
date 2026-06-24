const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

const zohoReady = () =>
  process.env.ZOHO_CLIENT_ID && process.env.ZOHO_CLIENT_ID !== 'placeholder';

router.get('/', async (req, res) => {
  if (!zohoReady()) return res.json({ customers: [], hasMore: false, total: 0 });
  try {
    const zoho = require('../services/zoho');
    const result = await zoho.getCustomers(parseInt(req.query.page) || 1);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  if (!zohoReady()) return res.status(503).json({ error: 'Zoho not connected' });
  try {
    const zoho = require('../services/zoho');
    const customer = await zoho.getCustomerById(req.params.id);
    res.json({ customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;