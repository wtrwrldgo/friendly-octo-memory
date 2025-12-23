// file: app/firm-orders/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Order, OrderStatus } from "@/types";
import {
  Plus, Edit, Trash2, Save, XCircle, RotateCcw, Search, Filter,
  Banknote, CreditCard, Package, Clock, Truck, CheckCircle2, XOctagon,
  User, Phone, MapPin, Calendar, RefreshCw, Wallet, DollarSign,
  ChevronRight, Eye, MoreHorizontal, ArrowUpRight, Smartphone
} from "lucide-react";
import { db } from "@/lib/db";

type PaymentMethod = "CASH" | "CARD" | "OTHER";

export default function FirmOrdersPage() {
  const { user, firm, loading: authLoading, isWatergoAdmin } = useAuth();
  const { theme } = useTheme();
  const toast = useToast();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [returnToQueueModalOpen, setReturnToQueueModalOpen] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState<Order | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    address: "",
    status: "PENDING" as OrderStatus,
    paymentMethod: "CASH" as PaymentMethod,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");

  // Filter orders based on search, status, and payment
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchQuery === "" ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.orderNumber?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "ALL" || order.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Payment stats
  const paymentStats = {
    CASH: orders.filter(o => o.paymentMethod === "CASH").length,
    CARD: orders.filter(o => o.paymentMethod === "CARD").length,
    OTHER: orders.filter(o => o.paymentMethod === "OTHER" || (!o.paymentMethod && o.paymentMethod !== "CASH" && o.paymentMethod !== "CARD")).length,
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const firmId = user?.firmId || firm?.id;
      if (!firmId) return;

      const { data, error } = await db.getOrders(firmId);
      if (error) {
        console.error("Failed to fetch orders:", error);
        return;
      }

      if (data) {
        const mappedOrders = data.map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber || o.order_number || `WG-${new Date().getFullYear()}-000000`,
          firmId: o.firmId || o.firm_id,
          firmName: o.firm?.name || o.firmName || firm?.name || "",
          clientName: o.user?.name || o.clientName || o.users?.name || o.user?.phone || "Unknown Client",
          address: o.address?.address || o.addressText || o.address || "",
          status: o.stage || o.status || "PENDING",
          paymentMethod: o.paymentMethod || o.payment_method || "CASH",
          total: o.total || 0,
          createdAt: o.createdAt || o.created_at,
          driverId: o.driverId || o.driver?.id || null,
          driverName: o.driver?.user?.name || o.driver?.name || o.driverName || null,
          driverPhone: o.driver?.user?.phone || o.driver?.phone || o.driverPhone || null,
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (isWatergoAdmin) {
      router.push("/");
      return;
    }

    fetchOrders();
  }, [user, firm, router, authLoading, isWatergoAdmin]);

  if (authLoading || isWatergoAdmin) {
    return null;
  }

  const openCreateModal = () => {
    setEditingOrder(null);
    setFormData({
      clientName: "",
      address: "",
      status: "PENDING",
      paymentMethod: "CASH",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      clientName: order.clientName,
      address: order.address,
      status: order.status,
      paymentMethod: (order.paymentMethod as PaymentMethod) || "CASH",
    });
    setIsModalOpen(true);
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingOrder) {
      setOrders(
        orders.map((o) =>
          o.id === editingOrder.id
            ? {
              ...o,
              clientName: formData.clientName,
              address: formData.address,
              status: formData.status,
              paymentMethod: formData.paymentMethod,
            }
            : o
        )
      );
    } else {
      const seq = orders.length + 1;
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: seq,
        firmId: firm?.id || "1",
        firmName: firm?.name || "My Firm",
        clientName: formData.clientName,
        address: formData.address,
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        createdAt: new Date().toISOString(),
      };
      setOrders([newOrder, ...orders]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        const response = await fetch(`/api/orders/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setOrders(orders.filter((o) => o.id !== id));
          toast.success('Order deleted successfully');
        } else {
          toast.error('Failed to delete order. Please try again.');
        }
      } catch (error) {
        console.error('[Orders] Delete error:', error);
        toast.error('Error deleting order.');
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
        setOrders(orders.map((o) =>
          o.id === orderToCancel.id
            ? { ...o, status: 'CANCELLED' as OrderStatus }
            : o
        ));
        toast.success('Order cancelled successfully');
        setCancelModalOpen(false);
        setOrderToCancel(null);
      } else {
        toast.error('Failed to cancel order. Please try again.');
      }
    } catch (error) {
      console.error('[Orders] Cancel error:', error);
      toast.error('Error cancelling order.');
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
        setOrders(orders.map((o) =>
          o.id === orderToReturn.id
            ? { ...o, status: 'PENDING' as OrderStatus }
            : o
        ));
        toast.success('Order returned to queue successfully');
        setReturnToQueueModalOpen(false);
        setOrderToReturn(null);
        fetchOrders();
      } else {
        toast.error('Failed to return order to queue.');
      }
    } catch (error) {
      console.error('[Orders] Return to queue error:', error);
      toast.error('Error returning order to queue.');
    }
  };

  // Get payment method config
  const getPaymentConfig = (method: string) => {
    switch (method) {
      case "CARD":
        return {
          icon: CreditCard,
          label: "Card",
          gradient: "from-violet-500 to-purple-600",
          bg: "bg-violet-100 dark:bg-violet-900/30",
          text: "text-violet-700 dark:text-violet-400",
          shadow: "shadow-violet-500/25"
        };
      case "OTHER":
        return {
          icon: Smartphone,
          label: "Other",
          gradient: "from-cyan-500 to-teal-600",
          bg: "bg-cyan-100 dark:bg-cyan-900/30",
          text: "text-cyan-700 dark:text-cyan-400",
          shadow: "shadow-cyan-500/25"
        };
      default:
        return {
          icon: Banknote,
          label: "Cash",
          gradient: "from-emerald-500 to-green-600",
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          text: "text-emerald-700 dark:text-emerald-400",
          shadow: "shadow-emerald-500/25"
        };
    }
  };

  // Status config
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; dot: string; icon: any }> = {
      PENDING: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500", icon: Clock },
      CONFIRMED: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500", icon: CheckCircle2 },
      PREPARING: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500", icon: Package },
      DELIVERING: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400", dot: "bg-indigo-500", icon: Truck },
      ASSIGNED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500", icon: User },
      ON_THE_WAY: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500", icon: Truck },
      DELIVERED: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", icon: CheckCircle2 },
      CANCELLED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", dot: "bg-red-500", icon: XOctagon },
    };
    return configs[status] || configs.PENDING;
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" : "bg-gradient-to-br from-gray-50 via-white to-gray-50"}`}>
      <div className="p-6 lg:p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/25">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Orders
                </h1>
              </div>
              <p className={`text-base ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Manage and track all your delivery orders
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchOrders()}
                className={`p-3 rounded-xl transition-all ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-white hover:bg-gray-50 text-gray-700 shadow-lg"
                }`}
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-3 rounded-xl font-semibold shadow-xl shadow-blue-500/25 transition-all"
              >
                <Plus className="w-5 h-5" />
                New Order
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total", value: orders.length, icon: Package, gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/25" },
            { label: "Pending", value: orders.filter(o => o.status === "PENDING").length, icon: Clock, gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/25" },
            { label: "In Progress", value: orders.filter(o => ["ON_THE_WAY", "ASSIGNED", "CONFIRMED", "PREPARING", "DELIVERING"].includes(o.status)).length, icon: Truck, gradient: "from-purple-500 to-indigo-600", shadow: "shadow-purple-500/25" },
            { label: "Delivered", value: orders.filter(o => o.status === "DELIVERED").length, icon: CheckCircle2, gradient: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/25" },
            { label: "Cancelled", value: orders.filter(o => o.status === "CANCELLED").length, icon: XOctagon, gradient: "from-red-500 to-rose-600", shadow: "shadow-red-500/25" },
            { label: "Revenue", value: `${orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}`, icon: DollarSign, gradient: "from-teal-500 to-cyan-600", shadow: "shadow-teal-500/25", suffix: " UZS" },
          ].map((stat, index) => (
            <div
              key={index}
              className={`relative p-4 rounded-2xl border overflow-hidden ${
                theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-lg"
              }`}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${stat.gradient}`}></div>
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadow}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className={`text-xs font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</p>
                <p className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {stat.value}{stat.suffix || ""}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Method Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { method: "CASH", count: paymentStats.CASH },
            { method: "CARD", count: paymentStats.CARD },
            { method: "OTHER", count: paymentStats.OTHER },
          ].map((item) => {
            const config = getPaymentConfig(item.method);
            return (
              <button
                key={item.method}
                onClick={() => setPaymentFilter(paymentFilter === item.method ? "ALL" : item.method)}
                className={`p-4 rounded-xl border transition-all ${
                  paymentFilter === item.method
                    ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg ${config.shadow}`
                    : theme === "dark"
                      ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800"
                      : "bg-white border-gray-200 hover:bg-gray-50 shadow-lg"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    paymentFilter === item.method
                      ? "bg-white/20"
                      : `bg-gradient-to-br ${config.gradient} shadow-lg ${config.shadow}`
                  }`}>
                    <config.icon className={`w-5 h-5 ${paymentFilter === item.method ? "text-white" : "text-white"}`} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${
                      paymentFilter === item.method
                        ? "text-white/80"
                        : theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {config.label}
                    </p>
                    <p className={`text-lg font-bold ${
                      paymentFilter === item.method
                        ? "text-white"
                        : theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {item.count} orders
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className={`rounded-2xl border p-5 mb-6 ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-lg"}`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
              <input
                type="text"
                placeholder="Search by client, order ID, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all ${
                  theme === "dark"
                    ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                }`}
              />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: "ALL", label: "All", icon: Package },
                { value: "PENDING", label: "Pending", icon: Clock },
                { value: "DELIVERING", label: "Active", icon: Truck },
                { value: "DELIVERED", label: "Done", icon: CheckCircle2 },
                { value: "CANCELLED", label: "Cancelled", icon: XOctagon },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    statusFilter === filter.value
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                      : theme === "dark"
                        ? "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <filter.icon className="w-4 h-4" />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          {(searchQuery || statusFilter !== "ALL" || paymentFilter !== "ALL") && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Found <span className={`font-bold px-2 py-0.5 rounded-lg ${theme === "dark" ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700"}`}>{filteredOrders.length}</span> of {orders.length} orders
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setPaymentFilter("ALL");
                }}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
              >
                Clear all filters
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className={`rounded-2xl border overflow-hidden ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-xl"}`}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className={`absolute inset-0 rounded-2xl ${theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"}`}></div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-blue-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className={`w-6 h-6 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                  </div>
                </div>
                <p className={`font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Loading orders...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                <Package className={`w-10 h-10 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
              </div>
              <p className={`text-lg font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {orders.length === 0 ? "No orders yet" : "No orders found"}
              </p>
              <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                {orders.length === 0 ? "Create your first order to get started" : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                  <tr>
                    <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Order</th>
                    <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Customer</th>
                    <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Driver</th>
                    <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Payment</th>
                    <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Status</th>
                    <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Date</th>
                    <th className={`px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === "dark" ? "divide-gray-700/50" : "divide-gray-100"}`}>
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const paymentConfig = getPaymentConfig(order.paymentMethod || "CASH");
                    const StatusIcon = statusConfig.icon;
                    const PaymentIcon = paymentConfig.icon;

                    return (
                      <tr
                        key={order.id}
                        className={`transition-colors ${theme === "dark" ? "hover:bg-gray-700/30" : "hover:bg-gray-50"}`}
                      >
                        <td className="px-4 py-4">
                          <div>
                            <p className={`font-mono text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                              #{order.orderNumber}
                            </p>
                            <p className={`text-xs mt-0.5 flex items-center gap-1 max-w-[180px] truncate ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {order.address || '-'}
                            </p>
                            {(order.total ?? 0) > 0 && (
                              <p className={`text-xs font-semibold mt-1 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                                {order.total?.toLocaleString()} UZS
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-blue-500/25">
                              {order.clientName.charAt(0).toUpperCase()}
                            </div>
                            <p className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                              {order.clientName}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {order.driverName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                                <Truck className="w-4 h-4" />
                              </div>
                              <p className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                {order.driverName}
                              </p>
                            </div>
                          ) : (
                            <span className={`text-sm italic ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                              Not assigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${paymentConfig.bg} ${paymentConfig.text}`}>
                            <PaymentIcon className="w-3.5 h-3.5" />
                            {paymentConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`flex items-center gap-1.5 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <p className={`text-xs mt-0.5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openDetailModal(order)}
                              className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                              title="View Details"
                            >
                              <Eye className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                            </button>
                            <button
                              onClick={() => openEditModal(order)}
                              className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-blue-900/30" : "hover:bg-blue-50"}`}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-blue-500" />
                            </button>
                            {(order.status === 'ON_THE_WAY' || order.status === 'ASSIGNED' || order.status === 'DELIVERING') && (
                              <button
                                onClick={() => openReturnToQueueModal(order)}
                                className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-amber-900/30" : "hover:bg-amber-50"}`}
                                title="Return to Queue"
                              >
                                <RotateCcw className="w-4 h-4 text-amber-500" />
                              </button>
                            )}
                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                              <button
                                onClick={() => openCancelModal(order)}
                                className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-orange-900/30" : "hover:bg-orange-50"}`}
                                title="Cancel Order"
                              >
                                <XCircle className="w-4 h-4 text-orange-500" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(order.id)}
                              className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-red-900/30" : "hover:bg-red-50"}`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrder ? "Edit Order" : "Create New Order"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Client Name
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Enter client name"
              className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all ${
                theme === "dark"
                  ? "bg-gray-700/50 border-gray-600 text-white focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Delivery Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full delivery address"
              className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all resize-none ${
                theme === "dark"
                  ? "bg-gray-700/50 border-gray-600 text-white focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
              }`}
              rows={3}
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["CASH", "CARD", "OTHER"] as PaymentMethod[]).map((method) => {
                const config = getPaymentConfig(method);
                const isSelected = formData.paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: method })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `border-transparent bg-gradient-to-br ${config.gradient} text-white shadow-lg ${config.shadow}`
                        : theme === "dark"
                          ? "border-gray-600 bg-gray-700/30 text-gray-400 hover:border-gray-500"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <config.icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? "text-white" : ""}`} />
                      <p className="text-sm font-bold">{config.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Order Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as OrderStatus })}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all ${
                theme === "dark"
                  ? "bg-gray-700/50 border-gray-600 text-white focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
              }`}
              required
            >
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned to Driver</option>
              <option value="ON_THE_WAY">On The Way</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all"
            >
              <Save className="w-5 h-5" />
              {editingOrder ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Order Header */}
            <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Order Number</p>
                  <p className={`text-2xl font-bold font-mono ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    #{selectedOrder.orderNumber}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${getStatusConfig(selectedOrder.status).bg} ${getStatusConfig(selectedOrder.status).text}`}>
                  <span className={`w-2 h-2 rounded-full ${getStatusConfig(selectedOrder.status).dot}`}></span>
                  {selectedOrder.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {(() => {
                  const paymentConfig = getPaymentConfig(selectedOrder.paymentMethod || "CASH");
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${paymentConfig.bg} ${paymentConfig.text}`}>
                      <paymentConfig.icon className="w-4 h-4" />
                      {paymentConfig.label} Payment
                    </span>
                  );
                })()}
                {(selectedOrder.total ?? 0) > 0 && (
                  <span className={`text-lg font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                    {selectedOrder.total?.toLocaleString()} UZS
                  </span>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className={`p-5 rounded-xl border ${theme === "dark" ? "bg-gray-800/30 border-gray-700" : "bg-white border-gray-200"}`}>
              <h4 className={`text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Customer</h4>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                  {selectedOrder.clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {selectedOrder.clientName}
                  </p>
                  <p className={`text-sm flex items-center gap-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedOrder.address || "No address"}
                  </p>
                </div>
              </div>
            </div>

            {/* Driver Info */}
            {selectedOrder.driverName && (
              <div className={`p-5 rounded-xl border ${theme === "dark" ? "bg-gray-800/30 border-gray-700" : "bg-white border-gray-200"}`}>
                <h4 className={`text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Driver</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {selectedOrder.driverName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Date Info */}
            <div className={`p-5 rounded-xl border ${theme === "dark" ? "bg-gray-800/30 border-gray-700" : "bg-white border-gray-200"}`}>
              <h4 className={`text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Order Date</h4>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                  <Calendar className={`w-6 h-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                </div>
                <div>
                  <p className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  openEditModal(selectedOrder);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                <Edit className="w-5 h-5" />
                Edit Order
              </button>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        title="Cancel Order"
      >
        <div className="space-y-5">
          <div className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${theme === "dark" ? "bg-red-900/30" : "bg-red-100"}`}>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className={`text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Are you sure you want to cancel this order?
            </p>
            {orderToCancel && (
              <div className={`mt-4 p-4 rounded-xl ${theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"}`}>
                <p className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Order #{orderToCancel.orderNumber}
                </p>
                <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Client: {orderToCancel.clientName}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCancelModalOpen(false);
                setOrderToCancel(null);
              }}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              Keep Order
            </button>
            <button
              onClick={handleCancelOrder}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-red-500/25 transition-all"
            >
              <XCircle className="w-5 h-5" />
              Cancel Order
            </button>
          </div>
        </div>
      </Modal>

      {/* Return to Queue Modal */}
      <Modal
        isOpen={returnToQueueModalOpen}
        onClose={() => {
          setReturnToQueueModalOpen(false);
          setOrderToReturn(null);
        }}
        title="Return to Queue"
      >
        <div className="space-y-5">
          <div className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${theme === "dark" ? "bg-amber-900/30" : "bg-amber-100"}`}>
              <RotateCcw className="w-8 h-8 text-amber-500" />
            </div>
            <p className={`text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Return this order to the queue?
            </p>
            {orderToReturn && (
              <div className={`mt-4 p-4 rounded-xl ${theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"}`}>
                <p className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Order #{orderToReturn.orderNumber}
                </p>
                <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Client: {orderToReturn.clientName}
                </p>
              </div>
            )}
            <p className={`text-sm mt-4 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
              The driver will be removed and the order will be available for another driver.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setReturnToQueueModalOpen(false);
                setOrderToReturn(null);
              }}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              Keep Driver
            </button>
            <button
              onClick={handleReturnToQueue}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Return to Queue
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
