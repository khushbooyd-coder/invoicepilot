// frontend/services/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || 'API request failed');
  }

  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Invoice {
  invoice_id: string;
  invoice_number: string;
  customer_name: string;
  total: number;
  balance: number;
  status: 'paid' | 'unpaid' | 'overdue' | 'draft';
  due_date: string;
  date: string;
}

export interface Customer {
  contact_id: string;
  contact_name: string;
  email: string;
  phone: string;
  status: string;
}

export interface Renewal {
  invoiceId: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  dueDate: string;
  daysLeft: number;
}

export interface DashboardStats {
  totalRevenue: number;
  outstanding: number;
  overdueCount: number;
  overdueAmount: number;
  totalCustomers: number;
  totalInvoices: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  upcomingRenewals: Renewal[];
}

export interface InvoicesResponse {
  invoices: Invoice[];
  hasMore: boolean;
  total: number;
}

export interface CustomersResponse {
  customers: Customer[];
  hasMore: boolean;
  total: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>('/dashboard');
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export async function getInvoices(
  status: 'all' | 'paid' | 'unpaid' | 'overdue' | 'draft' = 'all',
  page: number = 1
): Promise<InvoicesResponse> {
  return request<InvoicesResponse>(`/invoices?status=${status}&page=${page}`);
}

export async function getInvoice(id: string): Promise<{ invoice: Invoice }> {
  return request<{ invoice: Invoice }>(`/invoices/${id}`);
}

export async function createInvoice(data: Partial<Invoice>): Promise<{ invoice: Invoice }> {
  return request<{ invoice: Invoice }>('/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getUpcomingRenewals(days: number = 30): Promise<{ renewals: Renewal[] }> {
  return request<{ renewals: Renewal[] }>(`/invoices/upcoming-renewals?days=${days}`);
}

// ─── Customers ────────────────────────────────────────────────────────────────
export async function getCustomers(page: number = 1): Promise<CustomersResponse> {
  return request<CustomersResponse>(`/customers?page=${page}`);
}

export async function getCustomer(id: string): Promise<{ customer: Customer }> {
  return request<{ customer: Customer }>(`/customers/${id}`);
}


// ─── Mock mode (remove when credentials are ready) ───────────────────────────
// Set NEXT_PUBLIC_USE_MOCK=true in .env.local to use mock data
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';