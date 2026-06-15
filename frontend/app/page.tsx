"use client";
import Layout from "@/components/Layout";
import StatsCards from "@/components/dashboard/StatsCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import InvoiceForm from "@/components/dashboard/InvoiceForm";
import InvoiceList from "@/components/dashboard/InvoiceList";
import EditModal from "@/components/dashboard/EditModal";


import { useState, useEffect } from "react";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
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

  // 🔓 LOGOUT
  const logout = async () => {
  await signOut(auth);
  setUser(null);
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
  <Layout
    user={user}
    logout={logout}
  >
    <div className="max-w-7xl mx-auto">

      

      {error && <div className="bg-red-600 p-3 mb-4">{error}</div>}

        {/* STATS */}
        <StatsCards
      total={total}
      paid={paid}
      due={due}
    />

    <RevenueChart />

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
        <InvoiceForm
          form={form}
          setForm={setForm}
          handleCreate={handleCreate}
          creating={creating}
        />
      )}

      {/* LIST */}
      <InvoiceList
        invoices={filteredInvoices}
        setEditing={setEditing}
        markPaid={markPaid}
        deleteInvoice={deleteInvoice}
        downloadInvoice={downloadInvoice}
      />

      {/* EDIT */}
      <EditModal
      editing={editing}
      setEditing={setEditing}
      handleUpdate={handleUpdate}
    />

    </div>
    </Layout>
  );
}