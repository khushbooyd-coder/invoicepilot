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
          body: JSON.stringify({
          customer: form.customer,
          amount: Number(form.price), // ✅ FIX
          startDate: form.startDate,
          renewalDate: form.renewalDate,
        }),
        }
      );

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
          amount: Number(editing.price), // ✅ FIX
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

          <input className="bg-gray-800 border border-gray-600 p-2 mr-2 rounded" type="date" value={form.startDate}
            onChange={(e)=>setForm({...form,startDate:e.target.value})} />

          <input className="bg-gray-800 border border-gray-600 p-2 mr-2 rounded" type="date" value={form.renewalDate}
            onChange={(e)=>setForm({...form,renewalDate:e.target.value})} />

          <button onClick={handleCreate}>
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      )}

      {/* LIST */}
      {filteredInvoices.length === 0 && (
        <p>No invoices found</p>
      )}

      {filteredInvoices.map((inv) => (
        <div key={inv.id}>
          <h3>{inv.customer}</h3>
          <p>₹{inv.amount}</p>

          <button onClick={()=>markPaid(inv.id)}>Paid</button>
          <button onClick={()=>setEditing(inv)}>Edit</button>
          <button onClick={()=>deleteInvoice(inv.id)}>Delete</button>
        </div>
      ))}

      {/* EDIT */}
      {editing && (
        <div>
          <input value={editing.customer}
            onChange={(e)=>setEditing({...editing,customer:e.target.value})} />

          <input value={editing.price}
            onChange={(e)=>setEditing({...editing,price:e.target.value})} />

          <button onClick={handleUpdate}>Update</button>
        </div>
      )}

    </div>
  );
}