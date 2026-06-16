"use client";

interface Props {
  invoice: any;
  onEdit: (invoice: any) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onDownload: (invoice: any) => void;
}

export default function InvoiceCard({
  invoice,
  onEdit,
  onDelete,
  onMarkPaid,
  onDownload,
}: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-blue-600 transition">

      {/* Header */}

      <div className="flex justify-between items-start">

        <div>

          <h2 className="text-xl font-bold">
            {invoice.invoiceNo}
          </h2>

          <p className="text-zinc-400 mt-1">
            {invoice.customerName}
          </p>

        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            invoice.status === "Paid"
              ? "bg-green-600"
              : "bg-yellow-600"
          }`}
        >
          {invoice.status}
        </span>

      </div>

      {/* Products */}

      <div className="mt-6">

        <h3 className="text-sm uppercase tracking-wide text-zinc-500 mb-3">
          Products
        </h3>

        <div className="space-y-2">

          {invoice.items?.map((item: any, index: number) => (

            <div
              key={index}
              className="flex justify-between text-sm"
            >

              <span>
                {item.productName}
              </span>

              <span>
                {item.quantity} × ₹{item.price}
              </span>

            </div>

          ))}

        </div>

      </div>

      {/* Total */}

      <div className="mt-6 border-t border-zinc-800 pt-4">

        <div className="flex justify-between items-center">

          <span className="text-zinc-400">
            Grand Total
          </span>

          <span className="text-2xl font-bold text-green-400">
            ₹{Number(invoice.grandTotal).toFixed(2)}
          </span>

        </div>

      </div>

      {/* Actions */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">

        <button
          onClick={() => onEdit(invoice)}
          className="bg-yellow-500 hover:bg-yellow-600 rounded-lg py-2"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(invoice.id)}
          className="bg-red-600 hover:bg-red-700 rounded-lg py-2"
        >
          Delete
        </button>

        <button
          disabled={invoice.status === "Paid"}
          onClick={() => onMarkPaid(invoice.id)}
          className={`rounded-lg py-2 ${
            invoice.status === "Paid"
              ? "bg-zinc-700 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {invoice.status === "Paid"
            ? "Paid"
            : "Mark Paid"}
        </button>

        <button
          onClick={() => onDownload(invoice)}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg py-2"
        >
          PDF
        </button>

      </div>

    </div>
  );
}