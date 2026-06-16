"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import AddProductModal from "@/components/products/AddProductModal";
import EditProductModal from "@/components/products/EditProductModal";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const loadProducts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch(
        "https://invoicepilot-6g3a.onrender.com/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      await fetch(
        `https://invoicepilot-6g3a.onrender.com/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Unable to delete product");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) loadProducts();
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-zinc-400">
          Manage all your software products.
        </p>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

        <h2 className="text-xl font-semibold mb-6">
          Product List
        </h2>

        {products.length === 0 ? (
          <p className="text-zinc-500">No products found.</p>
        ) : (
          <div className="space-y-4">

            {products.map((product) => (
              <div
                key={product.id}
                className="border border-zinc-700 rounded-lg p-4"
              >

                <h3 className="text-xl font-bold">
                  {product.name}
                </h3>

                <p className="text-zinc-400">
                  {product.description}
                </p>

                <p className="text-green-400 font-semibold mt-2">
                  ₹{product.price}
                </p>

                <div className="flex gap-2 mt-4">

                  <button
                    onClick={() => setEditingProduct(product)}
                    className="bg-yellow-500 px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteProduct(product.id)}
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

      <AddProductModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSaved={loadProducts}
      />

      <EditProductModal
        open={editingProduct !== null}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSaved={loadProducts}
      />

    </div>
  );
}