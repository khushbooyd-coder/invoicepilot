const express = require('express');
const router = express.Router();
const zoho = require('../services/zoho');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/customers?page=1
router.get('/', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const result = await zoho.getCustomers(parseInt(page));
    res.json(result);
  } catch (err) {
    console.error('Customers fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch customers', message: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const customer = await zoho.getCustomerById(req.params.id);
    res.json({ customer });
  } catch (err) {
    console.error('Customer fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch customer', message: err.message });
  }
});

module.exports = router;