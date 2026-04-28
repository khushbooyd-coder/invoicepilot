"use client";

import { useState, useEffect } from "react";
import {
  signInWithPopup,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, provider } from "../firebase";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [filter, setFilter] = useState("all");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customer: "",
    price: "",
    startDate: "",
    renewalDate: "",
  });

  // 🔐 LOGIN
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      setError("Login failed");
    }
  };

  // 🔁 Persist login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        loadData(u);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔄 LOAD DATA
  const loadData = async (currentUser: User) => {
    try {
      const token = await currentUser.getIdToken();

      const res = await fetch(
        "https://invoicepilot-6g3a.onrender.com/invoices",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setInvoices(data);
    } catch {
      setError("Failed to load invoices");
    }
  };

  // ➕ CREATE
  const handleCreate = async () => {
    if (!user) return;

    // ✅ Validation
    if (!form.customer || !form.price || !form.startDate || !form.renewalDate) {
      setError("Please fill all fields");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const token = await user.getIdToken();

      await fetch(
        "https://invoicepilot-6g3a.onrender.com/add-license",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      setForm({
        customer: "",
        price: "",
        startDate: "",
        renewalDate: "",
      });

      loadData(user);
    } catch {
      setError("Failed to create invoice");
    }

    setCreating(false);
  };

  // 💰 PAY
  const markPaid = async (id: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();

      await fetch(
        `https://invoicepilot-6g3a.onrender.com/pay-invoice/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadData(user);
    } catch {
      setError("Failed to update invoice");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  const today = new Date();

  const dueInvoices = invoices.filter(
    (inv) =>
      new Date(inv.renewalDate) <= today &&
      inv.status !== "Paid"
  );

  const filteredInvoices = invoices.filter((inv) => {
    const overdue =
      new Date(inv.renewalDate) <= today &&
      inv.status !== "Paid";

    if (filter === "due") return overdue;
    if (filter === "paid") return inv.status === "Paid";
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">📊 Invoice Dashboard</h1>
          <p className="text-gray-400 text-sm">Track and manage invoices</p>
        </div>

        {!user ? (
          <button
            onClick={login}
            className="bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-lg font-semibold"
          >
            🔐 Login
          </button>
        ) : (
          <div className="bg-gray-800 px-4 py-2 rounded-lg text-sm">
            👋 {user.displayName}
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-600/20 border border-red-500 text-red-400 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <p className="text-gray-400">Total</p>
          <h2 className="text-2xl font-bold">{invoices.length}</h2>
        </div>

        <div className="bg-yellow-600/20 border border-yellow-500/30 p-5 rounded-xl">
          <p className="text-yellow-300">Due</p>
          <h2 className="text-2xl font-bold">{dueInvoices.length}</h2>
        </div>

        <div className="bg-green-600/20 border border-green-500/30 p-5 rounded-xl">
          <p className="text-green-300">Paid</p>
          <h2 className="text-2xl font-bold">
            {invoices.filter(i => i.status === "Paid").length}
          </h2>
        </div>
      </div>

      {/* FILTER */}
      <div className="mb-6">
        {["all", "due", "paid"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`mr-3 mb-2 px-4 py-2 rounded-lg ${
              filter === f
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CREATE */}
      {user && (
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl mb-8">
          <h2 className="mb-4 text-lg font-semibold">➕ Create Invoice</h2>

          <div className="grid md:grid-cols-4 gap-3">
            <input
              placeholder="Customer"
              value={form.customer}
              onChange={(e) =>
                setForm({ ...form, customer: e.target.value })
              }
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
            />

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
            />

            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
            />

            <input
              type="date"
              value={form.renewalDate}
              onChange={(e) =>
                setForm({ ...form, renewalDate: e.target.value })
              }
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={creating}
            className="mt-4 bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-semibold"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      )}

      {/* LIST */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredInvoices.map((inv) => {
          const overdue =
            new Date(inv.renewalDate) <= today &&
            inv.status !== "Paid";

          return (
            <div
              key={inv.id}
              className={`p-5 rounded-xl border ${
                overdue
                  ? "bg-red-900/20 border-red-500/30"
                  : "bg-gray-900 border-gray-800"
              }`}
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">{inv.customer}</h3>
                <span className="text-sm">{inv.status}</span>
              </div>

              <p className="text-xl font-bold mt-2">₹{inv.amount}</p>

              <p className="text-xs text-gray-400 mt-2">
                {inv.startDate} → {inv.renewalDate}
              </p>

              <button
                onClick={() => markPaid(inv.id)}
                disabled={inv.status === "Paid"}
                className="mt-3 bg-green-600 px-3 py-1 rounded"
              >
                Mark Paid
              </button>
            </div>
          );
        })}
      </div>

      {filteredInvoices.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No invoices yet
        </p>
      )}
    </div>
  );
}