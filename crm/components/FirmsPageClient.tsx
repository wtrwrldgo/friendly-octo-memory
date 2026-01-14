// file: components/FirmsPageClient.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, RefreshCw, Edit2, Trash2, ThumbsUp, ThumbsDown, Loader2, Building2, CheckCircle2, Clock, FileEdit, XCircle, Eye } from "lucide-react";
import PageHeader from "./PageHeader";
import FirmModal from "./FirmModal";
import ConfirmModal from "./ConfirmModal";
import { Firm, FirmStatus } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

type StatusFilter = "ALL" | FirmStatus;

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
    active: firms.filter(f => f.status === "ACTIVE").length,
    pending: firms.filter(f => f.status === "PENDING_REVIEW").length,
    draft: firms.filter(f => f.status === "DRAFT").length,
    suspended: firms.filter(f => f.status === "SUSPENDED").length,
    visible: firms.filter(f => f.isVisibleInClientApp).length,
  }), [firms]);

  // Filter firms
  const filteredFirms = useMemo(() => {
    return firms.filter(firm => {
      if (statusFilter !== "ALL" && firm.status !== statusFilter) return false;
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
    if (!confirm(`Are you sure you want to approve "${firm.name}"?`)) return;

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
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`"${firm.name}" has been approved`);
        fetchFirms();
      } else {
        toast.error(data.message || data.error || "Failed to approve firm");
      }
    } catch (error) {
      console.error("Error approving firm:", error);
      toast.error("Failed to approve firm");
    }
  };

  const handleReject = async (firm: Firm) => {
    const reason = prompt(`Reason for rejecting "${firm.name}":`);
    if (!reason) return;

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
          rejectionReason: reason,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.warning(`"${firm.name}" has been rejected`);
        fetchFirms();
      } else {
        toast.error(data.message || data.error || "Failed to reject firm");
      }
    } catch (error) {
      console.error("Error rejecting firm:", error);
      toast.error("Failed to reject firm");
    }
  };

  const getStatusBadge = (status: FirmStatus) => {
    const styles: Record<FirmStatus, string> = {
      ACTIVE: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      PENDING_REVIEW: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300",
      DRAFT: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
      SUSPENDED: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    };
    const labels: Record<FirmStatus, string> = {
      ACTIVE: "Active",
      PENDING_REVIEW: "Pending",
      DRAFT: "Draft",
      SUSPENDED: "Suspended",
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
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
        title="Firms Management"
        description="Manage partner firms on the platform"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
            <Building2 className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Draft</span>
            <FileEdit className="w-5 h-5 text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.draft}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Suspended</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.suspended}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Visible</span>
            <Eye className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.visible}</p>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search firms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_REVIEW">Pending</option>
            <option value="DRAFT">Draft</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFirms}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-gray-700 dark:text-gray-300">Refresh</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-navy dark:bg-blue-600 text-white rounded-lg hover:bg-navy/90 dark:hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Firm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Firm</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Visibility</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Created</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredFirms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery || statusFilter !== "ALL" ? "No firms match your filters" : "No firms found. Add your first firm to get started."}
                  </td>
                </tr>
              ) : (
                filteredFirms.map((firm) => (
                  <tr key={firm.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                          {firm.logoUrl ? (
                            <img src={firm.logoUrl} alt={firm.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                              {firm.name?.charAt(0)?.toUpperCase() || "F"}
                            </span>
                          )}
                        </div>
                        <div>
                          <Link href={`/firms/${firm.id}`} className="font-semibold text-navy dark:text-blue-400 hover:underline">
                            {firm.name}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{firm.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {firm.city || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(firm.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        firm.isVisibleInClientApp
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}>
                        {firm.isVisibleInClientApp ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {firm.createdAt ? new Date(firm.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {firm.status === "PENDING_REVIEW" && (
                          <>
                            <button
                              onClick={() => handleApprove(firm)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                              title="Approve"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(firm)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                              title="Reject"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(firm)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(firm)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredFirms.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold">{filteredFirms.length}</span> of <span className="font-semibold">{firms.length}</span> firms
            </p>
          </div>
        )}
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
        message="Are you sure you want to delete this firm? All associated data will be permanently removed."
        confirmText="Delete Firm"
        cancelText="Cancel"
        variant="danger"
        itemName={firmToDelete?.name}
      />
    </div>
  );
}
