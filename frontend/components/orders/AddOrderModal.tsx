"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddOrderModal({
  open,
  onClose,
  onSaved,
}: Props) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [order, setOrder] = useState({
    customerId: "",
    customerName: "",
    productId: "",
    productName: "",
    price: 0,
    quantity: 1,
    total: 0,
    status: "Pending",
  });

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();

        const [customersRes, productsRes] = await Promise.all([
          fetch("https://invoicepilot-6g3a.onrender.com/customers", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("https://invoicepilot-6g3a.onrender.com/products", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setCustomers(await customersRes.json());
        setProducts(await productsRes.json());
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [open]);

  useEffect(() => {
    setOrder((prev) => ({
      ...prev,
      total: Number(prev.price) * Number(prev.quantity),
    }));
  }, [order.price, order.quantity]);

  const handleSave = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch(
        "https://invoicepilot-6g3a.onrender.com/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerId: order.customerId,
            customerName: order.customerName,
            productId: order.productId,
            productName: order.productName,
            quantity: order.quantity,
            total: order.total,
            status: order.status,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to save order");
      }

      setOrder({
        customerId: "",
        customerName: "",
        productId: "",
        productName: "",
        price: 0,
        quantity: 1,
        total: 0,
        status: "Pending",
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Unable to save order");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl w-full max-w-xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Add Order
        </h2>

        <div className="space-y-4">

          <select
            className="w-full bg-zinc-800 p-3 rounded-lg"
            value={order.customerId}
            onChange={(e) => {
              const customer = customers.find(
                (c) => c.id === e.target.value
              );

              if (!customer) return;

              setOrder({
                ...order,
                customerId: customer.id,
                customerName: customer.name,
              });
            }}
          >
            <option value="">Select Customer</option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          <select
            className="w-full bg-zinc-800 p-3 rounded-lg"
            value={order.productId}
            onChange={(e) => {
              const product = products.find(
                (p) => p.id === e.target.value
              );

              if (!product) return;

              setOrder({
                ...order,
                productId: product.id,
                productName: product.name,
                price: Number(product.price),
              });
            }}
          >
            <option value="">Select Product</option>

            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          <div className="bg-zinc-800 p-3 rounded-lg">
            <p className="text-sm text-zinc-400">
                Product Price
            </p>

            <p className="text-xl font-bold text-green-400">
                ₹{order.price}
            </p>
            </div>

          <input
            type="number"
            min={1}
            placeholder="Quantity"
            value={order.quantity}
            onChange={(e) =>
              setOrder({
                ...order,
                quantity: Number(e.target.value),
              })
            }
            className="w-full bg-zinc-800 p-3 rounded-lg"
          />

          <div className="bg-blue-950 border border-blue-700 rounded-lg p-4">

            <p className="text-zinc-300">
                Order Total
            </p>

            <p className="text-3xl font-bold text-green-400">
                ₹{order.total.toFixed(2)}
            </p>

            </div>

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
            Save Order
          </button>

        </div>

      </div>
    </div>
  );
}