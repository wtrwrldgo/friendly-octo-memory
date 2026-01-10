// file: components/FirmsPageClient.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Building2, Plus, Search, Clock, CheckCircle2, XCircle,
  RefreshCw, Users, MapPin, Calendar, Edit2, Trash2,
  ThumbsUp, ThumbsDown, Eye, ChevronDown, Globe, FileEdit, Sparkles
} from "lucide-react";
import FirmModal from "./FirmModal";
import ConfirmModal from "./ConfirmModal";
import { Firm, FirmStatus } from "@/types";
import { useToast } from "@/contexts/ToastContext";

type StatusFilter = "ALL" | FirmStatus;

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

const statusConfig: Record<FirmStatus, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  DRAFT: { label: "Draft", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30", icon: FileEdit },
  PENDING_REVIEW: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Clock },
  ACTIVE: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle2 },
  SUSPENDED: { label: "Suspended", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: XCircle },
};

export default function FirmsPageClient() {
  const toast = useToast();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [firmToDelete, setFirmToDelete] = useState<Firm | null>(null);

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

  // Stats
  const stats = useMemo(() => ({
    total: firms.length,
    draft: firms.filter(f => f.status === "DRAFT").length,
    pendingReview: firms.filter(f => f.status === "PENDING_REVIEW").length,
    active: firms.filter(f => f.status === "ACTIVE").length,
    suspended: firms.filter(f => f.status === "SUSPENDED").length,
    visible: firms.filter(f => f.isVisibleInClientApp).length,
  }), [firms]);

  // Filter firms
  const filteredFirms = useMemo(() => {
    return firms.filter(firm => {
      // Status filter
      if (statusFilter !== "ALL" && firm.status !== statusFilter) return false;
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          firm.name?.toLowerCase().includes(query) ||
          firm.city?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [firms, statusFilter, searchQuery]);

  const handleEdit = (firm: Firm) => {
    setSelectedFirm(firm);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (firm: Firm) => {
    setFirmToDelete(firm);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!firmToDelete) return;

    const authToken = localStorage.getItem("auth_token");
    const response = await fetch(`/api/firms/${firmToDelete.id}`, {
      method: "DELETE",
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete firm");
    }

    fetchFirms();
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setFirmToDelete(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFirm(null);
  };

  const handleModalSuccess = () => {
    fetchFirms();
    handleModalClose();
  };

  const handleApprove = async (firm: Firm) => {
    if (!confirm(`Are you sure you want to approve "${firm.name}"? This will make it visible to clients.`)) return;

    try {
      const authToken = localStorage.getItem("auth_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://45.92.173.121";

      const response = await fetch(`${API_URL}/api/firms/${firm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          status: "ACTIVE",
          isVisibleInClientApp: true,
          approvedAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`"${firm.name}" has been approved successfully`);
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
    }
  };

  const handleReject = async (firm: Firm) => {
    const reason = prompt(`Please provide a reason for rejecting "${firm.name}":`);
    if (!reason) return;

    try {
      const authToken = localStorage.getItem("auth_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://45.92.173.121";

      const response = await fetch(`${API_URL}/api/firms/${firm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          status: "DRAFT",
          rejectionReason: reason,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.warning(`"${firm.name}" has been rejected`);
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/3 rounded-full blur-[200px]" />
      </div>

      {/* Header */}
      <div className="relative border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Firms</h1>
                <p className="text-slate-400 text-sm mt-0.5">Manage partner firms on the platform</p>
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
                onClick={() => setIsModalOpen(true)}
                className="group relative flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/25"
              >
                <Plus className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Add Firm</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {/* Total */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-violet-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-400">Total</span>
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500/20 to-violet-600/10 rounded-xl flex items-center justify-center border border-violet-500/20">
                  <Building2 className="w-5 h-5 text-violet-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">{stats.total}</p>
            </div>
          </div>

          {/* Active */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-400">Active</span>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-emerald-400 tracking-tight">{stats.active}</p>
            </div>
          </div>

          {/* Pending */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-400">Pending</span>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-amber-400 tracking-tight">{stats.pendingReview}</p>
            </div>
          </div>

          {/* Draft */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/20 to-slate-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-slate-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-400">Draft</span>
                <div className="w-10 h-10 bg-gradient-to-br from-slate-500/20 to-slate-600/10 rounded-xl flex items-center justify-center border border-slate-500/20">
                  <FileEdit className="w-5 h-5 text-slate-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-400 tracking-tight">{stats.draft}</p>
            </div>
          </div>

          {/* Suspended */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-red-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-400">Suspended</span>
                <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl flex items-center justify-center border border-red-500/20">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-red-400 tracking-tight">{stats.suspended}</p>
            </div>
          </div>

          {/* Visible */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-400">Visible</span>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-400 tracking-tight">{stats.visible}</p>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
          {/* Filters */}
          <div className="px-6 py-5 border-b border-slate-700/50">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="flex bg-slate-900/50 rounded-xl p-1 border border-slate-700/50">
                {(["ALL", "ACTIVE", "PENDING_REVIEW", "DRAFT", "SUSPENDED"] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                      statusFilter === status
                        ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {status === "ALL" ? "All" :
                     status === "PENDING_REVIEW" ? "Pending" :
                     status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="px-6 py-4 bg-slate-900/30 border-b border-slate-700/30">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</div>
              <div className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Firm</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visibility</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-700/30">
            {loading ? (
              <div className="py-20 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl" />
                  <RefreshCw className="relative w-10 h-10 text-violet-400 animate-spin mx-auto" />
                </div>
                <p className="text-slate-400 mt-4 font-medium">Loading firms...</p>
              </div>
            ) : filteredFirms.length === 0 ? (
              <div className="py-20 text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-slate-500/10 rounded-full blur-xl" />
                  <div className="relative w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto">
                    <Building2 className="w-8 h-8 text-slate-600" />
                  </div>
                </div>
                <p className="text-slate-300 font-semibold text-lg">No firms found</p>
                <p className="text-slate-500 text-sm mt-1">
                  {searchQuery || statusFilter !== "ALL"
                    ? "Try adjusting your filters"
                    : "Add your first firm to get started"}
                </p>
                {!searchQuery && statusFilter === "ALL" && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/25"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Firm
                  </button>
                )}
              </div>
            ) : (
              filteredFirms.map((firm) => {
                const config = statusConfig[firm.status] || statusConfig.DRAFT;
                const StatusIcon = config.icon;

                return (
                  <div key={firm.id} className="px-6 py-4 hover:bg-slate-700/20 transition-all duration-300 group">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Status */}
                      <div className="col-span-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${config.bg} ${config.color} border ${config.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </div>

                      {/* Firm */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-xl flex items-center justify-center overflow-hidden border border-violet-500/20">
                            {firm.logoUrl ? (
                              <img src={firm.logoUrl} alt={firm.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-violet-400">
                                {firm.name?.charAt(0)?.toUpperCase() || "F"}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">{firm.name}</p>
                            <p className="text-xs text-slate-500">{firm.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <MapPin className="w-4 h-4 text-slate-600" />
                          {firm.city || "—"}
                        </div>
                      </div>

                      {/* Created */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatRelativeTime(firm.createdAt)}
                        </div>
                      </div>

                      {/* Visibility */}
                      <div className="col-span-2">
                        {firm.isVisibleInClientApp ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            <Eye className="w-3.5 h-3.5" />
                            Visible
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Hidden</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {firm.status === "PENDING_REVIEW" && (
                          <>
                            <button
                              onClick={() => handleApprove(firm)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(firm)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-semibold transition-all"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(firm)}
                          className="p-2.5 hover:bg-slate-700/50 rounded-lg transition-all border border-transparent hover:border-slate-600/50"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-slate-400 hover:text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(firm)}
                          className="p-2.5 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {!loading && filteredFirms.length > 0 && (
            <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/30">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-300">{filteredFirms.length}</span> of <span className="font-semibold text-slate-300">{firms.length}</span> firms
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Firm Modal */}
      <FirmModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        firm={selectedFirm}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Firm"
        message="Are you sure you want to delete this firm? All associated data including orders, clients, and staff will be permanently removed."
        confirmText="Delete Firm"
        cancelText="Cancel"
        variant="danger"
        itemName={firmToDelete?.name}
      />
    </div>
  );
}
