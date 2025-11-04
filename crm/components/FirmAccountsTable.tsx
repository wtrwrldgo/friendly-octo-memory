// file: components/FirmAccountsTable.tsx

"use client";

import { FirmAccount } from "@/types";
import Link from "next/link";

interface FirmAccountsTableProps {
  accounts: FirmAccount[];
}

export default function FirmAccountsTable({ accounts }: FirmAccountsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Firm</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Owner</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Phone</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Last Login</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <Link href={`/firms/${account.firmId}`} className="font-semibold text-navy dark:text-blue-400 hover:underline">
                    {account.firmName}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-900 dark:text-gray-300">{account.ownerName}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{account.email}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{account.ownerPhone}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    account.active ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                  }`}>
                    {account.active ? "ACTIVE" : "SUSPENDED"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                  {account.lastLogin ? new Date(account.lastLogin).toLocaleString() : "Never"}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">{new Date(account.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
