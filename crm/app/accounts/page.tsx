// file: app/accounts/page.tsx

"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import AdminAccountsTable from "@/components/AdminAccountsTable";
import FirmAccountsTable from "@/components/FirmAccountsTable";
import AddFirmAccountModal from "@/components/AddFirmAccountModal";
import { Plus } from "lucide-react";

function getAdminAccounts() {
  return [
    {
      id: "1",
      email: "admin@watergo.uz",
      name: "Platform Admin",
      role: "SUPER_ADMIN" as const,
      active: true,
      lastLogin: new Date().toISOString(),
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      email: "support@watergo.uz",
      name: "Support Team",
      role: "ADMIN" as const,
      active: true,
      lastLogin: new Date(Date.now() - 86400000).toISOString(),
      createdAt: "2024-01-15T00:00:00Z",
    },
  ];
}

function getFirmAccounts() {
  return [
    {
      id: "1",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      email: "owner@aquapure.uz",
      ownerName: "Aziz Karimov",
      ownerPhone: "+998901234567",
      active: true,
      lastLogin: new Date().toISOString(),
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      firmId: "2",
      firmName: "Crystal Water Samarkand",
      email: "admin@crystalwater.uz",
      ownerName: "Dilshod Umarov",
      ownerPhone: "+998901234568",
      active: true,
      lastLogin: new Date(Date.now() - 3600000).toISOString(),
      createdAt: "2024-02-10T10:00:00Z",
    },
    {
      id: "3",
      firmId: "3",
      firmName: "Fresh Drops Bukhara",
      email: "contact@freshdrops.uz",
      ownerName: "Rustam Nazarov",
      ownerPhone: "+998901234569",
      active: false,
      lastLogin: null,
      createdAt: "2024-03-05T10:00:00Z",
    },
  ];
}

export default function AccountsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"admins" | "firms">("admins");

  const adminAccounts = getAdminAccounts();
  const firmAccounts = getFirmAccounts();

  const handleAddSuccess = () => {
    // Refresh data
    console.log("Firm account created successfully");
  };

  return (
    <div className="p-8 dark:bg-gray-900 min-h-screen">
      <PageHeader
        title="Accounts Management"
        description="Manage platform admins and firm accounts"
      />

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab("admins")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "admins"
              ? "text-navy dark:text-blue-400 border-b-2 border-navy dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Admin Accounts ({adminAccounts.length})
        </button>
        <button
          onClick={() => setActiveTab("firms")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "firms"
              ? "text-navy dark:text-blue-400 border-b-2 border-navy dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Firm Accounts ({firmAccounts.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "admins" ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy dark:text-white">Platform Admins</h2>
          </div>
          <AdminAccountsTable accounts={adminAccounts} />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy dark:text-white">Firm Accounts</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-navy dark:bg-blue-600 text-white rounded-lg hover:bg-navy/90 dark:hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add Firm Account
            </button>
          </div>
          <FirmAccountsTable accounts={firmAccounts} />
        </div>
      )}

      {/* Add Firm Modal */}
      {showAddModal && (
        <AddFirmAccountModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
}
