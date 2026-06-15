"use client";

interface Props {
  form: {
    customer: string;
    price: string;
    startDate: string;
    renewalDate: string;
  };

  setForm: (value: any) => void;

  handleCreate: () => void;

  creating: boolean;
}

export default function InvoiceForm({
  form,
  setForm,
  handleCreate,
  creating,
}: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">

      <h2 className="text-xl font-bold mb-5">
        Create Invoice
      </h2>

      <div className="grid md:grid-cols-5 gap-4">

        <input
          placeholder="Customer"
          className="bg-zinc-800 rounded-lg p-3"
          value={form.customer}
          onChange={(e) =>
            setForm({
              ...form,
              customer: e.target.value,
            })
          }
        />

        <input
          placeholder="Price"
          type="number"
          className="bg-zinc-800 rounded-lg p-3"
          value={form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price: e.target.value,
            })
          }
        />

        <input
          type="date"
          className="bg-zinc-800 rounded-lg p-3"
          value={form.startDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) =>
            setForm({
              ...form,
              startDate: e.target.value,
            })
          }
        />

        <input
          type="date"
          className="bg-zinc-800 rounded-lg p-3"
          value={form.renewalDate}
          min={
            form.startDate ||
            new Date().toISOString().split("T")[0]
          }
          onChange={(e) =>
            setForm({
              ...form,
              renewalDate: e.target.value,
            })
          }
        />

        <button
          onClick={handleCreate}
          className="bg-blue-600 rounded-lg"
        >
          {creating ? "Creating..." : "Create"}
        </button>

      </div>
    </div>
  );
}