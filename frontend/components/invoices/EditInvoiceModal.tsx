"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import InvoiceItem from "./InvoiceItem";

interface Props {
  open: boolean;
  invoice: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditInvoiceModal({
  open,
  invoice: currentInvoice,
  onClose,
  onSaved,
}: Props) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    if (!open || !currentInvoice) return;

    setInvoice({
  ...currentInvoice,
  items: currentInvoice.items ?? [],
  tax: currentInvoice.tax ?? 18,
  discount: currentInvoice.discount ?? 0,
  subtotal: currentInvoice.subtotal ?? 0,
  grandTotal: currentInvoice.grandTotal ?? 0,
});

    const loadData = async () => {
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
    };

    loadData();
  }, [open, currentInvoice]);

  
useEffect(() => {
  if (!invoice) return;

  const subtotal = (invoice.items ?? []).reduce(
    (sum: number, item: any) => sum + item.total,
    0
  );

  const taxAmount = subtotal * ((invoice.tax ?? 0) / 100);

  const grandTotal =
    subtotal +
    taxAmount -
    (invoice.discount ?? 0);

  setInvoice((prev: any) => ({
    ...prev,
    subtotal,
    grandTotal,
  }));
}, [
  invoice,
  invoice?.items,
  invoice?.tax,
  invoice?.discount,
]);
if (!open || !invoice) return null;

const updateItem = (
  index: number,
  field: string,
  value: any
) => {
  const items = [...invoice.items];

  if (field === "productId") {

    const product = products.find(
      (p) => p.id === value
    );

    if (!product) return;

    items[index] = {
      ...items[index],
      productId: product.id,
      productName: product.name,
      price: Number(product.price),
      total:
        Number(product.price) *
        items[index].quantity,
    };

  }

  if (field === "quantity") {

    items[index].quantity = Number(value);

    items[index].total =
      items[index].price *
      Number(value);

  }

  setInvoice({
    ...invoice,
    items,
  });
};

const addItem = () => {

  setInvoice({
    ...invoice,
    items: [
      ...invoice.items,
      {
        productId: "",
        productName: "",
        price: 0,
        quantity: 1,
        total: 0,
      },
    ],
  });

};

const removeItem = (index: number) => {

  setInvoice({
    ...invoice,
    items: invoice.items.filter(
      (_: any, i: number) => i !== index
    ),
  });

};

const handleUpdate = async () => {

  try {

    const user = auth.currentUser;

    if (!user) return;

    const token = await user.getIdToken();

    const res = await fetch(
      `https://invoicepilot-6g3a.onrender.com/update-invoice/${invoice.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoice),
      }
    );

    if (!res.ok) {
      throw new Error("Update failed");
    }

    onSaved();
    onClose();

  } catch (err) {
    console.error(err);
    alert("Unable to update invoice");
  }

};
return (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 overflow-y-auto">

    <div className="bg-zinc-900 rounded-2xl w-full max-w-5xl border border-zinc-800">

      {/* Header */}

      <div className="border-b border-zinc-800 p-6">

        <h2 className="text-3xl font-bold">
          Edit Invoice
        </h2>

        <p className="text-zinc-400 mt-1">
          {invoice.invoiceNo}
        </p>

      </div>

      <div className="p-6 space-y-6">

        {/* Customer */}

        <div>

          <label className="block text-sm text-zinc-400 mb-2">
            Customer
          </label>

          <select
            value={invoice.customerId}
            onChange={(e) => {

              const customer = customers.find(
                (c) => c.id === e.target.value
              );

              if (!customer) return;

              setInvoice({
                ...invoice,
                customerId: customer.id,
                customerName: customer.name,
              });

            }}
            className="w-full bg-zinc-800 rounded-lg p-3"
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

        </div>

        {/* Products */}

        <div className="space-y-5">

          <div className="flex justify-between items-center">

            <h3 className="text-xl font-semibold">
              Products
            </h3>

            <button
              onClick={addItem}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              + Add Product
            </button>

          </div>

          {invoice.items.map((item: any, index: number) => (

            <InvoiceItem
              key={index}
              item={item}
              index={index}
              products={products}
              updateItem={updateItem}
              removeItem={removeItem}
            />

          ))}

        </div>

        {/* Tax & Discount */}

        <div className="grid md:grid-cols-2 gap-6">

          <div>

            <label className="block text-sm text-zinc-400 mb-2">
              GST (%)
            </label>

            <input
              type="number"
              value={invoice.tax}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  tax: Number(e.target.value),
                })
              }
              className="w-full bg-zinc-800 rounded-lg p-3"
            />

          </div>

          <div>

            <label className="block text-sm text-zinc-400 mb-2">
              Discount (₹)
            </label>

            <input
              type="number"
              value={invoice.discount}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  discount: Number(e.target.value),
                })
              }
              className="w-full bg-zinc-800 rounded-lg p-3"
            />

          </div>

        </div>

        {/* Summary */}

        <div className="bg-zinc-800 rounded-xl p-6 space-y-3">

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{invoice.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>GST ({invoice.tax}%)</span>
            <span>
              ₹{(invoice.subtotal * invoice.tax / 100).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Discount</span>
            <span>₹{invoice.discount.toFixed(2)}</span>
          </div>

          <hr className="border-zinc-700"/>

          <div className="flex justify-between text-2xl font-bold text-green-400">

            <span>Grand Total</span>

            <span>
              ₹{invoice.grandTotal.toFixed(2)}
            </span>

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="bg-zinc-700 hover:bg-zinc-600 px-6 py-3 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg"
          >
            Update Invoice
          </button>

        </div>

      </div>

    </div>

  </div>
);
}