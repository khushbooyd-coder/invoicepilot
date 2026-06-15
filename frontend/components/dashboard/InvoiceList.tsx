"use client";

import InvoiceCard from "./InvoiceCard";

interface InvoiceListProps {
  invoices: any[];

  setEditing: (invoice: any) => void;

  markPaid: (id: string) => void;

  deleteInvoice: (id: string) => void;

  downloadInvoice: (invoice: any) => void;
}

export default function InvoiceList({
  invoices,
  setEditing,
  markPaid,
  deleteInvoice,
  downloadInvoice,
}: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
        <h2 className="text-xl font-semibold text-gray-300">
          No invoices found
        </h2>

        <p className="text-gray-500 mt-2">
          Create your first invoice to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {invoices.map((inv) => (
        <InvoiceCard
          key={inv.id}
          inv={inv}
          setEditing={setEditing}
          markPaid={markPaid}
          deleteInvoice={deleteInvoice}
          downloadInvoice={downloadInvoice}
        />
      ))}
    </div>
  );
}