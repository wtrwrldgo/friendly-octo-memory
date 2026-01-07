// file: components/RevenueProfileCard.tsx

"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

// Mock data for the chart
const data = [
  { date: "Jan, 01", revenue: 0 },
  { date: "Jan, 07", revenue: 5000 },
  { date: "Jan, 14", revenue: 12000 },
  { date: "Jan, 21", revenue: 18000 },
  { date: "Jan, 28", revenue: 25843 },
];

export default function RevenueProfileCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-1">
            Revenue Profile
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-navy-900 dark:text-white">
              25,843,450 UZS
            </span>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <TrendingUp className="w-3 h-3" />
              <span>+11%</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">/Month</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your performance is excellent 👍
          </p>
        </div>

        {/* Month selector */}
        <select className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option>Monthly</option>
          <option>Weekly</option>
          <option>Yearly</option>
        </select>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value.toLocaleString()} UZS`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1e3a8a"
              strokeWidth={3}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
