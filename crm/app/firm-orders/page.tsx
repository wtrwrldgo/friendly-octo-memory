// file: app/firm-orders/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useFirmData } from "@/contexts/FirmDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Order, OrderStatus } from "@/types";
import { Plus, Edit, Trash2, Save, XCircle, RotateCcw, Search, Filter, Banknote, CreditCard, Package, Clock, Truck, CheckCircle2, XOctagon, User, Phone, MapPin, Calendar, RefreshCw } from "lucide-react";

export default function FirmOrdersPage() {
  const { user, firm, loading: authLoading, isWatergoAdmin } = useAuth();
  const toast = useToast();
  const { orders, ordersLoading, fetchOrders } = useFirmData();
  const { t } = useLanguage();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [returnToQueueModalOpen, setReturnToQueueModalOpen] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    address: "",
    status: "PENDING" as OrderStatus,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch = searchQuery === "" ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.orderNumber?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  }), [orders, searchQuery, statusFilter]);

  const loading = ordersLoading;

  useEffect(() => {
    console.log('[FirmOrdersPage] useEffect running, authLoading:', authLoading, 'user:', !!user, 'isWatergoAdmin:', isWatergoAdmin);
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (isWatergoAdmin) {
      router.push("/");
      return;
    }

    // Will use cached data if available
    console.log('[FirmOrdersPage] About to call fetchOrders');
    fetchOrders();
  }, [user, router, authLoading, isWatergoAdmin, fetchOrders]);

  if (authLoading || isWatergoAdmin) {
    return null;
  }

  const openCreateModal = () => {
    setEditingOrder(null);
    setFormData({
      clientName: "",
      address: "",
      status: "PENDING",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      clientName: order.clientName,
      address: order.address,
      status: order.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual API call for create/update
    // For now, just close modal and refresh
    setIsModalOpen(false);
    toast.success(editingOrder ? t.orders.orderUpdated : t.orders.orderCreated);
    fetchOrders(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t.orders.deleteConfirm)) {
      try {
        const response = await fetch(`/api/orders/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success(t.orders.orderDeleted);
          fetchOrders(true);
        } else {
          toast.error(t.orders.deleteFailed);
        }
      } catch (error) {
        console.error('[Orders] Delete error:', error);
        toast.error(t.orders.errorDeleting);
      }
    }
  };

  const openCancelModal = (order: Order) => {
    setOrderToCancel(order);
    setCancelModalOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      const response = await fetch(`/api/orders/${orderToCancel.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast.success(t.orders.orderCancelled);
        setCancelModalOpen(false);
        setOrderToCancel(null);
        fetchOrders(true);
      } else {
        toast.error(t.orders.cancelFailed);
      }
    } catch (error) {
      console.error('[Orders] Cancel error:', error);
      toast.error(t.orders.errorCancelling);
    }
  };

  const openReturnToQueueModal = (order: Order) => {
    setOrderToReturn(order);
    setReturnToQueueModalOpen(true);
  };

  const handleReturnToQueue = async () => {
    if (!orderToReturn) return;

    try {
      const response = await fetch(`/api/orders/${orderToReturn.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'PENDING' }),
      });

      if (response.ok) {
        toast.success(t.orders.orderReturned);
        setReturnToQueueModalOpen(false);
        setOrderToReturn(null);
        fetchOrders(true);
      } else {
        toast.error(t.orders.returnFailed);
      }
    } catch (error) {
      console.error('[Orders] Return to queue error:', error);
      toast.error(t.orders.errorReturning);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={t.orders.myOrders}
          description={t.orders.description}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            {t.orders.createOrder}
          </button>
        </div>
      </div>

      <div className="mb-8">
        {/* Stats Cards - Premium Design */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8">
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">{t.dashboard.totalOrders}</p>
                <p className="text-4xl font-bold text-white mt-2">{orders.length}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-amber-100">{t.orders.pending}</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {orders.filter((o) => o.status === "PENDING").length}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100">{t.orders.inProgress}</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {orders.filter((o) => ["ON_THE_WAY", "ASSIGNED", "CONFIRMED", "PREPARING", "DELIVERING"].includes(o.status)).length}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-100">{t.orders.delivered}</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {orders.filter((o) => o.status === "DELIVERED").length}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-rose-500 to-red-600 shadow-xl shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-red-100">{t.orders.cancelled}</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {orders.filter((o) => o.status === "CANCELLED").length}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <XOctagon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter - Premium Design */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-5 mb-6 shadow-xl shadow-gray-200/50 dark:shadow-none">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <input
                type="text"
                placeholder={t.orders.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { value: "ALL", label: t.orders.all, icon: Package, color: "blue" },
                { value: "PENDING", label: t.orders.pending, icon: Clock, color: "amber" },
                { value: "DELIVERING", label: t.orders.active, icon: Truck, color: "purple" },
                { value: "DELIVERED", label: t.orders.done, icon: CheckCircle2, color: "emerald" },
                { value: "CANCELLED", label: t.orders.cancelled, icon: XOctagon, color: "red" },
              ].map((filter) => {
                const Icon = filter.icon;
                const isActive = statusFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                        : "bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchOrders(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all font-semibold shadow-sm hover:shadow-md"
              title={t.orders.refresh}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t.orders.refresh}</span>
            </button>
          </div>

          {/* Results count */}
          {(searchQuery || statusFilter !== "ALL") && (
            <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-200/50 dark:border-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.orders.found} <span className="font-bold text-gray-900 dark:text-white bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">{filteredOrders.length}</span> {t.orders.of} {orders.length} {t.orders.ordersText}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t.orders.clearAllFilters}
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Orders Table with Actions */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{t.orders.loadingOrders}</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Search className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xl font-semibold mb-2">
                {orders.length === 0 ? t.orders.noOrdersYet : t.orders.noOrders}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                {orders.length === 0 ? t.orders.createFirstOrder : t.orders.tryAdjustingSearch}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.orders.order}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.orders.customer}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.orders.driver}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.orders.status}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.orders.date}
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.orders.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filteredOrders.map((order, index) => {
                    const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
                      PENDING: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
                      CONFIRMED: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" },
                      PREPARING: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
                      DELIVERING: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-400", dot: "bg-indigo-500" },
                      ASSIGNED: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
                      ON_THE_WAY: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" },
                      DELIVERED: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
                      CANCELLED: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
                    };
                    const statusStyle = statusConfig[order.status] || statusConfig.PENDING;

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                              #{order.orderNumber}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px] truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {order.address || '-'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {order.clientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {order.clientName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {order.driverName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                                <Truck className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                  {order.driverName}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                              {t.orders.notAssigned}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(order)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title={t.common.edit}
                            >
                              <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            {(order.status === 'ON_THE_WAY' || order.status === 'ASSIGNED' || order.status === 'DELIVERING') && (
                              <button
                                onClick={() => openReturnToQueueModal(order)}
                                className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                                title={t.orders.returnToQueue}
                              >
                                <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              </button>
                            )}
                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                              <button
                                onClick={() => openCancelModal(order)}
                                className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                                title={t.orders.cancelOrder}
                              >
                                <XCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title={t.common.delete}
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrder ? t.orders.editOrder : t.orders.createNewOrder}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.orders.clientName}
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder={t.orders.enterClientName}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.orders.deliveryAddress}
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t.orders.enterAddress}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.orders.orderStatus}
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as OrderStatus })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            >
              <option value="PENDING">{t.orders.pending}</option>
              <option value="ASSIGNED">{t.orders.assigned}</option>
              <option value="ON_THE_WAY">{t.orders.onTheWay}</option>
              <option value="DELIVERED">{t.orders.delivered}</option>
              <option value="CANCELLED">{t.orders.cancelled}</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
            >
              <Save className="w-5 h-5" />
              {editingOrder ? t.orders.updateOrder : t.orders.createOrder}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        title={t.orders.cancelOrder}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              {t.orders.cancelOrderConfirm}
            </p>
            {orderToCancel && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {t.orders.order} #{orderToCancel.orderNumber}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t.orders.client}: {orderToCancel.clientName}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setCancelModalOpen(false);
                setOrderToCancel(null);
              }}
              className="flex-1 px-6 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105"
            >
              {t.orders.keepOrder}
            </button>
            <button
              type="button"
              onClick={handleCancelOrder}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-red-500/30 transition-all hover:scale-105"
            >
              <XCircle className="w-5 h-5" />
              {t.orders.cancelOrder}
            </button>
          </div>
        </div>
      </Modal>

      {/* Return to Queue Confirmation Modal */}
      <Modal
        isOpen={returnToQueueModalOpen}
        onClose={() => {
          setReturnToQueueModalOpen(false);
          setOrderToReturn(null);
        }}
        title={t.orders.returnToQueueTitle}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <RotateCcw className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              {t.orders.returnToQueueConfirm}
            </p>
            {orderToReturn && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {t.orders.order} #{orderToReturn.orderNumber}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t.orders.client}: {orderToReturn.clientName}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {t.orders.returnToQueueDescription}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setReturnToQueueModalOpen(false);
                setOrderToReturn(null);
              }}
              className="flex-1 px-6 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105"
            >
              {t.orders.keepDriver}
            </button>
            <button
              type="button"
              onClick={handleReturnToQueue}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-amber-500/30 transition-all hover:scale-105"
            >
              <RotateCcw className="w-5 h-5" />
              {t.orders.returnToQueue}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
