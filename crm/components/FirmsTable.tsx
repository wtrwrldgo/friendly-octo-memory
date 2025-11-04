// file: components/FirmsTable.tsx

"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { Firm } from "@/types";
import { Building2, Users, ShoppingBag, TrendingUp } from "lucide-react";

interface FirmsTableProps {
  firms: Firm[];
}

export default function FirmsTable({ firms }: FirmsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Firm</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">City</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Clients</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Orders</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Drivers</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {firms.map((firm) => (
              <tr key={firm.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150 group">
                <td className="px-6 py-5">
                  <Link href={`/firms/${firm.id}`} className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-navy-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                      {firm.name}
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-5 text-gray-700 dark:text-gray-300 font-medium">{firm.city}</td>
                <td className="px-6 py-5">
                  <StatusBadge status={firm.status} />
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                    <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    {firm.clientsCount}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                    <ShoppingBag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    {firm.ordersCount}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                    <TrendingUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    {firm.driversCount}
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-sm font-medium">
                  {new Date(firm.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
