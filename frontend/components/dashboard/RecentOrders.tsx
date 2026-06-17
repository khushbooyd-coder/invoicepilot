interface Props {
  orders?: any[];
}

export default function RecentOrders({
  orders = [],
}: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

      <h2 className="text-2xl font-bold mb-6">
        Recent Orders
      </h2>

      {orders.length === 0 ? (

        <p className="text-zinc-500">
          No recent orders
        </p>

      ) : (

        <div className="space-y-5">

          {orders.map((order) => (

            <div
              key={order.id}
              className="flex justify-between items-center border-b border-zinc-800 pb-4"
            >

              <div>

                <p className="font-semibold">
                  {order.customerName}
                </p>

                <p className="text-sm text-zinc-500">
                  {order.productName}
                </p>

              </div>

              <div className="text-right">

                <p className="font-semibold text-green-400">
                  ₹{order.total}
                </p>

                <p className="text-xs text-zinc-500">
                  Qty {order.quantity}
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}