// file: app/pending-reviews/page.tsx
// WaterGo Admin - Pending Firm Reviews Page

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Building2, Clock, CheckCircle2, XCircle, RefreshCw, Search,
  MapPin, Calendar, Eye, ThumbsUp, ThumbsDown, AlertTriangle,
  ArrowRight, FileText, Users, Package, Truck, ChevronRight
} from "lucide-react";
import { Firm } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";

function formatRelativeTime(dateString: string | null | undefined) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PendingReviewsPage() {
  const toast = useToast();
  const router = useRouter();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingFirmId, setProcessingFirmId] = useState<string | null>(null);

  const fetchFirms = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/firms");
      const data = await response.json();
      if (data.firms) {
        setFirms(data.firms);
      }
    } catch (error) {
      console.error("Error fetching firms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirms();
  }, []);

  // Filter only PENDING_REVIEW firms
  const pendingFirms = useMemo(() => {
    return firms
      .filter(firm => firm.status === "PENDING_REVIEW")
      .filter(firm => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          firm.name?.toLowerCase().includes(query) ||
          firm.city?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        // Sort by submission date (oldest first - FIFO)
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateA - dateB;
      });
  }, [firms, searchQuery]);

  const handleApprove = async (firm: Firm) => {
    if (!confirm(`Approve "${firm.name}"?\n\nThis will make the firm visible to clients in the WaterGo app.`)) return;

    setProcessingFirmId(firm.id);
    try {
      const authToken = localStorage.getItem("auth_token");
      const response = await fetch(`/api/firms/${firm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          status: "ACTIVE",
          isVisibleInClientApp: true,
          approvedAt: new Date().toISOString(),
          rejectionReason: null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`"${firm.name}" has been approved and is now live!`);
        fetchFirms();
      } else {
        const errorMsg = typeof data.message === 'string' ? data.message :
                        typeof data.error === 'string' ? data.error :
                        "Failed to approve firm";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error approving firm:", error);
      toast.error("Failed to approve firm");
    } finally {
      setProcessingFirmId(null);
    }
  };

  const handleReject = async (firm: Firm) => {
    const reason = prompt(`Reject "${firm.name}"?\n\nPlease provide a clear reason so the owner can fix the issues:`);
    if (!reason || reason.trim() === "") {
      toast.error("Rejection reason is required");
      return;
    }

    setProcessingFirmId(firm.id);
    try {
      const authToken = localStorage.getItem("auth_token");
      const response = await fetch(`/api/firms/${firm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          status: "DRAFT",
          rejectionReason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.warning(`"${firm.name}" has been rejected. The owner will be notified.`);
        fetchFirms();
      } else {
        const errorMsg = typeof data.message === 'string' ? data.message :
                        typeof data.error === 'string' ? data.error :
                        "Failed to reject firm";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error rejecting firm:", error);
      toast.error("Failed to reject firm");
    } finally {
      setProcessingFirmId(null);
    }
  };

  // Stats
  const allPendingCount = firms.filter(f => f.status === "PENDING_REVIEW").length;
  const draftCount = firms.filter(f => f.status === "DRAFT").length;
  const activeCount = firms.filter(f => f.status === "ACTIVE").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Clock className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Pending Reviews</h1>
                <p className="text-slate-400 text-sm mt-0.5">Firms awaiting WaterGo approval</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchFirms}
                disabled={loading}
                className="group flex items-center gap-2.5 px-5 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 group-hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Refresh</span>
              </button>
              <button
                onClick={() => router.push('/firms')}
                className="flex items-center gap-2.5 px-5 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl transition-all duration-300"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">All Firms</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {/* Pending Reviews */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">Pending Reviews</span>
                <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-amber-400 tracking-tight">{allPendingCount}</p>
              <p className="text-xs text-slate-500 mt-2">Awaiting your decision</p>
            </div>
          </div>

          {/* Draft Firms */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/20 to-slate-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">Draft Firms</span>
                <div className="w-11 h-11 bg-gradient-to-br from-slate-500/20 to-slate-600/10 rounded-xl flex items-center justify-center border border-slate-500/20">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-slate-400 tracking-tight">{draftCount}</p>
              <p className="text-xs text-slate-500 mt-2">Setting up their profile</p>
            </div>
          </div>

          {/* Active Firms */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">Active Firms</span>
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-emerald-400 tracking-tight">{activeCount}</p>
              <p className="text-xs text-slate-500 mt-2">Live in the app</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search pending firms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
            />
          </div>
        </div>

        {/* Pending Firms List */}
        {loading ? (
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-20">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl" />
                <RefreshCw className="relative w-10 h-10 text-amber-400 animate-spin" />
              </div>
              <p className="text-slate-400 mt-4 font-medium">Loading pending reviews...</p>
            </div>
          </div>
        ) : pendingFirms.length === 0 ? (
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-20">
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl" />
                <div className="relative w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <p className="text-slate-300 font-semibold text-lg">All caught up!</p>
              <p className="text-slate-500 text-sm mt-1">No firms are waiting for review</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingFirms.map((firm) => (
              <div
                key={firm.id}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Firm Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 overflow-hidden">
                        {firm.logoUrl ? (
                          <img src={firm.logoUrl} alt={firm.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-amber-400">
                            {firm.name?.charAt(0)?.toUpperCase() || "F"}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{firm.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1.5 text-sm text-slate-400">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            {firm.city || "No city"}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-slate-400">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            Submitted {formatRelativeTime(firm.submittedAt)}
                          </div>
                        </div>
                        {/* Quick Stats */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700/50 rounded-lg">
                            <Package className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-300">{firm.ordersCount || 0} orders</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700/50 rounded-lg">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-300">{firm.driversCount || 0} drivers</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700/50 rounded-lg">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-300">{firm.clientsCount || 0} clients</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => router.push(`/firms/${firm.id}`)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-xl text-sm font-medium text-slate-300 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleReject(firm)}
                        disabled={processingFirmId === firm.id}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-sm font-semibold text-red-400 transition-all disabled:opacity-50"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(firm)}
                        disabled={processingFirmId === firm.id}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 rounded-xl text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Approve
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Warning Banner for firms with no data */}
                {(firm.driversCount === 0 || firm.ordersCount === 0) && (
                  <div className="px-6 py-3 bg-amber-500/10 border-t border-amber-500/20">
                    <div className="flex items-center gap-2 text-sm text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>
                        {firm.driversCount === 0 && "No drivers added. "}
                        {firm.ordersCount === 0 && "No orders yet. "}
                        Consider reviewing their setup before approval.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Workflow Info */}
        <div className="mt-8 bg-slate-800/20 border border-slate-700/30 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Approval Workflow</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-sm text-slate-400">Draft</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-sm text-amber-400 font-medium">Pending Review</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm text-emerald-400">Active (Visible)</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Rejected firms return to Draft status with feedback. They can fix issues and resubmit.
          </p>
        </div>
      </div>
    </div>
  );
}
