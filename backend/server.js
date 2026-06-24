const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/invoices',   require('./routes/invoices'));
app.use('/api/customers',  require('./routes/customers'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/products',   require('./routes/products'));

// Zoho OAuth setup — used once to get refresh token
app.use('/api/zoho',       require('./routes/auth-zoho'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));