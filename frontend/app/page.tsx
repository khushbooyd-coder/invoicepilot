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

  const [form, setForm] = useState({
    customer: "",
    price: "",
    startDate: "",
    renewalDate: "",
  });

  // 🔐 LOGIN
  const login = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
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
  };

  // ➕ CREATE
  const handleCreate = async () => {
    if (!user) return;

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
  };

  // 💰 PAY
  const markPaid = async (id: string) => {
    const token = await user?.getIdToken();

    await fetch(
      `https://invoicepilot-6g3a.onrender.com/pay-invoice/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (user) loadData(user);
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
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          📊 Invoice Dashboard
        </h1>

        {!user ? (
          <button
            onClick={login}
            className="bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-lg font-semibold"
          >
            Login
          </button>
        ) : (
          <div className="text-sm text-gray-300">
            👋 {user.displayName}
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-xl shadow">
          <p className="text-gray-400">Total</p>
          <h2 className="text-xl">{invoices.length}</h2>
        </div>
        <div className="bg-yellow-600 p-4 rounded-xl shadow">
          <p>Due</p>
          <h2 className="text-xl">{dueInvoices.length}</h2>
        </div>
        <div className="bg-green-600 p-4 rounded-xl shadow">
          <p>Paid</p>
          <h2 className="text-xl">
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
            className={`mr-3 px-4 py-2 rounded-lg ${
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
        <div className="bg-gray-800 p-6 rounded-xl mb-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold">
            ➕ Create Invoice
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Customer"
              value={form.customer}
              onChange={(e) =>
                setForm({ ...form, customer: e.target.value })
              }
              className="input"
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              className="input"
            />
            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
              className="input"
            />
            <input
              type="date"
              value={form.renewalDate}
              onChange={(e) =>
                setForm({ ...form, renewalDate: e.target.value })
              }
              className="input"
            />
          </div>

          <button
            onClick={handleCreate}
            className="mt-4 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
          >
            Create
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
              className={`p-4 rounded-xl shadow ${
                overdue
                  ? "bg-red-900 border border-red-500"
                  : "bg-gray-800"
              }`}
            >
              <h3 className="font-semibold text-lg">
                {inv.customer}
              </h3>

              <p>₹{inv.amount}</p>

              <p
                className={`text-sm ${
                  inv.status === "Paid"
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {inv.status}
              </p>

              {overdue && (
                <p className="text-red-400 text-sm">
                  ⚠️ Overdue
                </p>
              )}

              <button
                onClick={() => markPaid(inv.id)}
                disabled={inv.status === "Paid"}
                className="mt-2 px-3 py-1 bg-green-600 rounded"
              >
                Mark Paid
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}