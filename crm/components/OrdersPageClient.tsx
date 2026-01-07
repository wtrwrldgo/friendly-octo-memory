// file: components/OrdersPageClient.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ShoppingCart, Building2, ChevronDown, RefreshCw, Search, MapPin,
  Clock, CheckCircle2, XCircle, Package, Truck, User, Calendar,
  DollarSign, Eye, TrendingUp, AlertCircle, Hash, Sparkles
} from "lucide-react";
import { Order } from "@/types";

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "PREPARING" | "DELIVERING" | "DELIVERED" | "CANCELLED";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " sum";
}

function formatRelativeTime(dateString: string | null) {
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

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  PENDING: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: CheckCircle2 },
  PREPARING: { label: "Preparing", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", icon: Package },
  DELIVERING: { label: "Delivering", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", icon: Truck },
  DELIVERED: { label: "Delivered", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: XCircle },
};

export default function OrdersPageClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFirm, setSelectedFirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFirmFilterOpen, setIsFirmFilterOpen] = useState(false);

  // Get unique firms from orders data
  const uniqueFirms = useMemo(() => {
    const firms = new Map<string, { id: string; name: string }>();
    orders.forEach(order => {
      if (order.firmId && order.firmName) {
        firms.set(order.firmId, {
          id: order.firmId,
          name: order.firmName
        });
      }
    });
    return Array.from(firms.values());
  }, [orders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === "PENDING").length,
    delivering: orders.filter(o => o.status === "DELIVERING").length,
    delivered: orders.filter(o => o.status === "DELIVERED").length,
    cancelled: orders.filter(o => o.status === "CANCELLED").length,
    revenue: orders.filter(o => o.status === "DELIVERED").reduce((acc, o) => acc + (o.total || 0), 0),
  }), [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Firm filter
      if (selectedFirm && order.firmId !== selectedFirm) return false;
      // Status filter
      if (statusFilter !== "ALL" && order.status !== statusFilter) return false;
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          order.orderNumber?.toString().toLowerCase().includes(query) ||
          order.address?.toLowerCase().includes(query) ||
          order.firmName?.toLowerCase().includes(query) ||
          order.clientName?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [orders, selectedFirm, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/3 rounded-full blur-[200px]" />
      </div>

      {/* Header */}
      <div className="relative border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Orders</h1>
                <p className="text-slate-400 text-sm mt-0.5">Monitor all platform orders</p>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="group flex items-center gap-2.5 px-5 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 text-slate-400 group-hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-5 mb-8">
          {/* Total Orders */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">Total Orders</span>
                <div className="w-11 h-11 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl flex items-center justify-center border border-orange-500/20">
                  <ShoppingCart className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-white tracking-tight">{stats.total}</p>
              <p className="text-xs text-slate-500 mt-2">All time orders</p>
            </div>
          </div>

          {/* Pending */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">Pending</span>
                <div className="w-11 h-11 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-amber-400 tracking-tight">{stats.pending}</p>
              <p className="text-xs text-slate-500 mt-2">Awaiting action</p>
            </div>
          </div>

          {/* Delivering */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">Delivering</span>
                <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                  <Truck className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-cyan-400 tracking-tight">{stats.delivering}</p>
              <p className="text-xs text-slate-500 mt-2">In transit</p>
            </div>
          </div>

          {/* Delivered */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">Delivered</span>
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-emerald-400 tracking-tight">{stats.delivered}</p>
              <p className="text-xs text-slate-500 mt-2">Completed</p>
            </div>
          </div>

          {/* Revenue */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">Revenue</span>
                <div className="w-11 h-11 bg-gradient-to-br from-green-500/20 to-emerald-600/10 rounded-xl flex items-center justify-center border border-green-500/20">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-400 tracking-tight">{formatCurrency(stats.revenue)}</p>
              <p className="text-xs text-slate-500 mt-2">From delivered</p>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
          {/* Filters */}
          <div className="px-6 py-5 border-b border-slate-700/50">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="flex bg-slate-900/50 rounded-xl p-1 border border-slate-700/50">
                {(["ALL", "PENDING", "DELIVERING", "DELIVERED", "CANCELLED"] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                      statusFilter === status
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {status === "ALL" ? "All" : statusConfig[status]?.label || status}
                  </button>
                ))}
              </div>

              {/* Firm Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsFirmFilterOpen(!isFirmFilterOpen)}
                  className="flex items-center gap-2.5 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm hover:border-slate-600 transition-all"
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300">{selectedFirm ? uniqueFirms.find(f => f.id === selectedFirm)?.name : "All Firms"}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>
                {isFirmFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 w-56 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl z-50 py-2 backdrop-blur-xl">
                    <button
                      onClick={() => { setSelectedFirm(null); setIsFirmFilterOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-700/50 transition ${!selectedFirm ? 'text-orange-400 font-medium' : 'text-slate-300'}`}
                    >
                      All Firms
                    </button>
                    {uniqueFirms.map(firm => (
                      <button
                        key={firm.id}
                        onClick={() => { setSelectedFirm(firm.id); setIsFirmFilterOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-700/50 transition ${selectedFirm === firm.id ? 'text-orange-400 font-medium' : 'text-slate-300'}`}
                      >
                        {firm.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="px-6 py-4 bg-slate-900/30 border-b border-slate-700/30">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Firm</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</div>
              <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Date</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-700/30">
            {loading ? (
              <div className="py-20 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl" />
                  <RefreshCw className="relative w-10 h-10 text-orange-400 animate-spin mx-auto" />
                </div>
                <p className="text-slate-400 mt-4 font-medium">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-20 text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-slate-500/10 rounded-full blur-xl" />
                  <div className="relative w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto">
                    <ShoppingCart className="w-8 h-8 text-slate-600" />
                  </div>
                </div>
                <p className="text-slate-300 font-semibold text-lg">No orders found</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;

                return (
                  <div key={order.id} className="px-6 py-4 hover:bg-slate-700/20 transition-all duration-300 group">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Order Number */}
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-semibold text-white">{order.orderNumber}</span>
                        </div>
                      </div>

                      {/* Customer */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-700/50 rounded-xl flex items-center justify-center border border-slate-600/30">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-sm text-slate-300 truncate group-hover:text-white transition-colors">{order.clientName || 'Guest'}</span>
                        </div>
                      </div>

                      {/* Firm */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-600" />
                          <span className="text-sm text-slate-400 truncate">{order.firmName || 'Unknown'}</span>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                          <span className="text-sm text-slate-500 truncate">{order.address || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${config.bg} ${config.color} border ${config.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="col-span-1">
                        <span className="text-sm font-semibold text-white">
                          {order.total ? formatCurrency(order.total) : '—'}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-sm text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRelativeTime(order.createdAt || null)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {!loading && filteredOrders.length > 0 && (
            <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/30">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-300">{filteredOrders.length}</span> of <span className="font-semibold text-slate-300">{orders.length}</span> orders
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
