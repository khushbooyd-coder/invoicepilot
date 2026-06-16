"use client";

interface InvoiceItemProps {
  item: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    total: number;
  };
  index: number;
  products: any[];
  updateItem: (
    index: number,
    field: string,
    value: any
  ) => void;
  removeItem: (index: number) => void;
}

export default function InvoiceItem({
  item,
  index,
  products,
  updateItem,
  removeItem,
}: InvoiceItemProps) {
  return (
    <div className="border border-zinc-700 rounded-lg p-4 space-y-4">

      <div>

        <label className="text-sm text-zinc-400">
          Product
        </label>

        <select
          value={item.productId}
          onChange={(e) =>
            updateItem(index, "productId", e.target.value)
          }
          className="w-full mt-1 bg-zinc-800 rounded-lg p-3"
        >
          <option value="">
            Select Product
          </option>

          {products.map((product) => (
            <option
              key={product.id}
              value={product.id}
            >
              {product.name}
            </option>
          ))}
        </select>

      </div>

      <div className="grid grid-cols-3 gap-4">

        <div>

          <label className="text-sm text-zinc-400">
            Price
          </label>

          <input
            disabled
            value={item.price}
            className="w-full mt-1 bg-zinc-700 rounded-lg p-3"
          />

        </div>

        <div>

          <label className="text-sm text-zinc-400">
            Quantity
          </label>

          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) =>
              updateItem(
                index,
                "quantity",
                e.target.value
              )
            }
            className="w-full mt-1 bg-zinc-800 rounded-lg p-3"
          />

        </div>

        <div>

          <label className="text-sm text-zinc-400">
            Total
          </label>

          <input
            disabled
            value={item.total}
            className="w-full mt-1 bg-zinc-700 rounded-lg p-3"
          />

        </div>

      </div>

      <div className="flex justify-end">

        <button
          onClick={() => removeItem(index)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
        >
          Remove
        </button>

      </div>

    </div>
  );
}