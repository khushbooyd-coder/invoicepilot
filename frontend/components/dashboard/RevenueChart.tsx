"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", revenue: 25000 },
  { month: "Feb", revenue: 42000 },
  { month: "Mar", revenue: 38000 },
  { month: "Apr", revenue: 65000 },
  { month: "May", revenue: 78000 },
  { month: "Jun", revenue: 98000 },
];

export default function RevenueChart() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

      <h2 className="text-xl font-semibold mb-6">
        Revenue Overview
      </h2>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={data}>

            <XAxis dataKey="month" />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.25}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}