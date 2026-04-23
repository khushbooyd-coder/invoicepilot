"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [filter, setFilter] = useState("all");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [due, setDue] = useState<any[]>([]);

  const [form, setForm] = useState({
    customer: "",
    price: "",
    startDate: "",
    renewalDate: "",
  });

  // 🔄 Fetch data
  const loadData = () => {
    fetch("http://localhost:5001/invoices")
      .then((res) => res.json())
      .then((data) => setInvoices(data.data || data))
      .catch((err) => console.error(err));

    fetch("http://localhost:5001/check-renewals")
      .then((res) => res.json())
      .then((data) => setDue(data.due))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // ➕ Create invoice
  const handleCreate = () => {
    fetch("http://localhost:5001/add-license", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Invoice created ✅");

        setForm({
          customer: "",
          price: "",
          startDate: "",
          renewalDate: "",
        });

        loadData();
      })
      .catch((err) => console.error(err));
  };

  // 💰 Mark as paid
  const markPaid = (id: number) => {
    fetch(`http://localhost:5001/pay-invoice/${id}`, {
      method: "PUT",
    }).then(() => loadData());
  };
  // 🔍 Filter invoices
    const filteredInvoices = invoices.filter((inv) => {
      const isOverdue =
        new Date(inv.renewalDate) <= new Date() &&
        inv.status !== "Paid";

      if (filter === "due") return isOverdue;
      if (filter === "paid") return inv.status === "Paid";
      return true; // all
    });
      // ⚠️ Due invoices count
    const today = new Date();

      const dueInvoices = invoices.filter(
        (inv) =>
          new Date(inv.renewalDate) <= today &&
          inv.status !== "Paid"
      );
  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        📊 Invoice Dashboard
      </h1>

      {/* 🔴 Due Count */}
      <h2 style={{ marginBottom: "20px", color: "orange" }}>
        ⚠️ Due Invoices: {dueInvoices.length}
      </h2>
        
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
      {/* ➕ CREATE FORM */}
      <div
        style={{
          border: "1px solid #444",
          padding: "20px",
          marginBottom: "20px",
          borderRadius: "10px",
          background: "#111",
          marginRight: "10px" 
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>➕ Create Invoice</h2>

        <input
          placeholder="Customer"
          value={form.customer}
          onChange={(e) =>
            setForm({ ...form, customer: e.target.value })
          }
          style={{ marginRight: "10px", padding: "8px" }}
        />

        <input
          placeholder="Price"
          type="number"
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

     {/* 📦 INVOICE LIST */}
      {invoices.length === 0 ? (
        <p>No invoices found</p>
      ) : (
        filteredInvoices.map((inv) => {
          const isOverdue =
          new Date(inv.renewalDate) <= new Date() &&
          inv.status !== "Paid";

          return (
            <div
              key={inv.id}
              style={{
                border: isOverdue ? "2px solid red" : "1px solid #444",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "10px",
                background: isOverdue ? "#2a0f0f" : "#111",
              }}
            >
              <h3>🧾 {inv.customer || "Client"}</h3>
              <p><b>ID:</b> {inv.id}</p>
              <p><b>Amount:</b> ₹{inv.amount}</p>

              <p>
                <b>Status:</b>{" "}
                <span
                  style={{
                    color:
                      inv.status === "Paid" ? "lightgreen" : "orange",
                  }}
                >
                  {inv.status}
                </span>
              </p>

              {/* 🔴 Overdue badge */}
              {isOverdue && (
                <p style={{ color: "red", fontWeight: "bold" }}>
                  ⚠️ Overdue
                </p>
              )}

              <button
                onClick={() => markPaid(inv.id)}
                disabled={inv.status === "Paid"}
                style={{
                  marginTop: "10px",
                  padding: "8px 12px",
                  background:
                    inv.status === "Paid" ? "gray" : "green",
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
        })
      )}
    </div>
  );
}