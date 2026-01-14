// file: app/billing/page.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

interface FirmSubscription {
  id: string;
  name: string;
  status: string;
  subscriptionStatus: "TRIAL_ACTIVE" | "TRIAL_EXPIRED" | "BASIC" | "PRO" | "MAX";
  trialStartAt: string;
  trialEndAt: string | null;
  daysRemaining: number | null;
  isExpired: boolean;
  logoUrl?: string | null;
}

// Helper to get logo URL through image proxy (avoids mixed content issues)
function getFullLogoUrl(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null;
  if (logoUrl.startsWith('http')) {
    return `/api/imageproxy?url=${encodeURIComponent(logoUrl)}`;
  }
  const fullUrl = `http://45.92.173.121${logoUrl}`;
  return `/api/imageproxy?url=${encodeURIComponent(fullUrl)}`;
}

export default function BillingPage() {
  const [firms, setFirms] = useState<FirmSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});

  const fetchFirmsSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch firms via CRM API route (avoids mixed content issues)
      const response = await fetch(`/api/firms`);

      if (!response.ok) {
        throw new Error("Failed to fetch firms");
      }

      const result = await response.json();
      // Handle both response formats: { firms: [...] } and { success: true, data: [...] }
      const firmsArray = result.firms || result.data || [];
      if (firmsArray.length > 0 || response.ok) {
        // Transform firms to subscription format - all on 30-day free trial
        const firmsWithSubscription: FirmSubscription[] = firmsArray.map((firm: any) => {
          const createdAt = new Date(firm.createdAt || new Date());
          const trialEndAt = new Date(createdAt);
          trialEndAt.setDate(trialEndAt.getDate() + 30);

          const now = new Date();
          const daysRemaining = Math.ceil((trialEndAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isExpired = daysRemaining <= 0;

          return {
            id: firm.id,
            name: firm.name,
            status: firm.status || 'ACTIVE',
            subscriptionStatus: isExpired ? 'TRIAL_EXPIRED' : 'TRIAL_ACTIVE',
            trialStartAt: createdAt.toISOString(),
            trialEndAt: trialEndAt.toISOString(),
            daysRemaining: Math.max(0, daysRemaining),
            isExpired,
            logoUrl: getFullLogoUrl(firm.logoUrl),
          };
        });
        setFirms(firmsWithSubscription);
      }
    } catch (err: any) {
      console.error("Error fetching firms:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirmsSubscriptions();
  }, []);

  // Filter firms based on search and status
  const filteredFirms = firms.filter((firm) => {
    const matchesSearch = firm.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "TRIAL_ACTIVE" && firm.subscriptionStatus === "TRIAL_ACTIVE") ||
      (statusFilter === "TRIAL_EXPIRED" && firm.subscriptionStatus === "TRIAL_EXPIRED") ||
      (statusFilter === "PAID" && ["BASIC", "PRO", "MAX"].includes(firm.subscriptionStatus));
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: firms.length,
    trialActive: firms.filter((f) => f.subscriptionStatus === "TRIAL_ACTIVE").length,
    trialExpired: firms.filter((f) => f.subscriptionStatus === "TRIAL_EXPIRED").length,
    paid: firms.filter((f) => ["BASIC", "PRO", "MAX"].includes(f.subscriptionStatus)).length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TRIAL_ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3" />
            Free Trial (30 Days)
          </span>
        );
      case "TRIAL_EXPIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Trial Expired
          </span>
        );
      case "BASIC":
      case "PRO":
      case "MAX":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            {status} Plan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Billing & Subscriptions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage and monitor all firms&apos; subscription statuses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Firms</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.trialActive}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Trials</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.trialExpired}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expired Trials</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.paid}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paid Plans</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search firms..."
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="TRIAL_ACTIVE">Trial Active</option>
              <option value="TRIAL_EXPIRED">Trial Expired</option>
              <option value="PAID">Paid Plans</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchFirmsSubscriptions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 relative z-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Firm
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trial Start
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trial End
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Days Remaining
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Loading subscriptions...</p>
                  </td>
                </tr>
              ) : filteredFirms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No firms found</p>
                  </td>
                </tr>
              ) : (
                filteredFirms.map((firm) => (
                  <tr
                    key={firm.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold overflow-hidden">
                          {firm.logoUrl && !logoErrors[firm.id] ? (
                            <img
                              src={firm.logoUrl}
                              alt={firm.name}
                              className="w-full h-full object-cover"
                              onError={() => setLogoErrors(prev => ({ ...prev, [firm.id]: true }))}
                            />
                          ) : (
                            firm.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{firm.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {firm.status === "ACTIVE" ? "Active" : firm.status}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(firm.subscriptionStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {formatDate(firm.trialStartAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {formatDate(firm.trialEndAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {firm.daysRemaining !== null ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                            firm.daysRemaining <= 0
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : firm.daysRemaining <= 7
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {firm.daysRemaining <= 0 ? "Expired" : `${firm.daysRemaining} days`}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-300">Paid Plans Coming Soon</h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Payment integration is under development. Currently, all firms are on a 30-day free
              trial. Once paid plans are available, you&apos;ll be able to manage subscriptions from this
              page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
