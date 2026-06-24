const axios = require('axios');

// ─── Token cache (in-memory, refreshes automatically) ────────────────────────
let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  // Return cached token if still valid (5 min buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  const res = await axios.post(
    'https://accounts.zoho.in/oauth/v2/token',
    null,
    {
      params: {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id:     process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type:    'refresh_token',
      },
    }
  );

  cachedToken = res.data.access_token;
  tokenExpiry = Date.now() + res.data.expires_in * 1000;
  return cachedToken;
}

// ─── Base request helper ──────────────────────────────────────────────────────
async function zohoGet(endpoint, params = {}) {
  const token = await getAccessToken();
  const res = await axios.get(
    `https://www.zohoapis.in/books/v3/${endpoint}`,
    {
      params: { organization_id: process.env.ZOHO_ORG_ID, ...params },
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    }
  );
  return res.data;
}

async function zohoPost(endpoint, body = {}) {
  const token = await getAccessToken();
  const res = await axios.post(
    `https://www.zohoapis.in/books/v3/${endpoint}`,
    body,
    {
      params: { organization_id: process.env.ZOHO_ORG_ID },
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    }
  );
  return res.data;
}

// ─── Customers ────────────────────────────────────────────────────────────────
async function getCustomers(page = 1) {
  const data = await zohoGet('contacts', {
    contact_type: 'customer',
    page,
    per_page: 200,
  });
  return {
    customers: data.contacts || [],
    hasMore: data.page_context?.has_more_page || false,
    total: data.page_context?.total || 0,
  };
}

async function getCustomerById(customerId) {
  const data = await zohoGet(`contacts/${customerId}`);
  return data.contact;
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
async function getInvoices(status = 'all', page = 1) {
  const params = { page, per_page: 200 };
  if (status !== 'all') params.status = status; // unpaid, paid, overdue, draft

  const data = await zohoGet('invoices', params);
  return {
    invoices: data.invoices || [],
    hasMore: data.page_context?.has_more_page || false,
    total: data.page_context?.total || 0,
  };
}

async function getInvoiceById(invoiceId) {
  const data = await zohoGet(`invoices/${invoiceId}`);
  return data.invoice;
}

async function createInvoice(invoiceData) {
  const data = await zohoPost('invoices', invoiceData);
  return data.invoice;
}

// ─── Upcoming renewals (invoices due in next 30 days) ────────────────────────
async function getUpcomingRenewals(days = 30) {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + days);

  const fmt = (d) => d.toISOString().split('T')[0];

  const data = await zohoGet('invoices', {
    status: 'unpaid',
    due_date_start: fmt(today),
    due_date_end: fmt(future),
    per_page: 200,
  });

  return (data.invoices || []).map((inv) => ({
    invoiceId:    inv.invoice_id,
    invoiceNumber: inv.invoice_number,
    customer:     inv.customer_name,
    amount:       inv.balance,
    dueDate:      inv.due_date,
    daysLeft:     Math.ceil(
      (new Date(inv.due_date) - today) / (1000 * 60 * 60 * 24)
    ),
  }));
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────
async function getDashboardStats() {
  const [allInvoices, customers] = await Promise.all([
    zohoGet('invoices', { per_page: 200 }),
    zohoGet('contacts', { contact_type: 'customer', per_page: 200 }),
  ]);

  const invoices = allInvoices.invoices || [];

  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0);

  const outstanding = invoices
    .filter((i) => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.balance, 0);

  const overdue = invoices.filter((i) => i.status === 'overdue');

  return {
    totalRevenue,
    outstanding,
    overdueCount: overdue.length,
    overdueAmount: overdue.reduce((sum, i) => sum + i.balance, 0),
    totalCustomers: allInvoices.page_context?.total || 0,
    totalInvoices: invoices.length,
  };
}

module.exports = {
  getCustomers,
  getCustomerById,
  getInvoices,
  getInvoiceById,
  createInvoice,
  getUpcomingRenewals,
  getDashboardStats,
};