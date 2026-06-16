"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  order: any;
}

export default function EditOrderModal({
  open,
  onClose,
  onSaved,
  order,
}: Props) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [editedOrder, setEditedOrder] = useState<any>(order);

  useEffect(() => {
    if (!open || !order) return;

    setEditedOrder(order);

    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();

        const [customersRes, productsRes] = await Promise.all([
          fetch(
            "https://invoicepilot-6g3a.onrender.com/customers",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            "https://invoicepilot-6g3a.onrender.com/products",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        setCustomers(await customersRes.json());
        setProducts(await productsRes.json());

      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [open, order]);

  useEffect(() => {
    if (!editedOrder) return;

    setEditedOrder((prev: any) => ({
      ...prev,
      total:
        Number(prev.quantity) *
        Number(prev.price || 0),
    }));
  }, [editedOrder?.quantity]);

  const handleUpdate = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch(
        `https://invoicepilot-6g3a.onrender.com/orders/${editedOrder.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerId: editedOrder.customerId,
            customerName: editedOrder.customerName,
            productId: editedOrder.productId,
            productName: editedOrder.productName,
            quantity: editedOrder.quantity,
            total: editedOrder.total,
            status: editedOrder.status,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Update failed");
      }

      onSaved();
      onClose();

    } catch (err) {
      console.error(err);
      alert("Unable to update order");
    }
  };

  if (!open || !editedOrder) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-zinc-900 rounded-xl w-full max-w-xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Edit Order
        </h2>

        <div className="space-y-4">

          <select
            className="w-full bg-zinc-800 p-3 rounded-lg"
            value={editedOrder.customerId}
            onChange={(e) => {
              const customer = customers.find(
                (c) => c.id === e.target.value
              );

              if (!customer) return;

              setEditedOrder({
                ...editedOrder,
                customerId: customer.id,
                customerName: customer.name,
              });
            }}
          >
            {customers.map((customer) => (
              <option
                key={customer.id}
                value={customer.id}
              >
                {customer.name}
              </option>
            ))}
          </select>

          <select
            className="w-full bg-zinc-800 p-3 rounded-lg"
            value={editedOrder.productId}
            onChange={(e) => {
              const product = products.find(
                (p) => p.id === e.target.value
              );

              if (!product) return;

              setEditedOrder({
                ...editedOrder,
                productId: product.id,
                productName: product.name,
                price: Number(product.price),
                total:
                    Number(product.price) *
                    Number(editedOrder.quantity),
                });
            }}
          >
            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            value={editedOrder.quantity}
            onChange={(e) => {
                const qty = Number(e.target.value);

                setEditedOrder({
                    ...editedOrder,
                    quantity: qty,
                    total: qty * Number(editedOrder.price),
                });
                }}
            className="w-full bg-zinc-800 p-3 rounded-lg"
          />

          <select
            value={editedOrder.status}
            onChange={(e) =>
              setEditedOrder({
                ...editedOrder,
                status: e.target.value,
              })
            }
            className="w-full bg-zinc-800 p-3 rounded-lg"
          >
            <option>Pending</option>
            <option>Paid</option>
            <option>Cancelled</option>
          </select>

          <div className="bg-blue-950 border border-blue-700 rounded-lg p-4">

            <p className="text-zinc-300">
                Order Total
            </p>

            <p className="text-3xl font-bold text-green-400">
                ₹{editedOrder.total?.toFixed(2)}
            </p>

            </div>

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
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Update Order
          </button>

        </div>

      </div>

    </div>
  );
}