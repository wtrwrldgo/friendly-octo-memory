// file: components/AdminAccountsTable.tsx

"use client";

import { AdminAccount } from "@/types";

interface AdminAccountsTableProps {
  accounts: AdminAccount[];
}

export default function AdminAccountsTable({ accounts }: AdminAccountsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Last Login</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 font-semibold text-navy dark:text-white">{account.name}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{account.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                    {account.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    account.active ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                  }`}>
                    {account.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">{new Date(account.lastLogin).toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">{new Date(account.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
