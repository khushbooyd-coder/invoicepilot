"use client";

import Link from "next/link";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Customer",
      href: "/customers",
    },
    {
      title: "Add Product",
      href: "/products",
    },
    {
      title: "Create Order",
      href: "/orders",
    },
    {
      title: "Create Invoice",
      href: "/invoices",
    },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

      <h2 className="text-xl font-semibold mb-5">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {actions.map((action) => (

          <Link
            key={action.title}
            href={action.href}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg p-4 text-center font-semibold transition"
          >
            {action.title}
          </Link>

        ))}

      </div>

    </div>
  );
}