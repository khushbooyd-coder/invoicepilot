"use client";

interface EditModalProps {
  editing: any;
  setEditing: (invoice: any | null) => void;
  handleUpdate: () => void;
}

export default function EditModal({
  editing,
  setEditing,
  handleUpdate,
}: EditModalProps) {
  if (!editing) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-xl">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Edit Invoice
          </h2>

          <button
            onClick={() => setEditing(null)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">

          <input
            className="w-full bg-zinc-800 rounded-lg p-3"
            placeholder="Customer"
            value={editing.customer}
            onChange={(e) =>
              setEditing({
                ...editing,
                customer: e.target.value,
              })
            }
          />

          <input
            type="number"
            className="w-full bg-zinc-800 rounded-lg p-3"
            placeholder="Price"
            value={editing.price ?? ""}
            onChange={(e) =>
              setEditing({
                ...editing,
                price: e.target.value,
              })
            }
          />

          <input
            type="date"
            className="w-full bg-zinc-800 rounded-lg p-3"
            value={editing.startDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) =>
              setEditing({
                ...editing,
                startDate: e.target.value,
              })
            }
          />

          <input
            type="date"
            className="w-full bg-zinc-800 rounded-lg p-3"
            value={editing.renewalDate}
            min={
              editing.startDate ||
              new Date().toISOString().split("T")[0]
            }
            onChange={(e) =>
              setEditing({
                ...editing,
                renewalDate: e.target.value,
              })
            }
          />

        </div>

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={() => setEditing(null)}
            className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}