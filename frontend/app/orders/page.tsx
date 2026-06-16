"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import AddOrderModal from "@/components/orders/AddOrderModal";
import EditOrderModal from "@/components/orders/EditOrderModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  const loadOrders = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch(
        "https://invoicepilot-6g3a.onrender.com/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Delete this order?")) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      await fetch(
        `https://invoicepilot-6g3a.onrender.com/orders/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadOrders();
    } catch (err) {
      console.error(err);
      alert("Unable to delete order");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) loadOrders();
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-zinc-400">
          Manage all customer orders.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg"
        >
          + Add Order
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

        <h2 className="text-xl font-semibold mb-6">
          Order List
        </h2>

        {orders.length === 0 ? (
          <p className="text-zinc-500">
            No orders found.
          </p>
        ) : (
          <div className="space-y-4">

            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-zinc-700 rounded-lg p-5"
              >
                <h3 className="font-bold text-xl">
                  {order.customerName}
                </h3>

                <p>{order.productName}</p>

                <p>Qty: {order.quantity}</p>

                <p className="text-green-400 font-bold">
                  ₹{order.total}
                </p>

                <span className="inline-block mt-3 bg-blue-600 px-3 py-1 rounded-full text-sm">
                  {order.status}
                </span>

                <div className="flex gap-2 mt-4">

                  <button
                    onClick={() => setEditingOrder(order)}
                    className="bg-yellow-500 px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="bg-red-600 px-3 py-1 rounded"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

      <AddOrderModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSaved={loadOrders}
      />

      <EditOrderModal
        open={editingOrder !== null}
        order={editingOrder}
        onClose={() => setEditingOrder(null)}
        onSaved={loadOrders}
      />

    </div>
  );
}