"use client";
import { useState } from "react";
import { auth } from "@/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddCustomerModal({
  open,
  onClose,
  onSaved,
}: Props) {
  if (!open) return null;
  const [customer, setCustomer] = useState({
  name: "",
  company: "",
  email: "",
  phone: "",
  country: "",
});

const handleSave = async () => {
  try {
    const user = auth.currentUser;

    if (!user) return;

    const token = await user.getIdToken();

    const res = await fetch(
      "https://invoicepilot-6g3a.onrender.com/customers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customer),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to save customer");
    }

    setCustomer({
      name: "",
      company: "",
      email: "",
      phone: "",
      country: "",
    });

    onSaved();
    onClose();

  } catch (err) {
    console.error(err);
    alert("Unable to save customer");
  }
};

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-zinc-900 rounded-xl w-full max-w-xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Add Customer
        </h2>

        <div className="space-y-4">

          <input
            placeholder="Customer Name"
            value={customer.name}
            onChange={(e) =>
                setCustomer({
                ...customer,
                name: e.target.value,
                })
            }
            className="w-full bg-zinc-800 p-3 rounded-lg"
            />

          <input
            placeholder="Company"
            value={customer.company}
            onChange={(e) =>
                setCustomer({
                ...customer,
                company: e.target.value,
                })
            }
            className="w-full bg-zinc-800 p-3 rounded-lg"
          />

          <input
            placeholder="Email"
            value={customer.email}
            onChange={(e) =>
                setCustomer({
                ...customer,
                email: e.target.value,
                })
            }
            className="w-full bg-zinc-800 p-3 rounded-lg"
          />

          <input
            placeholder="Phone"
            value={customer.phone}
            onChange={(e) =>
                setCustomer({
                ...customer,
                phone: e.target.value,
                })
            }
            className="w-full bg-zinc-800 p-3 rounded-lg"
          />

          <input
            placeholder="Country"
            value={customer.country}
            onChange={(e) =>
                setCustomer({
                ...customer,
                country: e.target.value,
                })
            }
            className="w-full bg-zinc-800 p-3 rounded-lg"
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-700"
          >
            Cancel
          </button>

          <button
             onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
          >
            Save Customer
          </button>

        </div>

      </div>

    </div>
  );
}