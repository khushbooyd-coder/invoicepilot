"use client";

import { useState, useEffect } from "react";
import {
  signInWithPopup,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, provider } from "../firebase";
import jsPDF from "jspdf";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [filter, setFilter] = useState("all");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<any | null>(null);

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
      loadData(result.user);
    } catch {
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
  const loadData = async (user: User) => {
    try {
      const token = await user.getIdToken();

      const res = await fetch(
        "https://invoicepilot-6g3a.onrender.com/invoices",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load invoices");
    }
  };

  // ➕ CREATE
  
  const handleCreate = async () => {
  if (!user) return;

  if (!form.customer || !form.price || !form.startDate || !form.renewalDate) {
    setError("Please fill all fields");
    return;
  }

  if (Number(form.price) <= 0) {
    setError("Enter valid price");
    return;
  }

  setCreating(true);
  setError("");

  try {
    const token = await user.getIdToken();

    const start = new Date(form.startDate);
      const end = new Date(form.renewalDate);

      if (end <= start) {
        setError("Renewal date must be after start date");
        setCreating(false);
        return;
      }

      if (start < new Date(new Date().toDateString())) {
        setError("Start date cannot be in the past");
        setCreating(false);
        return;
      }

    const diffDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    const amount = Number(form.price) * (diffDays / 30);

    await fetch("https://invoicepilot-6g3a.onrender.com/add-license", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer: form.customer,
        amount,
        startDate: form.startDate,
        renewalDate: form.renewalDate,
      }),
    });

    setForm({
      customer: "",
      price: "",
      startDate: "",
      renewalDate: "",
    });

    loadData(user);
  } catch (err) {
    console.error(err);
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

  // ✏️ UPDATE
  const handleUpdate = async () => {
  if (!user || !editing) return;

  try {
    const token = await user.getIdToken();

    const start = new Date(editing.startDate);
      const end = new Date(editing.renewalDate);

      if (end <= start) {
        setError("Invalid date range");
        return;
      }

    const diffDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    const amount = Number(editing.price) * (diffDays / 30);

    await fetch(
      `https://invoicepilot-6g3a.onrender.com/update-invoice/${editing.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer: editing.customer,
          price: Number(editing.price), // ✅ IMPORTANT
          amount,
          startDate: editing.startDate,
          renewalDate: editing.renewalDate,
        }),
      }
    );

    setEditing(null);
    loadData(user);
  } catch {
    setError("Update failed");
  }
};

  // 🗑 DELETE
  const deleteInvoice = async (id: string) => {
    if (!user) return;

    if (!confirm("Delete this invoice?")) return;

    try {
      const token = await user.getIdToken();

      await fetch(
        `https://invoicepilot-6g3a.onrender.com/delete-invoice/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadData(user);
    } catch {
      setError("Delete failed");
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

  // 📊 STATS
    const total = invoices.reduce(
      (sum, inv) => sum + Number(inv.price ?? inv.amount),
      0
    );

    const paid = invoices
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + Number(i.price ?? i.amount), 0);

    const due = invoices
      .filter((i) => i.status !== "Paid")
      .reduce((sum, i) => sum + Number(i.price ?? i.amount), 0);

      //filtering logic
      const filteredInvoices = invoices.filter((inv) => {
      const overdue =
        new Date(inv.renewalDate) <= today &&
        inv.status !== "Paid";

      if (filter === "due") return overdue;
      if (filter === "paid") return inv.status === "Paid";
      return true;
    });
    
      
      const downloadInvoice = (inv: any) => {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Invoice", 20, 20);

      doc.setFontSize(12);
      doc.text(`Customer: ${inv.customer}`, 20, 40);
      doc.text(`Amount: ₹${inv.price ?? inv.amount}`, 20, 50);
      doc.text(`Status: ${inv.status}`, 20, 60);

      doc.text(`Start: ${inv.startDate}`, 20, 80);
      doc.text(`End: ${inv.renewalDate}`, 20, 90);

      doc.save(`invoice-${inv.id}.pdf`);
    };
        

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">📊 Invoice Dashboard</h1>

        {!user ? (
          <button onClick={login} className="bg-yellow-500 px-4 py-2 rounded">
            Login
          </button>
        ) : (
          <div className="bg-gray-800 px-4 py-2 rounded">
            👋 {user.displayName}
          </div>
        )}
      </div>

      {error && <div className="bg-red-600 p-3 mb-4">{error}</div>}

        {/* 📊 STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-gray-400">Total Revenue</p>
          <p className="text-xl font-bold text-green-400">
            ₹{total.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <p className="text-gray-400">Paid</p>
          <p className="text-xl font-bold text-blue-400">
            ₹{paid.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <p className="text-gray-400">Pending</p>
          <p className="text-xl font-bold text-red-400">
            ₹{due.toFixed(2)}
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div className="mb-6">
        {["all", "due", "paid"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`mr-3 px-4 py-2 rounded ${
              filter === f ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CREATE */}
      
      {user && (
        <div className="mb-6">
          <input className="bg-gray-800 border border-gray-600 p-2 mr-2 rounded" placeholder="Customer" value={form.customer}
            onChange={(e)=>setForm({...form,customer:e.target.value})} />

          <input className="bg-gray-800 border border-gray-600 p-2 mr-2 rounded" type="number" placeholder="Price" value={form.price}
            onChange={(e)=>setForm({...form,price:e.target.value})} />

          <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={form.startDate}
          onChange={(e) =>
            setForm({ ...form, startDate: e.target.value })
          }
        />

        <input
          type="date"
          min={form.startDate || new Date().toISOString().split("T")[0]}
          value={form.renewalDate}
          onChange={(e) =>
            setForm({ ...form, renewalDate: e.target.value })
          }
        />
          <button onClick={handleCreate} 
          className="bg-blue-600 px-4 py-2 rounded ml-2">
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      )}

      {/* LIST */}
      {filteredInvoices.length === 0 && (
        <p>No invoices found</p>
      )}

      {filteredInvoices.map((inv) => (
      <div
        key={inv.id}
        className="bg-gray-900 border border-gray-700 p-4 rounded-lg mb-4"
      >
        <h3 className="text-lg font-semibold">{inv.customer}</h3>

        <p className="text-sm text-gray-400">ID: {inv.id}</p>

        <p className="text-green-400 font-bold">
          ₹{Number(inv.price ?? inv.amount).toFixed(2)}
        </p>
        <p className="text-sm text-yellow-400">
          {inv.status}
        </p>

        <p className="text-sm text-gray-400">
        {new Date(inv.startDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })} → {new Date(inv.renewalDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </p>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => markPaid(inv.id)}
            disabled={inv.status === "Paid"}
            className={`px-3 py-1 rounded ${
              inv.status === "Paid"
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600"
            }`}
          >
            {inv.status === "Paid" ? "Paid" : "Mark Paid"}
          </button>

          <button
            onClick={() => setEditing(inv)}
            className="bg-yellow-500 px-3 py-1 rounded"
          >
            Edit
          </button>

          <button
            onClick={() => deleteInvoice(inv.id)}
            className="bg-red-600 px-3 py-1 rounded"
          >
            Delete
          </button>

          {/* ✅ ADD THIS */}
          <button
            onClick={() => downloadInvoice(inv)}
            className="bg-blue-500 px-3 py-1 rounded"
          >
            PDF
          </button>
        </div>
      </div>
      ))}

      {/* EDIT */}
      {editing && (
  <div className="mt-6 p-4 bg-gray-800 rounded">
    <h3 className="mb-3">Edit Invoice</h3>

    <input
      className="mr-2 p-2 bg-gray-700"
      value={editing.customer}
      onChange={(e) =>
        setEditing({ ...editing, customer: e.target.value })
      }
    />

    <input
      className="mr-2 p-2 bg-gray-700"
      type="number"
      placeholder="Price"
      value={editing.price ?? ""}
      onChange={(e) =>
        setEditing({ ...editing, price: e.target.value })
      }
    />

    <input
      type="date"
      className="mr-2 p-2 bg-gray-700"
      value={editing.startDate}
      min={new Date().toISOString().split("T")[0]}
      onChange={(e) =>
        setEditing({ ...editing, startDate: e.target.value })
      }
    />

    <input
      type="date"
      className="mr-2 p-2 bg-gray-700"
      value={editing.renewalDate}
      min={editing.startDate || new Date().toISOString().split("T")[0]}
      onChange={(e) =>
        setEditing({ ...editing, renewalDate: e.target.value })
      }
    />

    <button
      className="bg-green-600 px-4 py-2 rounded ml-2"
      onClick={handleUpdate}
    >
      Update
    </button>
  </div>
)}

    </div>
  );
}