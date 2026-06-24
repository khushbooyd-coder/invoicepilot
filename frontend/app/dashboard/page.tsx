'use client';

import { useEffect, useState } from 'react';
import { getDashboard, USE_MOCK, type DashboardResponse } from '@/services/api';
import { mockStats, mockRenewals } from '@/services/mockData';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (USE_MOCK) {
          // Mock mode — remove once Zoho credentials are connected
          setData({ stats: mockStats, upcomingRenewals: mockRenewals });
        } else {
          const result = await getDashboard();
          setData(result);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (error)   return <div className="p-8 text-red-400">{error}</div>;
  if (!data)   return null;

  const { stats, upcomingRenewals } = data;

  return (
    <div className="p-6 space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="text-green-400" />
        <StatCard label="Outstanding" value={`₹${stats.outstanding.toLocaleString()}`} color="text-yellow-400" />
        <StatCard label="Overdue" value={`₹${stats.overdueAmount.toLocaleString()}`} color="text-red-400" />
        <StatCard label="Customers" value={stats.totalCustomers.toString()} color="text-blue-400" />
      </div>

      {/* Upcoming Renewals */}
      <div className="bg-gray-900 rounded-xl p-5">
        <h2 className="text-white font-medium mb-4">Upcoming Renewals</h2>
        {upcomingRenewals.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming renewals</p>
        ) : (
          <div className="space-y-3">
            {upcomingRenewals.map((r) => (
              <div key={r.invoiceId} className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm">{r.customer}</p>
                  <p className="text-gray-400 text-xs">{r.invoiceNumber} · due {r.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">₹{r.amount.toLocaleString()}</p>
                  <p className={`text-xs ${r.daysLeft <= 7 ? 'text-red-400' : 'text-gray-400'}`}>
                    {r.daysLeft} days left
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}