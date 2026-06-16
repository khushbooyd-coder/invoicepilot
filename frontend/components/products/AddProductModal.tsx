"use client";

import { useState } from "react";
import { auth } from "@/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddProductModal({
  open,
  onClose,
  onSaved,
}: Props) {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
  });

  if (!open) return null;

  const handleSave = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch(
        "https://invoicepilot-6g3a.onrender.com/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...product,
            price: Number(product.price),
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to save product");
      }

      setProduct({
        name: "",
        description: "",
        price: "",
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Unable to save product");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

      <div className="bg-zinc-900 w-full max-w-lg rounded-xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Add Product
        </h2>

        <div className="space-y-4">

          <input
            placeholder="Product Name"
            value={product.name}
            onChange={(e) =>
              setProduct({
                ...product,
                name: e.target.value,
              })
            }
            className="w-full bg-zinc-800 rounded-lg p-3"
          />

          <textarea
            placeholder="Description"
            value={product.description}
            onChange={(e) =>
              setProduct({
                ...product,
                description: e.target.value,
              })
            }
            className="w-full bg-zinc-800 rounded-lg p-3 h-28"
          />

          <input
            type="number"
            placeholder="Price"
            value={product.price}
            onChange={(e) =>
              setProduct({
                ...product,
                price: e.target.value,
              })
            }
            className="w-full bg-zinc-800 rounded-lg p-3"
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
            Save Product
          </button>

        </div>

      </div>

    </div>
  );
}