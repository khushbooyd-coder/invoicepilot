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

    // ✅ SAFETY CHECK
    if (Array.isArray(data)) {
      setInvoices(data);
    } else {
      setInvoices([]);
      setError("Invalid data from server");
    }

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

  // ✏️ UPDATE
  const handleUpdate = async () => {
  if (!user || !editing) return;

  try {
    const token = await user.getIdToken();
console.log("Sending update:", editing);
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
          price: Number(editing.price),
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
  // 🗑️ DELETE
  const deleteInvoice = async (id: string) => {
    if (!user) return;

    if (!confirm("Delete this invoice?")) return;

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
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  const today = new Date();

  const dueInvoices = Array.isArray(invoices)
  ? invoices.filter(
      (inv) =>
        new Date(inv.renewalDate) <= today &&
        inv.status !== "Paid"
    )
  : [];

  const filteredInvoices = Array.isArray(invoices)
  ? invoices.filter((inv) => {
      const overdue =
        new Date(inv.renewalDate) <= today &&
        inv.status !== "Paid";

      if (filter === "due") return overdue;
      if (filter === "paid") return inv.status === "Paid";
      return true;
    })
  : [];

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📊 Invoice Dashboard</h1>

        {!user ? (
          <button
            onClick={login}
            className="bg-yellow-500 px-4 py-2 rounded-lg"
          >
            Login
          </button>
        ) : (
          <div className="bg-gray-800 px-4 py-2 rounded">
            👋 {user.displayName}
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-600 p-3 rounded mb-4">{error}</div>
      )}

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded">Total: {invoices.length}</div>
        <div className="bg-yellow-700 p-4 rounded">Due: {dueInvoices.length}</div>
        <div className="bg-green-700 p-4 rounded">
          Paid: {invoices.filter(i => i.status === "Paid").length}
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
        <div className="bg-gray-900 p-4 rounded mb-6">
          <input placeholder="Customer" value={form.customer}
            onChange={(e)=>setForm({...form,customer:e.target.value})} className="mr-2 p-2" />

          <input type="number" placeholder="Price" value={form.price}
            onChange={(e)=>setForm({...form,price:e.target.value})} className="mr-2 p-2" />

          <input type="date" value={form.startDate}
            onChange={(e)=>setForm({...form,startDate:e.target.value})} className="mr-2 p-2" />

          <input type="date" value={form.renewalDate}
            onChange={(e)=>setForm({...form,renewalDate:e.target.value})} className="mr-2 p-2" />

          <button onClick={handleCreate} className="bg-blue-600 px-3 py-2 rounded">
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      )}

      {/* LIST */}
<div className="grid md:grid-cols-2 gap-4">
  {Array.isArray(filteredInvoices) &&
    filteredInvoices.map((inv) => {
      const overdue =
        new Date(inv.renewalDate) <= today &&
        inv.status !== "Paid";

      return (
        <div
          key={inv.id}
          className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{inv.customer}</h3>
            <span
              className={`text-xs px-2 py-1 rounded ${
                inv.status === "Paid"
                  ? "bg-green-600"
                  : "bg-yellow-600"
              }`}
            >
              {inv.status}
            </span>
          </div>

          <p className="text-2xl font-bold mt-2">₹{inv.amount}</p>

          <p className="text-xs text-gray-400 mt-1">
            {inv.startDate} → {inv.renewalDate}
          </p>

          {/* OPTIONAL overdue */}
          {overdue && (
            <p className="text-red-400 text-xs mt-1">
              ⚠️ Overdue
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => markPaid(inv.id)}
              disabled={inv.status === "Paid"}
              className={`px-3 py-1 rounded text-sm ${
                inv.status === "Paid"
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-500"
              }`}
            >
              Paid
            </button>

            <button
              onClick={() => setEditing(inv)}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm"
            >
              Edit
            </button>

            <button
              onClick={() => deleteInvoice(inv.id)}
              className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      );
    })}
</div>

{/* EMPTY STATE */}
{Array.isArray(filteredInvoices) && filteredInvoices.length === 0 && (
  <p className="text-center text-gray-400 mt-6">
    No invoices found
  </p>
)}
      

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded ">
           <input
              value={editing?.customer || ""}
              onChange={(e)=>setEditing({...editing,customer:e.target.value})}
              className="w-full mb-2 p-2"
            />

            <input
              type="number"
              value={editing?.price || ""}
              onChange={(e)=>setEditing({...editing,price:e.target.value})}
              className="w-full mb-2 p-2"
            />

            <input type="date" value={editing.startDate}
              onChange={(e)=>setEditing({...editing,startDate:e.target.value})} className="w-full mb-2 p-2" />

            <input type="date" value={editing.renewalDate}
              onChange={(e)=>setEditing({...editing,renewalDate:e.target.value})} className="w-full mb-2 p-2" />

            <button onClick={handleUpdate} className="bg-blue-600 px-3 py-2 mr-2">
              Update
            </button>

            <button onClick={()=>setEditing(null)} className="bg-gray-600 px-3 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    
  );
}