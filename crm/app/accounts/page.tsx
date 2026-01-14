// file: app/accounts/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Clock,
  MoreVertical,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AddFirmAccountModal from "@/components/AddFirmAccountModal";

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

type TabType = "admins" | "firms";

export default function AccountsPage() {
  const { token } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("admins");
  const [loading, setLoading] = useState(true);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [firmAccounts, setFirmAccounts] = useState<FirmAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const staffRes = await fetch("/api/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        const allStaff = staffData.data || staffData || [];

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

      const firmsRes = await fetch("/api/firms", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (firmsRes.ok) {
        const firmsData = await firmsRes.json();
        const allFirms = firmsData.firms || firmsData.data || [];

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

  useEffect(() => {
    fetchAccounts();
  }, [token]);

  // Stats
  const stats = useMemo(() => ({
    totalAdmins: adminAccounts.length,
    activeAdmins: adminAccounts.filter(a => a.active).length,
    totalFirms: firmAccounts.length,
    activeFirms: firmAccounts.filter(f => f.active).length,
  }), [adminAccounts, firmAccounts]);

  // Filtered data
  const filteredAdmins = useMemo(() => {
    return adminAccounts.filter(account => {
      const matchesSearch =
        account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && account.active) ||
        (statusFilter === "INACTIVE" && !account.active);
      return matchesSearch && matchesStatus;
    });
  }, [adminAccounts, searchQuery, statusFilter]);

  const filteredFirms = useMemo(() => {
    return firmAccounts.filter(account => {
      const matchesSearch =
        account.firmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && account.active) ||
        (statusFilter === "INACTIVE" && !account.active);
      return matchesSearch && matchesStatus;
    });
  }, [firmAccounts, searchQuery, statusFilter]);

  const handleAddSuccess = () => {
    fetchAccounts();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-500">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Accounts Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage platform administrators and firm owner accounts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setActiveTab("admins")}
          className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer transition-all ${
            activeTab === "admins"
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAdmins}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => { setActiveTab("admins"); setStatusFilter("ACTIVE"); }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:border-gray-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeAdmins}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Admins</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("firms")}
          className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer transition-all ${
            activeTab === "firms"
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFirms}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Firm Owners</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => { setActiveTab("firms"); setStatusFilter("ACTIVE"); }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:border-gray-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeFirms}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Owners</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => { setActiveTab("admins"); setStatusFilter("ALL"); setSearchQuery(""); }}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "admins"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Admin Accounts
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "admins"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}>
                {adminAccounts.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => { setActiveTab("firms"); setStatusFilter("ALL"); setSearchQuery(""); }}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "firms"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4" />
              Firm Accounts
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "firms"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}>
                {firmAccounts.length}
              </span>
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === "admins" ? "Search by name or email..." : "Search by firm, owner or email..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchAccounts}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            {/* Add Button (only for firms tab) */}
            {activeTab === "firms" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Firm Account
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {activeTab === "admins" ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No admin accounts found</p>
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {account.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <Mail className="w-3 h-3" />
                              {account.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          account.role === "SUPER_ADMIN"
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        }`}>
                          {account.role === "SUPER_ADMIN" ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          {account.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          account.active
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}>
                          {account.active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {account.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(account.lastLogin)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(account.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Firm</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFirms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No firm accounts found</p>
                    </td>
                  </tr>
                ) : (
                  filteredFirms.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-semibold">
                            {(account.firmName || "F").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/firms/${account.firmId || ""}`}
                              className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {account.firmName || "Unknown Firm"}
                            </Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {(account.firmId || "").slice(0, 8) || "—"}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{account.ownerName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-3 h-3" />
                            {account.email || "—"}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-3 h-3" />
                            {account.ownerPhone || "—"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          account.active
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}>
                          {account.active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {account.active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(account.lastLogin)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {account.firmId ? (
                          <Link
                            href={`/firms/${account.firmId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Firm
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
