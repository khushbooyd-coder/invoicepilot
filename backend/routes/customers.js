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

router.get('/', protect, async (req, res) => {
  if (!zohoReady()) return res.json({ customers: [], hasMore: false, total: 0 });
  try {
    const zoho = require('../services/zoho');
    const result = await zoho.getCustomers(parseInt(req.query.page) || 1);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  if (!zohoReady()) return res.status(503).json({ error: 'Zoho not connected' });
  try {
    const zoho = require('../services/zoho');
    const customer = await zoho.getCustomerById(req.params.id);
    res.json({ customer });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;