"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  EyeOff,
  Search,
  RefreshCw,
  Shield,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Firm, FirmStatus } from "@/types";
import StatusBadge from "./StatusBadge";

// Helper to get logo URL through image proxy (avoids mixed content issues)
function getFullLogoUrl(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null;
  if (logoUrl.startsWith('http')) {
    return `/api/imageproxy?url=${encodeURIComponent(logoUrl)}`;
  }
  const fullUrl = `http://45.92.173.121${logoUrl}`;
  return `/api/imageproxy?url=${encodeURIComponent(fullUrl)}`;
}

type FilterTab = "ALL" | "PENDING_REVIEW" | "ACTIVE" | "DRAFT" | "SUSPENDED";

interface RejectModalProps {
  isOpen: boolean;
  firmName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}

function RejectModal({ isOpen, firmName, onClose, onConfirm, loading }: RejectModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Reject Firm Application
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Provide a reason for rejecting <strong>{firmName}</strong>. This will be visible to the firm owner.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter rejection reason..."
          className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
          rows={4}
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FirmModerationPageClient() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("PENDING_REVIEW");
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; firm: Firm | null }>({
    isOpen: false,
    firm: null,
  });

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/firms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Transform logo URLs to full URLs
        const firmsWithLogos = (data.data || []).map((firm: any) => ({
          ...firm,
          logoUrl: getFullLogoUrl(firm.logoUrl),
        }));
        setFirms(firmsWithLogos);
      } else {
        throw new Error(data.message || "Failed to fetch firms");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load firms");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (firm: Firm) => {
    setActionLoading(firm.id);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/firms/${firm.id}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(`${firm.name} has been approved and is now visible in the client app!`);
        fetchFirms();
      } else {
        throw new Error(data.message || "Failed to approve firm");
      }
    } catch (err: any) {
      setError(err.message || "Failed to approve firm");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectModal.firm) return;
    const firm = rejectModal.firm;
    setActionLoading(firm.id);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/firms/${firm.id}/reject`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(`${firm.name} has been rejected. The owner will be notified.`);
        setRejectModal({ isOpen: false, firm: null });
        fetchFirms();
      } else {
        throw new Error(data.message || "Failed to reject firm");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reject firm");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (firm: Firm) => {
    setActionLoading(firm.id);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/firms/${firm.id}/suspend`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(`${firm.name} has been hidden from the client app.`);
        fetchFirms();
      } else {
        throw new Error(data.message || "Failed to hide firm");
      }
    } catch (err: any) {
      setError(err.message || "Failed to hide firm");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (firm: Firm) => {
    setActionLoading(firm.id);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/firms/${firm.id}/reactivate`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(`${firm.name} has been reactivated and is now visible in the client app!`);
        fetchFirms();
      } else {
        throw new Error(data.message || "Failed to reactivate firm");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reactivate firm");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredFirms = firms.filter((firm) => {
    const matchesSearch =
      firm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      firm.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "ALL" || firm.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabs: { key: FilterTab; label: string; icon: React.ReactNode; count: number }[] = [
    {
      key: "PENDING_REVIEW",
      label: "Pending Review",
      icon: <Clock className="w-4 h-4" />,
      count: firms.filter((f) => f.status === "PENDING_REVIEW").length,
    },
    {
      key: "ACTIVE",
      label: "Active",
      icon: <CheckCircle className="w-4 h-4" />,
      count: firms.filter((f) => f.status === "ACTIVE").length,
    },
    {
      key: "DRAFT",
      label: "Draft",
      icon: <AlertCircle className="w-4 h-4" />,
      count: firms.filter((f) => f.status === "DRAFT").length,
    },
    {
      key: "SUSPENDED",
      label: "Suspended",
      icon: <EyeOff className="w-4 h-4" />,
      count: firms.filter((f) => f.status === "SUSPENDED").length,
    },
    {
      key: "ALL",
      label: "All Firms",
      icon: <Building2 className="w-4 h-4" />,
      count: firms.length,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Firm Moderation
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Review and approve firm applications
                </p>
              </div>
            </div>
            <button
              onClick={fetchFirms}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 relative z-50">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 relative z-50">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
          </div>
        )}
      </div>

      {/* Tabs & Search */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search firms..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>
      </div>

      {/* Firms List */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : filteredFirms.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No firms found
            </h3>
            <p className="text-slate-500">
              {activeTab === "PENDING_REVIEW"
                ? "No firms are waiting for review"
                : "No firms match your search criteria"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredFirms.map((firm) => (
              <div
                key={firm.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Firm Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden">
                      {firm.logoUrl ? (
                        <img src={firm.logoUrl} alt={firm.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-7 h-7 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {firm.name}
                      </h3>
                      <p className="text-sm text-slate-500">{firm.city || "No city"}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <StatusBadge status={firm.status} />
                        {firm.isVisibleInClientApp && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Visible in App
                          </span>
                        )}
                      </div>
                      {firm.rejectionReason && firm.status === "DRAFT" && (
                        <p className="mt-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                          <strong>Previous rejection:</strong> {firm.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {firm.status === "PENDING_REVIEW" && (
                      <>
                        <button
                          onClick={() => handleApprove(firm)}
                          disabled={actionLoading === firm.id}
                          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                        >
                          {actionLoading === firm.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Approve & Go Live
                        </button>
                        <button
                          onClick={() => setRejectModal({ isOpen: true, firm })}
                          disabled={actionLoading === firm.id}
                          className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {firm.status === "ACTIVE" && (
                      <button
                        onClick={() => handleSuspend(firm)}
                        disabled={actionLoading === firm.id}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-500 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                      >
                        {actionLoading === firm.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                        Hide from App
                      </button>
                    )}
                    {firm.status === "SUSPENDED" && (
                      <button
                        onClick={() => handleReactivate(firm)}
                        disabled={actionLoading === firm.id}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                      >
                        {actionLoading === firm.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Reactivate
                      </button>
                    )}
                    {firm.status === "DRAFT" && (
                      <span className="text-sm text-slate-500 italic">
                        Waiting for firm to submit
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModal.isOpen}
        firmName={rejectModal.firm?.name || ""}
        onClose={() => setRejectModal({ isOpen: false, firm: null })}
        onConfirm={handleReject}
        loading={actionLoading === rejectModal.firm?.id}
      />
    </div>
  );
}
