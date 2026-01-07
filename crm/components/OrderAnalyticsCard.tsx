// file: components/OrderAnalyticsCard.tsx

"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

// Mock data for the chart
const data = [
  { day: "01", january: 1500, february: 1800 },
  { day: "03", january: 2100, february: 2400 },
  { day: "06", january: 1800, february: 2100 },
  { day: "09", january: 2500, february: 2800 },
  { day: "12", january: 2200, february: 2600 },
  { day: "15", january: 2800, february: 3200 },
  { day: "18", january: 2400, february: 2900 },
  { day: "21", january: 3000, february: 3500 },
  { day: "24", january: 2700, february: 3100 },
  { day: "27", january: 3200, february: 3800 },
  { day: "30", january: 2900, february: 3400 },
];

export default function OrderAnalyticsCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-1">
            Order Analytics
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-navy-900 dark:text-white">
              12,120.00
            </span>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <TrendingUp className="w-3 h-3" />
              <span>+15%</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">/Month</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Excellent job on your order 💪
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option>All Vendor</option>
            <option>AquaPure</option>
            <option>Crystal Water</option>
          </select>
          <select className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option>Completed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
          <select className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Yearly</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
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
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="january"
              stroke="#9ca3af"
              strokeWidth={2}
              dot={false}
              name="January"
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="february"
              stroke="#1e3a8a"
              strokeWidth={3}
              dot={false}
              name="February"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
