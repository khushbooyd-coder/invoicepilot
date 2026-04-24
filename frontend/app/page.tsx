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
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      alert(`Welcome ${result.user.displayName}`);
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") return;
      console.error(err);
      alert("Login failed");
    }
  };

  // 🔄 LOAD DATA (USER BASED)
  const loadData = async (currentUser: User) => {
    try {
      const res = await fetch(
        `https://invoicepilot-6g3a.onrender.com/invoices?userId=${currentUser.uid}`
      );
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 FIX: Persist login (VERY IMPORTANT)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadData(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ➕ CREATE
  const handleCreate = async () => {
    if (!user) return alert("Login first");

    await fetch("https://invoicepilot-6g3a.onrender.com/add-license", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...form, userId: user.uid }),
    });

    alert("Invoice created ✅");

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
    await fetch(
      `https://invoicepilot-6g3a.onrender.com/pay-invoice/${id}`,
      { method: "PUT" }
    );
    if (user) loadData(user);
  };

  if (loading) return <p style={{ color: "white" }}>Loading...</p>;

  const today = new Date();

  const filteredInvoices = invoices.filter((inv) => {
    const overdue =
      new Date(inv.renewalDate) <= today &&
      inv.status !== "Paid";

    if (filter === "due") return overdue;
    if (filter === "paid") return inv.status === "Paid";
    return true;
  });

  const dueInvoices = invoices.filter(
    (inv) =>
      new Date(inv.renewalDate) <= today &&
      inv.status !== "Paid"
  );

  return (
    <div style={{ padding: "30px", color: "white" }}>
      
      {/* 🔐 LOGIN */}
      {!user && (
        <button
          onClick={login}
          style={{
            padding: "10px 15px",
            background: "orange",
            border: "none",
            borderRadius: "5px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          🔐 Login with Google
        </button>
      )}

      {/* 👤 USER INFO */}
      {user && (
        <p style={{ marginBottom: "10px" }}>
          👋 {user.displayName}
        </p>
      )}

      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        📊 Invoice Dashboard
      </h1>

      {/* 🔴 DUE COUNT */}
      <h2 style={{ color: "orange" }}>
        ⚠️ Due Invoices: {dueInvoices.length}
      </h2>

      {/* FILTER */}
      <div style={{ marginBottom: "20px" }}>
        {[
          { key: "all", label: `ALL (${invoices.length})` },
          { key: "due", label: `DUE (${dueInvoices.length})` },
          {
            key: "paid",
            label: `PAID (${invoices.filter(i => i.status === "Paid").length})`,
          },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              marginRight: "10px",
              padding: "8px 12px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              background: filter === f.key ? "#2563eb" : "#333",
              color: "white",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* CREATE FORM */}
      {user && (
        <div
          style={{
            border: "1px solid #444",
            padding: "20px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: "#111",
          }}
        >
          <h2>➕ Create Invoice</h2>

          <input
            placeholder="Customer"
            value={form.customer}
            onChange={(e) =>
              setForm({ ...form, customer: e.target.value })
            }
            style={{ marginRight: "10px", padding: "8px" }}
          />

          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
            style={{ marginRight: "10px", padding: "8px" }}
          />

          <input
            type="date"
            value={form.startDate}
            onChange={(e) =>
              setForm({ ...form, startDate: e.target.value })
            }
            style={{ marginRight: "10px", padding: "8px" }}
          />

          <input
            type="date"
            value={form.renewalDate}
            onChange={(e) =>
              setForm({ ...form, renewalDate: e.target.value })
            }
            style={{ marginRight: "10px", padding: "8px" }}
          />

          <button
            onClick={handleCreate}
            style={{
              padding: "8px 12px",
              background: "blue",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              color: "white",
            }}
          >
            Create
          </button>
        </div>
      )}

      {/* LIST */}
      {filteredInvoices.map((inv) => {
        const overdue =
          new Date(inv.renewalDate) <= today &&
          inv.status !== "Paid";

        return (
          <div
            key={inv.id}
            style={{
              border: overdue ? "2px solid red" : "1px solid #444",
              padding: "20px",
              marginBottom: "15px",
              borderRadius: "10px",
              background: overdue ? "#2a0f0f" : "#111",
            }}
          >
            <h3>🧾 {inv.customer}</h3>
            <p><b>ID:</b> {inv.id}</p>
            <p><b>Amount:</b> ₹{inv.amount}</p>

            <p>
              <b>Status:</b>{" "}
              <span style={{
                color: inv.status === "Paid" ? "lightgreen" : "orange",
              }}>
                {inv.status}
              </span>
            </p>

            {overdue && (
              <p style={{ color: "red" }}>⚠️ Overdue</p>
            )}

            <button
              onClick={() => markPaid(inv.id)}
              disabled={inv.status === "Paid"}
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                background: inv.status === "Paid" ? "gray" : "green",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {inv.status === "Paid" ? "Paid" : "Mark as Paid"}
            </button>

            <p><b>Start:</b> {inv.startDate}</p>
            <p><b>Renewal:</b> {inv.renewalDate}</p>
          </div>
        );
      })}
    </div>
  );
}