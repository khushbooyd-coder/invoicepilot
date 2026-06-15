"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", revenue: 15000 },
  { month: "Feb", revenue: 21000 },
  { month: "Mar", revenue: 17000 },
  { month: "Apr", revenue: 26000 },
  { month: "May", revenue: 32000 },
];

export default function RevenueChart() {
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 mb-6">

      <h2 className="text-xl font-bold mb-4">
        Revenue Overview
      </h2>

      <div className="h-72">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={3}
            />
          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}