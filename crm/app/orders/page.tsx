// file: app/orders/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Building2,
  User,
  MapPin,
  Phone,
  Calendar,
  Loader2,
  DollarSign,
  ExternalLink,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  firmId: string;
  firmName: string;
  clientName: string;
  clientPhone?: string;
  address: string;
  status: string;
  total: number;
  createdAt: string;
  driverName?: string;
}

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "PREPARING" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [firmFilter, setFirmFilter] = useState<string>("ALL");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch all firms first
      const firmsRes = await fetch("/api/firms");
      const firmsData = await firmsRes.json();
      const firms = firmsData.firms || firmsData.data || [];

      // Fetch orders for each firm
      const allOrders: Order[] = [];

      for (const firm of firms) {
        try {
          const ordersRes = await fetch(`/api/orders?firmId=${firm.id}`);
          const ordersData = await ordersRes.json();
          const firmOrders = ordersData.data || ordersData.orders || [];

          for (const order of firmOrders) {
            allOrders.push({
              id: order.id,
              orderNumber: order.orderNumber || order.order_number || `#${(order.id || "").slice(0, 8)}`,
              firmId: firm.id,
              firmName: firm.name,
              clientName: order.user?.name || order.clientName || order.users?.name || "Customer",
              clientPhone: order.user?.phone || order.clientPhone || order.users?.phone || "",
              address: order.addresses?.address || order.address || "No address",
              status: order.stage || order.status || "PENDING",
              total: order.total || 0,
              createdAt: order.createdAt || order.created_at || new Date().toISOString(),
              driverName: order.drivers?.name || order.driver?.name || order.driverName || null,
            });
          }
        } catch (err) {
          console.error(`Failed to fetch orders for firm ${firm.id}:`, err);
        }
      }

      // Sort by date descending
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(allOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Get unique firms for filter
  const uniqueFirms = useMemo(() => {
    const firms = new Map<string, string>();
    orders.forEach(o => {
      if (o.firmId && o.firmName) {
        firms.set(o.firmId, o.firmName);
      }
    });
    return Array.from(firms.entries());
  }, [orders]);

  // Stats
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED").length,
    onTheWay: orders.filter(o => o.status === "ON_THE_WAY" || o.status === "DELIVERING").length,
    delivered: orders.filter(o => o.status === "DELIVERED").length,
    cancelled: orders.filter(o => o.status === "CANCELLED").length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
  }), [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        (order.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.clientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.firmName || "").toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = statusFilter === "ALL";
      if (statusFilter === "PENDING") matchesStatus = order.status === "PENDING" || order.status === "CONFIRMED";
      else if (statusFilter === "ON_THE_WAY") matchesStatus = order.status === "ON_THE_WAY" || order.status === "DELIVERING";
      else if (statusFilter !== "ALL") matchesStatus = order.status === statusFilter;

      const matchesFirm = firmFilter === "ALL" || order.firmId === firmFilter;

      return matchesSearch && matchesStatus && matchesFirm;
    });
  }, [orders, searchQuery, statusFilter, firmFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            <CheckCircle className="w-3 h-3" />
            Delivered
          </span>
        );
      case "ON_THE_WAY":
      case "DELIVERING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            <Truck className="w-3 h-3" />
            On the way
          </span>
        );
      case "PREPARING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            <Package className="w-3 h-3" />
            Preparing
          </span>
        );
      case "PENDING":
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US").format(amount) + " UZS";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
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
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Global Orders
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          All orders across all firms in real-time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer transition-all ${
            statusFilter === "ALL"
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("PENDING")}
          className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer transition-all ${
            statusFilter === "PENDING"
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("ON_THE_WAY")}
          className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer transition-all ${
            statusFilter === "ON_THE_WAY"
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.onTheWay}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">On the way</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("DELIVERED")}
          className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer transition-all ${
            statusFilter === "DELIVERED"
              ? "border-green-500 ring-2 ring-green-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.delivered}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("CANCELLED")}
          className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer transition-all ${
            statusFilter === "CANCELLED"
              ? "border-red-500 ring-2 ring-red-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cancelled}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order #, client, address, or firm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>

            {/* Firm Filter */}
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <select
                value={firmFilter}
                onChange={(e) => setFirmFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="ALL">All Firms</option>
                {uniqueFirms.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PREPARING">Preparing</option>
                <option value="ON_THE_WAY">On the way</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Firm</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ShoppingCart className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                          {order.driverName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <Truck className="w-3 h-3 inline mr-1" />
                              {order.driverName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{order.clientName}</p>
                        {order.clientPhone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Phone className="w-3 h-3" />
                            {order.clientPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/firms/${order.firmId}`}
                        className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {order.firmName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1 text-sm text-gray-600 dark:text-gray-400 max-w-[200px]">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span className="truncate">{order.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                        {formatCurrency(order.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with total */}
        {filteredOrders.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Showing {filteredOrders.length} of {orders.length} orders
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                Total Revenue: {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
