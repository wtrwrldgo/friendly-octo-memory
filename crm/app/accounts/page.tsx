// file: app/accounts/page.tsx

"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import AdminAccountsTable from "@/components/AdminAccountsTable";
import FirmAccountsTable from "@/components/FirmAccountsTable";
import AddFirmAccountModal from "@/components/AddFirmAccountModal";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN";
  active: boolean;
  lastLogin: string;
  createdAt: string;
}

interface FirmAccount {
  id: string;
  firmId: string;
  firmName: string;
  email: string;
  ownerName: string;
  ownerPhone: string;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export default function AccountsPage() {
  const { token } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"admins" | "firms">("admins");
  const [loading, setLoading] = useState(true);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [firmAccounts, setFirmAccounts] = useState<FirmAccount[]>([]);

  // Fetch accounts data
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        // Fetch all staff
        const staffRes = await fetch("/api/staff", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (staffRes.ok) {
          const staffData = await staffRes.json();
          const allStaff = staffData.data || staffData || [];

          // Separate admin accounts (WATERGO_ADMIN) and firm accounts (OWNER)
          const admins: AdminAccount[] = [];
          const firms: FirmAccount[] = [];

          for (const staff of allStaff) {
            if (staff.role === "WATERGO_ADMIN" || staff.role === "SUPER_ADMIN" || staff.role === "ADMIN") {
              admins.push({
                id: staff.id,
                email: staff.email,
                name: staff.name || "Admin",
                role: staff.role === "WATERGO_ADMIN" ? "SUPER_ADMIN" : staff.role,
                active: staff.isActive !== false,
                lastLogin: staff.lastLoginAt || new Date().toISOString(),
                createdAt: staff.createdAt,
              });
            } else if (staff.role === "OWNER") {
              firms.push({
                id: staff.id,
                firmId: staff.firmId,
                firmName: staff.firm?.name || staff.firmName || "Unknown Firm",
                email: staff.email,
                ownerName: staff.name || "Owner",
                ownerPhone: staff.phone || "",
                active: staff.isActive !== false,
                lastLogin: staff.lastLoginAt || null,
                createdAt: staff.createdAt,
              });
            }
          }

          // Add default WaterGo admin if not in list
          if (admins.length === 0) {
            admins.push({
              id: "00000000-0000-0000-0000-000000000000",
              email: "admin@watergo.com",
              name: "WaterGo Admin",
              role: "SUPER_ADMIN",
              active: true,
              lastLogin: new Date().toISOString(),
              createdAt: "2024-01-01T00:00:00Z",
            });
          }

          setAdminAccounts(admins);
          setFirmAccounts(firms);
        }

        // Also fetch firms to get owner data
        const firmsRes = await fetch("/api/firms", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (firmsRes.ok) {
          const firmsData = await firmsRes.json();
          const allFirms = firmsData.data || firmsData || [];

          // Add firm owners that might not be in staff list
          const existingFirmIds = new Set(firmAccounts.map(f => f.firmId));

          for (const firm of allFirms) {
            if (!existingFirmIds.has(firm.id) && firm.owner) {
              setFirmAccounts(prev => [...prev, {
                id: firm.owner.id || firm.id,
                firmId: firm.id,
                firmName: firm.name,
                email: firm.owner.email || "",
                ownerName: firm.owner.name || "Owner",
                ownerPhone: firm.owner.phone || "",
                active: firm.status === "ACTIVE",
                lastLogin: null,
                createdAt: firm.createdAt,
              }]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
        // Add default admin on error
        setAdminAccounts([{
          id: "00000000-0000-0000-0000-000000000000",
          email: "admin@watergo.com",
          name: "WaterGo Admin",
          role: "SUPER_ADMIN",
          active: true,
          lastLogin: new Date().toISOString(),
          createdAt: "2024-01-01T00:00:00Z",
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [token]);

  const handleAddSuccess = () => {
    // Refresh data
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="p-8 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

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
