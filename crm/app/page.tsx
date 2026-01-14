// file: app/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  ShoppingCart,
  Truck,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Package,
  UserCheck,
  DollarSign,
  Activity,
  Loader2,
  Star,
  MapPin,
  Calendar,
} from "lucide-react";

interface Firm {
  id: string;
  name: string;
  city: string;
  status: string;
  clientsCount: number;
  ordersCount: number;
  driversCount: number;
  logoUrl?: string;
  rating?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  firmId: string;
  firmName: string;
  clientName: string;
  status: string;
  total: number;
  createdAt: string;
}

interface Driver {
  id: string;
  name: string;
  firmName: string;
  status: string;
}

export default function DashboardPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch firms
      const firmsRes = await fetch("/api/firms");
      const firmsData = await firmsRes.json();
      const firmsArray = firmsData.firms || firmsData.data || [];
      setFirms(firmsArray);

      // Fetch orders and drivers for each firm
      const allOrders: Order[] = [];
      const allDrivers: Driver[] = [];

      for (const firm of firmsArray) {
        try {
          // Fetch orders
          const ordersRes = await fetch(`/api/orders?firmId=${firm.id}`);
          const ordersData = await ordersRes.json();
          const firmOrders = ordersData.data || ordersData.orders || [];

          for (const order of firmOrders.slice(0, 10)) {
            allOrders.push({
              id: order.id,
              orderNumber: order.orderNumber || order.order_number || `#${order.id.slice(0, 6)}`,
              firmId: firm.id,
              firmName: firm.name,
              clientName: order.user?.name || order.clientName || "Customer",
              status: order.stage || order.status || "PENDING",
              total: order.total || 0,
              createdAt: order.createdAt || order.created_at,
            });
          }

          // Fetch drivers
          const driversRes = await fetch(`/api/drivers?firmId=${firm.id}`);
          const driversData = await driversRes.json();
          const firmDrivers = driversData.drivers || driversData.data || [];

          for (const driver of firmDrivers) {
            allDrivers.push({
              id: driver.id,
              name: driver.name || "Driver",
              firmName: firm.name,
              status: driver.isAvailable || driver.is_available ? "ONLINE" : "OFFLINE",
            });
          }
        } catch (err) {
          console.error(`Error fetching data for firm ${firm.id}:`, err);
        }
      }

      // Sort orders by date and take recent ones
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(allOrders.slice(0, 10));
      setDrivers(allDrivers);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const activeFirms = firms.filter(f => f.status === "ACTIVE").length;
    const totalOrders = firms.reduce((sum, f) => sum + (f.ordersCount || 0), 0);
    const totalClients = firms.reduce((sum, f) => sum + (f.clientsCount || 0), 0);
    const onlineDrivers = drivers.filter(d => d.status === "ONLINE").length;
    const totalDrivers = drivers.length;

    // Estimate revenue (sum of recent orders * average factor)
    const recentRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalFirms: firms.length,
      activeFirms,
      totalOrders,
      totalClients,
      onlineDrivers,
      totalDrivers,
      recentRevenue,
      pendingOrders: orders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED").length,
    };
  }, [firms, orders, drivers]);

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Delivered
          </span>
        );
      case "ON_THE_WAY":
      case "DELIVERING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Truck className="w-3 h-3" />
            On the way
          </span>
        );
      case "PENDING":
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " UZS";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Platform Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor all firms, orders, and drivers across the platform
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/firms" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalFirms}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Firms</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <CheckCircle className="w-3 h-3" />
            {stats.activeFirms} active
          </div>
        </Link>

        <Link href="/orders" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-purple-300 dark:hover:border-purple-600 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            {stats.pendingOrders} pending
          </div>
        </Link>

        <Link href="/drivers" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-green-300 dark:hover:border-green-600 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalDrivers}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Drivers</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <Activity className="w-3 h-3" />
            {stats.onlineDrivers} online
          </div>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalClients}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Clients</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-3 h-3" />
            Across all firms
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link href="/orders" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No orders found</p>
              </div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.clientName} • {order.firmName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getOrderStatusBadge(order.status)}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Firms */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Firms</h2>
            <Link href="/firms" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {firms.length === 0 ? (
              <div className="p-8 text-center">
                <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No firms found</p>
              </div>
            ) : (
              firms.slice(0, 5).map((firm, index) => (
                <Link
                  key={firm.id}
                  href={`/firms/${firm.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{firm.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {firm.city || "—"}
                      {firm.rating && (
                        <>
                          <span className="mx-1">•</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {firm.rating}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{firm.ordersCount || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">orders</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Link href="/billing" className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white hover:opacity-90 transition-opacity">
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{formatCurrency(stats.recentRevenue)}</p>
          <p className="text-sm opacity-80">Recent Revenue</p>
        </Link>

        <Link href="/accounts" className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white hover:opacity-90 transition-opacity">
          <UserCheck className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{stats.activeFirms}</p>
          <p className="text-sm opacity-80">Active Firms</p>
        </Link>

        <Link href="/firm-moderation" className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white hover:opacity-90 transition-opacity">
          <AlertCircle className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{firms.filter(f => f.status === "PENDING_REVIEW").length}</p>
          <p className="text-sm opacity-80">Pending Review</p>
        </Link>

        <Link href="/drivers" className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 text-white hover:opacity-90 transition-opacity">
          <Activity className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{Math.round((stats.onlineDrivers / (stats.totalDrivers || 1)) * 100)}%</p>
          <p className="text-sm opacity-80">Drivers Online</p>
        </Link>
      </div>
    </div>
  );
}
