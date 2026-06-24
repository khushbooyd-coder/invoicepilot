'use client';

import { useEffect, useState } from 'react';
import { getInvoices, USE_MOCK, type Invoice } from '@/services/api';
import { mockInvoices } from '@/services/mockData';

const TABS = ['all', 'paid', 'unpaid', 'overdue'] as const;
type Tab = typeof TABS[number];

const statusStyle: Record<string, string> = {
  paid:    'bg-green-900 text-green-400',
  unpaid:  'bg-yellow-900 text-yellow-400',
  overdue: 'bg-red-900 text-red-400',
  draft:   'bg-gray-700 text-gray-400',
};

export default function InvoicesPage() {
  const [tab, setTab]         = useState<Tab>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (USE_MOCK) {
          const filtered = tab === 'all'
            ? mockInvoices
            : mockInvoices.filter(i => i.status === tab);
          setInvoices(filtered);
        } else {
          const res = await getInvoices(tab);
          setInvoices(res.invoices);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tab]);

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-white text-xl font-semibold">Invoices</h1>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize transition-colors ${
              tab === t
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {error   && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                <th className="text-left p-4">Invoice</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Due Date</th>
                <th className="text-right p-4">Amount</th>
                <th className="text-right p-4">Balance</th>
                <th className="text-center p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : invoices.map(inv => (
                <tr key={inv.invoice_id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                  <td className="p-4 text-blue-400 font-medium">{inv.invoice_number}</td>
                  <td className="p-4 text-white">{inv.customer_name}</td>
                  <td className="p-4 text-gray-400">{inv.date}</td>
                  <td className="p-4 text-gray-400">{inv.due_date}</td>
                  <td className="p-4 text-white text-right">₹{inv.total.toLocaleString()}</td>
                  <td className="p-4 text-white text-right">₹{inv.balance.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusStyle[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}