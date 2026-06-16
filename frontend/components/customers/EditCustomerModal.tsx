"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase";

interface Props {
  customer: any;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditCustomerModal({
  customer,
  open,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState(customer);

  useEffect(() => {
    setForm(customer);
  }, [customer]);

  if (!open || !customer) return null;

  const handleUpdate = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch(
        `https://invoicepilot-6g3a.onrender.com/customers/${customer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        throw new Error("Update failed");
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Unable to update customer");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-zinc-900 rounded-xl w-full max-w-xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Edit Customer
        </h2>

        <div className="space-y-4">

          <input
            className="w-full bg-zinc-800 p-3 rounded-lg"
            value={form?.name || ""}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="w-full bg-zinc-800 p-3 rounded-lg"
            value={form?.company || ""}
            onChange={(e) =>
              setForm({ ...form, company: e.target.value })
            }
          />

          <input
            className="w-full bg-zinc-800 p-3 rounded-lg"
            value={form?.email || ""}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            className="w-full bg-zinc-800 p-3 rounded-lg"
            value={form?.phone || ""}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <input
            className="w-full bg-zinc-800 p-3 rounded-lg"
            value={form?.country || ""}
            onChange={(e) =>
              setForm({ ...form, country: e.target.value })
            }
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="bg-zinc-700 px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Update Customer
          </button>

        </div>

      </div>

    </div>
  );
}