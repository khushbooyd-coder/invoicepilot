// frontend/services/mockData.ts
// Remove this file once real API credentials are connected
// Shape matches Zoho Books API response exactly

import type { Invoice, Customer, Renewal, DashboardStats } from './api';

export const mockStats: DashboardStats = {
  totalRevenue: 284750,
  outstanding: 47200,
  overdueCount: 3,
  overdueAmount: 12400,
  totalCustomers: 24,
  totalInvoices: 214,
};

export const mockRenewals: Renewal[] = [
  { invoiceId: 'INV-001', invoiceNumber: 'INV-001', customer: 'Bragpacker.com', amount: 2822, dueDate: '2026-07-01', daysLeft: 7 },
  { invoiceId: 'INV-002', invoiceNumber: 'INV-002', customer: 'Zanskar.in', amount: 4500, dueDate: '2026-07-05', daysLeft: 11 },
  { invoiceId: 'INV-003', invoiceNumber: 'INV-003', customer: 'Perth Paediatrics', amount: 8200, dueDate: '2026-07-10', daysLeft: 16 },
  { invoiceId: 'INV-004', invoiceNumber: 'INV-004', customer: 'Playstudios.world', amount: 3100, dueDate: '2026-07-15', daysLeft: 21 },
  { invoiceId: 'INV-005', invoiceNumber: 'INV-005', customer: 'Abaca.in', amount: 5600, dueDate: '2026-07-20', daysLeft: 26 },
];

export const mockInvoices: Invoice[] = [
  { invoice_id: 'INV-001', invoice_number: 'INV-001', customer_name: 'Bragpacker.com', total: 2822, balance: 2822, status: 'unpaid', due_date: '2026-07-01', date: '2026-06-01' },
  { invoice_id: 'INV-002', invoice_number: 'INV-002', customer_name: 'Zanskar.in', total: 4500, balance: 0, status: 'paid', due_date: '2026-06-15', date: '2026-05-15' },
  { invoice_id: 'INV-003', invoice_number: 'INV-003', customer_name: 'Perth Paediatrics', total: 8200, balance: 8200, status: 'overdue', due_date: '2026-06-10', date: '2026-05-10' },
  { invoice_id: 'INV-004', invoice_number: 'INV-004', customer_name: 'Playstudios.world', total: 3100, balance: 0, status: 'paid', due_date: '2026-06-20', date: '2026-05-20' },
  { invoice_id: 'INV-005', invoice_number: 'INV-005', customer_name: 'Abaca.in', total: 5600, balance: 5600, status: 'unpaid', due_date: '2026-07-20', date: '2026-06-20' },
];

export const mockCustomers: Customer[] = [
  { contact_id: 'C001', contact_name: 'Bragpacker.com', email: 'accounts@bragpacker.com', phone: '+91 98000 00001', status: 'active' },
  { contact_id: 'C002', contact_name: 'Zanskar.in', email: 'accounts@zanskar.in', phone: '+91 98000 00002', status: 'active' },
  { contact_id: 'C003', contact_name: 'Perth Paediatrics', email: 'billing@perthpaediatrics.com', phone: '+61 400 000 001', status: 'active' },
  { contact_id: 'C004', contact_name: 'Playstudios.world', email: 'accounts@playstudios.world', phone: '+91 98000 00004', status: 'active' },
  { contact_id: 'C005', contact_name: 'Abaca.in', email: 'billing@abaca.in', phone: '+91 98000 00005', status: 'active' },
];