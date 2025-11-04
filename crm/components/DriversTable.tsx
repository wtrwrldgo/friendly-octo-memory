// file: components/DriversTable.tsx

"use client";

import StatusBadge from "./StatusBadge";
import { Driver } from "@/types";

interface DriversTableProps {
  drivers: Driver[];
}

export default function DriversTable({ drivers }: DriversTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Driver</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Firm</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Phone</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Car Plate</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 font-semibold text-navy dark:text-white">{driver.name}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-gray-300">{driver.firmName || driver.firmId}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{driver.phone}</td>
                <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-gray-300">{driver.carPlate}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={driver.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
