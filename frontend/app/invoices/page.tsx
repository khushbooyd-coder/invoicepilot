"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import jsPDF from "jspdf";

import AddInvoiceModal from "@/components/invoices/AddInvoiceModal";
import EditInvoiceModal from "@/components/invoices/EditInvoiceModal";
import InvoiceCard from "@/components/invoices/InvoiceCard";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  const loadInvoices = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken(true);

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
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadInvoices();
      }
    });

    return () => unsubscribe();
  }, []);

  const deleteInvoice = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

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

      loadInvoices();
    } catch (err) {
      console.error(err);
      alert("Unable to delete invoice");
    }
  };

  const markPaid = async (id: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

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

      loadInvoices();
    } catch (err) {
      console.error(err);
      alert("Unable to update invoice");
    }
  };

  const downloadInvoice = (invoice: any) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("InvoicePilot", 20, 20);

    doc.setFontSize(14);
    doc.text(`Invoice: ${invoice.invoiceNo}`, 20, 40);
    doc.text(`Customer: ${invoice.customerName}`, 20, 50);

    let y = 70;

    doc.text("Products", 20, y);

    y += 10;

    invoice.items?.forEach((item: any) => {
      doc.text(
        `${item.productName}  x${item.quantity}  ₹${item.total}`,
        20,
        y
      );

      y += 10;
    });

    y += 10;

    doc.text(
      `Subtotal : ₹${invoice.subtotal}`,
      20,
      y
    );

    y += 10;

    doc.text(
      `GST : ${invoice.tax}%`,
      20,
      y
    );

    y += 10;

    doc.text(
      `Discount : ₹${invoice.discount}`,
      20,
      y
    );

    y += 15;

    doc.setFontSize(16);

    doc.text(
      `Grand Total : ₹${invoice.grandTotal}`,
      20,
      y
    );

    doc.save(`${invoice.invoiceNo}.pdf`);
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold">
            Invoices
          </h1>

          <p className="text-zinc-400">
            Manage all generated invoices.
          </p>

        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg"
        >
          + Create Invoice
        </button>

      </div>

      {invoices.length === 0 ? (

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">

          <p className="text-zinc-500">
            No invoices found.
          </p>

        </div>

      ) : (

        <div className="grid lg:grid-cols-2 gap-6">

          {invoices.map((invoice) => (

            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onEdit={setEditingInvoice}
              onDelete={deleteInvoice}
              onMarkPaid={markPaid}
              onDownload={downloadInvoice}
            />

          ))}

        </div>

      )}

      <AddInvoiceModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSaved={loadInvoices}
      />

      <EditInvoiceModal
        open={editingInvoice !== null}
        invoice={editingInvoice}
        onClose={() => setEditingInvoice(null)}
        onSaved={loadInvoices}
      />

    </div>
  );
}