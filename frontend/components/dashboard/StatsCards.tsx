interface Props {
  total: number;
  paid: number;
  due: number;
}

export default function StatsCards({
  total,
  paid,
  due,
}: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-6">

      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <p className="text-gray-400">Revenue</p>
        <h2 className="text-3xl font-bold text-green-400">
          ₹{total.toFixed(2)}
        </h2>
      </div>

      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <p className="text-gray-400">Paid</p>
        <h2 className="text-3xl font-bold text-blue-400">
          ₹{paid.toFixed(2)}
        </h2>
      </div>

      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <p className="text-gray-400">Pending</p>
        <h2 className="text-3xl font-bold text-red-400">
          ₹{due.toFixed(2)}
        </h2>
      </div>

    </div>
  );
}