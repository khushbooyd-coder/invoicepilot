"use client";

interface InvoiceCardProps {
  inv: any;
  setEditing: (invoice: any) => void;
  markPaid: (id: string) => void;
  deleteInvoice: (id: string) => void;
  downloadInvoice: (inv: any) => void;
}

export default function InvoiceCard({
  inv,
  setEditing,
  markPaid,
  deleteInvoice,
  downloadInvoice,
}: InvoiceCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm hover:border-blue-500 transition mb-5">

      <div className="flex justify-between items-start">

        <div>
          <h2 className="text-xl font-semibold">
            {inv.customer}
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            ID: {inv.id}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            inv.status === "Paid"
              ? "bg-green-600"
              : "bg-yellow-600"
          }`}
        >
          {inv.status}
        </span>
      </div>

      <div className="mt-6 space-y-2">

        <p className="text-3xl font-bold text-green-400">
          ₹{Number(inv.price ?? inv.amount).toFixed(2)}
        </p>

        <p className="text-gray-400">
          Start :
          {" "}
          {new Date(inv.startDate).toLocaleDateString("en-IN")}
        </p>

        <p className="text-gray-400">
          Renewal :
          {" "}
          {new Date(inv.renewalDate).toLocaleDateString("en-IN")}
        </p>

      </div>

      <div className="flex flex-wrap gap-3 mt-6">

        <button
          onClick={() => markPaid(inv.id)}
          disabled={inv.status === "Paid"}
          className={`px-4 py-2 rounded-lg ${
            inv.status === "Paid"
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {inv.status === "Paid"
            ? "Paid"
            : "Mark Paid"}
        </button>

        <button
          onClick={() => setEditing(inv)}
          className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg"
        >
          Edit
        </button>

        <button
          onClick={() => deleteInvoice(inv.id)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
        >
          Delete
        </button>

        <button
          onClick={() => downloadInvoice(inv)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          Download PDF
        </button>

      </div>

    </div>
  );
}