"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import AddCustomerModal from "@/components/customers/AddCustomerModal";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const loadCustomers = async () => {
    try {
      const user = auth.currentUser;

        if (!user) {
          console.log("No logged in user");
          return;
        }

        const token = await user.getIdToken(true);

      const res = await fetch(
        "https://invoicepilot-6g3a.onrender.com/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("Customers API:", data);

      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      loadCustomers();
    }
  });

  return () => unsubscribe();
}, []);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-zinc-400">
          Manage all your customers.
        </p>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg"
        >
          + Add Customer
        </button>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

        <h2 className="text-xl font-semibold mb-6">
          Customer List
        </h2>

        {customers.length === 0 ? (
          <p className="text-zinc-500">
            No customers found.
          </p>
        ) : (
          <div className="space-y-4">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="border border-zinc-700 rounded-lg p-4"
              >
                <h3 className="font-bold text-lg">
                  {customer.name}
                </h3>

                <p>{customer.company}</p>

                <p className="text-zinc-400">
                  {customer.email}
                </p>

                <p>{customer.phone}</p>

                <p>{customer.country}</p>

                <span className="inline-block mt-2 bg-green-600 px-3 py-1 rounded-full text-sm">
                  {customer.status}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

      <AddCustomerModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSaved={loadCustomers}
      />

    </div>
  );
}