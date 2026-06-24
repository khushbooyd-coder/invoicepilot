'use client';

import { useEffect, useState } from 'react';
import { getCustomers, USE_MOCK, type Customer } from '@/services/api';
import { mockCustomers } from '@/services/mockData';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    async function load() {
      try {
        if (USE_MOCK) {
          setCustomers(mockCustomers);
        } else {
          const res = await getCustomers();
          setCustomers(res.customers);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = customers.filter(c =>
    c.contact_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-xl font-semibold">Customers</h1>
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-800 text-white text-sm rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-blue-500 w-64"
        />
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {error   && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-center p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.contact_id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                  <td className="p-4 text-white font-medium">{c.contact_name}</td>
                  <td className="p-4 text-gray-400">{c.email}</td>
                  <td className="p-4 text-gray-400">{c.phone}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      c.status === 'active'
                        ? 'bg-green-900 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {c.status}
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