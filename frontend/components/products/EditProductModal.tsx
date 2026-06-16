"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  product: any;
}

export default function EditProductModal({
  open,
  onClose,
  onSaved,
  product,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: String(product.price || ""),
      });
    }
  }, [product]);

  if (!open || !product) return null;

  const handleUpdate = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch(
        `https://invoicepilot-6g3a.onrender.com/products/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update product");
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Unable to update product");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-zinc-900 w-full max-w-lg rounded-xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Edit Product
        </h2>

        <div className="space-y-4">

          <input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="w-full bg-zinc-800 p-3 rounded-lg"
          />

          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="w-full bg-zinc-800 p-3 rounded-lg h-28"
          />

          <input
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
            className="w-full bg-zinc-800 p-3 rounded-lg"
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
            Update Product
          </button>

        </div>

      </div>

    </div>
  );
}