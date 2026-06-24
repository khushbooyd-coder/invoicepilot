'use client';

import { useEffect, useState } from 'react';
import { getDashboard, USE_MOCK, type DashboardResponse } from '@/services/api';
import { mockStats, mockRenewals, mockInvoices, mockCustomers } from '@/services/mockData';

// Mini sparkline chart using SVG
function RevenueChart() {
  const points = [40, 55, 45, 60, 58, 72, 80, 75, 90, 95, 88, 110];
  const max = Math.max(...points);
  const w = 700, h = 160;
  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - (p / max) * h * 0.85 - 10,
  }));
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        <path d={area} fill="url(#grad)"/>
        <path d={path} fill="none" stroke="#3b82f6" strokeWidth="2.5"/>
        {coords.map((c, i) => (
          <text key={i} x={c.x} y={h + 18} textAnchor="middle" fontSize="11" fill="#6b7280">
            {months[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (USE_MOCK) {
          setData({ stats: mockStats, upcomingRenewals: mockRenewals });
        } else {
          setData(await getDashboard());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading...</div>;
  if (error)   return <div className="p-8 text-red-400 text-sm">{error}</div>;
  if (!data)   return null;

  const { stats, upcomingRenewals } = data;

  // Mock GWS + Zoho integration data (will come from real APIs later)
  const gws  = { users: 42, licenses: 38, storage: '312 GB', groups: 12 };
  const zoho = { invoices: stats.totalInvoices || 214, leads: 47, tickets: 5, mailboxes: 28 };

  // Recent invoices + orders from mock
  const recentInvoices = USE_MOCK ? mockInvoices.slice(0, 3) : [];
  const recentOrders   = USE_MOCK ? mockCustomers.slice(0, 2) : [];

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Welcome back 👋</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue',    value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'text-green-400'  },
          { label: 'Customers',  value: stats.totalCustomers.toString(),            color: 'text-yellow-400' },
          { label: 'Invoices',   value: stats.totalInvoices.toString(),             color: 'text-yellow-400' },
          { label: 'Overdue',    value: `₹${stats.overdueAmount.toLocaleString()}`, color: 'text-purple-400' },
        ].map(c => (
          <div key={c.label} className="bg-[#1a1f2e] rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-xs mb-2">{c.label}</p>
            <p className={`text-3xl font-semibold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-[#1a1f2e] rounded-xl p-5 border border-gray-800">
        <h2 className="text-white font-medium mb-4">Revenue Overview</h2>
        <RevenueChart />
      </div>

      {/* GWS + Zoho cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1a1f2e] rounded-xl p-5 border border-gray-800">
          <h2 className="text-white font-medium mb-4">Google Workspace</h2>
          <div className="space-y-3">
            {[
              { icon: '👥', label: 'Users',    value: gws.users    },
              { icon: '📄', label: 'Licenses', value: gws.licenses },
              { icon: '💾', label: 'Storage',  value: gws.storage  },
              { icon: '👥', label: 'Groups',   value: gws.groups   },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">{r.icon} {r.label}</span>
                <span className="text-white font-medium text-sm">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1f2e] rounded-xl p-5 border border-gray-800">
          <h2 className="text-white font-medium mb-4">Zoho</h2>
          <div className="space-y-3">
            {[
              { icon: '📗', label: 'Books Invoices', value: zoho.invoices  },
              { icon: '❤️', label: 'CRM Leads',      value: zoho.leads     },
              { icon: '🎫', label: 'Open Tickets',   value: zoho.tickets   },
              { icon: '📧', label: 'Mailboxes',      value: zoho.mailboxes },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">{r.icon} {r.label}</span>
                <span className="text-white font-medium text-sm">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1a1f2e] rounded-xl p-5 border border-gray-800">
          <h2 className="text-white font-medium mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet</p>
          ) : recentOrders.map(o => (
            <div key={o.contact_id} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
              <div>
                <p className="text-white text-sm font-medium">{o.contact_name}</p>
                <p className="text-gray-500 text-xs">Google Workspace</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 text-sm font-medium">₹1,200</p>
                <p className="text-gray-500 text-xs">Qty 1</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1a1f2e] rounded-xl p-5 border border-gray-800">
          <h2 className="text-white font-medium mb-4">Recent Invoices</h2>
          {recentInvoices.length === 0 ? (
            <p className="text-gray-500 text-sm">No invoices yet</p>
          ) : recentInvoices.map(inv => (
            <div key={inv.invoice_id} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
              <div>
                <p className="text-white text-sm font-medium">{inv.invoice_number}</p>
                <p className="text-gray-500 text-xs">{inv.customer_name}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <p className="text-white text-sm">₹{inv.total.toLocaleString()}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  inv.status === 'paid'    ? 'bg-green-900 text-green-400' :
                  inv.status === 'overdue' ? 'bg-red-900 text-red-400'     :
                                             'bg-yellow-900 text-yellow-400'
                }`}>{inv.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Renewals + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1a1f2e] rounded-xl p-5 border border-gray-800">
          <h2 className="text-white font-medium mb-4">Upcoming Renewals</h2>
          {upcomingRenewals.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming renewals</p>
          ) : upcomingRenewals.slice(0, 3).map(r => (
            <div key={r.invoiceId} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
              <div>
                <p className="text-white text-sm font-medium">{r.customer}</p>
                <p className="text-gray-500 text-xs">{r.invoiceNumber} · due {r.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm">₹{r.amount.toLocaleString()}</p>
                <p className={`text-xs ${r.daysLeft <= 7 ? 'text-red-400' : 'text-gray-500'}`}>
                  {r.daysLeft} days left
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1a1f2e] rounded-xl p-5 border border-gray-800">
          <h2 className="text-white font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Customer',   href: '/customers/new' },
              { label: 'Add Product',    href: '/products/new'  },
              { label: 'Create Order',   href: '/orders/new'    },
              { label: 'Create Invoice', href: '/invoices/new'  },
            ].map(a => (
              <a
                key={a.label}
                href={a.href}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium text-center py-3 rounded-lg transition-colors"
              >
                {a.label}
              </a>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}