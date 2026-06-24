// backend/routes/auth-zoho.js
// Run this ONE TIME to get your refresh token from Zoho
// After you have the refresh token, add it to .env and this route is no longer needed

const express = require('express');
const router  = express.Router();
const axios   = require('axios');

// Step 1 — Visit this URL in browser to authorize
// GET /api/zoho/connect
router.get('/connect', (req, res) => {
  const params = new URLSearchParams({
    scope:         'ZohoBooks.fullaccess.all',
    client_id:     process.env.ZOHO_CLIENT_ID,
    response_type: 'code',
    redirect_uri:  process.env.ZOHO_REDIRECT_URI || 'http://localhost:5000/api/zoho/callback',
    access_type:   'offline',
  });

  const url = `https://accounts.zoho.in/oauth/v2/auth?${params}`;
  res.redirect(url);
});

// Step 2 — Zoho redirects here with a code, we exchange it for tokens
// GET /api/zoho/callback
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code received from Zoho' });
  }

  try {
    const response = await axios.post(
      'https://accounts.zoho.in/oauth/v2/token',
      null,
      {
        params: {
          code,
          client_id:     process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          redirect_uri:  process.env.ZOHO_REDIRECT_URI || 'http://localhost:5000/api/zoho/callback',
          grant_type:    'authorization_code',
        },
      }
    );

    const { access_token, refresh_token } = response.data;

    // Show the refresh token — copy this to your .env as ZOHO_REFRESH_TOKEN
    res.json({
      message:       '✅ Zoho connected successfully! Copy the refresh_token below to your .env file',
      refresh_token,
      access_token,
      next_step:     'Add ZOHO_REFRESH_TOKEN=<refresh_token> to your backend .env file',
    });

  } catch (err) {
    const detail = err?.response?.data || err.message;
    res.status(500).json({ error: 'Failed to exchange code', detail });
  }
});

// Step 3 — Test that everything works
// GET /api/zoho/test
router.get('/test', async (req, res) => {
  try {
    const zoho = require('../services/zoho');
    const stats = await zoho.getDashboardStats();
    res.json({ message: '✅ Zoho Books connected and working!', stats });
  } catch (err) {
    res.status(500).json({
      error:   '❌ Connection failed',
      message: err.message,
      hint:    'Make sure ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN and ZOHO_ORG_ID are set in .env',
    });
  }
});

module.exports = router;