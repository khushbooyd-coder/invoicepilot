"use client";

interface Props {
  invoices?: any[];
}

export default function RecentInvoices({
  invoices = [],
}: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

      <h2 className="text-xl font-semibold mb-5">
        Recent Invoices
      </h2>

      {invoices.length === 0 ? (

        <p className="text-zinc-500">
          No recent invoices
        </p>

      ) : (

        <div className="space-y-4">

          {invoices.map((invoice) => (

            <div
              key={invoice.id}
              className="flex justify-between items-center border-b border-zinc-800 pb-3"
            >

              <div>

                <p className="font-semibold">
                  {invoice.invoiceNo}
                </p>

                <p className="text-sm text-zinc-400">
                  {invoice.customerName}
                </p>

              </div>

              <div className="text-right">

                <p className="font-semibold">
                  ₹{invoice.grandTotal}
                </p>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    invoice.status === "Paid"
                      ? "bg-green-600"
                      : "bg-yellow-600"
                  }`}
                >
                  {invoice.status}
                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}