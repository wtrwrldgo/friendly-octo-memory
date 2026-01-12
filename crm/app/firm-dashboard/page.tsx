// file: app/firm-dashboard/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useFirmData } from "@/contexts/FirmDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  TrendingUp, ShoppingCart, Truck, Users, ArrowRight,
  DollarSign, Package, Calendar, ChevronRight, Plus,
  BarChart3, Target, MapPin, Clock, Phone, Sparkles,
  ArrowUpRight, Activity, Zap
} from "lucide-react";

export default function FirmDashboardPage() {
  const { user, firm, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const {
    orders: allOrders,
    ordersLoading,
    fetchOrders,
    drivers,
    driversLoading,
    fetchDrivers,
    clients,
    clientsLoading,
    fetchClients,
  } = useFirmData();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    fetchOrders();
    fetchDrivers();
    fetchClients();
  }, [user, router, authLoading, fetchOrders, fetchDrivers, fetchClients]);

  const orders = useMemo(() => allOrders.slice(0, 5), [allOrders]);

  const stats = useMemo(() => ({
    ordersCount: allOrders.length,
    driversCount: drivers.length,
    clientsCount: clients.length,
    revenue: allOrders.reduce((sum, o) => sum + (o.total || 0), 0),
  }), [allOrders, drivers, clients]);

  const loading = ordersLoading || driversLoading || clientsLoading;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const onlineDrivers = drivers.filter(d => d.status === "ONLINE" || d.status === "DELIVERING").length;
  const pendingOrders = allOrders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PREPARING").length;
  const deliveredOrders = allOrders.filter(o => o.status === "DELIVERED").length;
  const todayOrders = allOrders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const now = new Date();
  const greeting = now.getHours() < 12 ? t.dashboard.goodMorning : now.getHours() < 18 ? t.dashboard.goodAfternoon : t.dashboard.goodEvening;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('uz-UZ').format(value) + ' UZS';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DELIVERED': return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' };
      case 'CONFIRMED': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' };
      case 'PREPARING': return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' };
      case 'DELIVERING': case 'ON_THE_WAY': return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' };
      case 'CANCELLED': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' };
      case 'PENDING': return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' };
      default: return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', dot: 'bg-gray-500' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{t.dashboard.welcomeBack}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {greeting}, {user.name?.split(" ")[0] || "there"}!
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {firm?.name || "Your Firm"} • {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <button
              onClick={() => router.push("/firm-order-create")}
              className="group flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>{t.dashboard.newOrder}</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </button>
          </div>
        </div>

        {/* Stats Cards - Modern Gradient Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Revenue Card */}
          <div
            className="group relative overflow-hidden p-5 md:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)' }}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  <TrendingUp className="w-3 h-3 text-white" />
                  <span className="text-xs font-semibold text-white">+12%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-emerald-100 mb-1">{t.dashboard.totalRevenue}</p>
              <p className="text-xl md:text-2xl font-bold text-white truncate">
                {formatCurrency(stats.revenue)}
              </p>
            </div>
          </div>

          {/* Orders Card */}
          <div
            className="group relative overflow-hidden p-5 md:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #4f46e5 100%)' }}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                {pendingOrders > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400/90 animate-pulse">
                    <Clock className="w-3 h-3 text-amber-900" />
                    <span className="text-xs font-semibold text-amber-900">{pendingOrders}</span>
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-blue-100 mb-1">{t.dashboard.totalOrders}</p>
              <p className="text-xl md:text-2xl font-bold text-white">{stats.ordersCount}</p>
            </div>
          </div>

          {/* Drivers Card */}
          <div
            className="group relative overflow-hidden p-5 md:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #d97706 100%)' }}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-xs font-semibold text-white">{onlineDrivers} {t.dashboard.online}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-orange-100 mb-1">{t.dashboard.activeDrivers}</p>
              <p className="text-xl md:text-2xl font-bold text-white">{stats.driversCount}</p>
            </div>
          </div>

          {/* Clients Card */}
          <div
            className="group relative overflow-hidden p-5 md:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #4f46e5 100%)' }}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  <Zap className="w-3 h-3 text-white" />
                  <span className="text-xs font-semibold text-white">{t.dashboard.active}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-purple-100 mb-1">{t.dashboard.totalClients}</p>
              <p className="text-xl md:text-2xl font-bold text-white">{stats.clientsCount}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Gradient Style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-8">
          <button
            onClick={() => router.push("/firm-orders")}
            className="group p-4 md:p-5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-none hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{t.nav.orders}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stats.ordersCount} {t.dashboard.total}</p>
          </button>

          <button
            onClick={() => router.push("/firm-drivers")}
            className="group p-4 md:p-5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-none hover:shadow-xl hover:shadow-orange-500/20 dark:hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/30">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{t.nav.drivers}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{onlineDrivers} {t.dashboard.online}</p>
          </button>

          <button
            onClick={() => router.push("/firm-clients")}
            className="group p-4 md:p-5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-none hover:shadow-xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{t.nav.clients}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stats.clientsCount} {t.dashboard.total}</p>
          </button>

          <button
            onClick={() => router.push("/firm-products")}
            className="group p-4 md:p-5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-none hover:shadow-xl hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{t.nav.products}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.dashboard.manage}</p>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Orders - Glass Card */}
          <div className="lg:col-span-2 rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-none">
            <div className="p-5 md:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    {t.dashboard.recentOrders}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {todayOrders} {t.dashboard.ordersToday}
                  </p>
                </div>
                <button
                  onClick={() => router.push("/firm-orders")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {t.dashboard.viewAll}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{t.dashboard.noOrders}</p>
                <button
                  onClick={() => router.push("/firm-order-create")}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  {t.dashboard.createFirstOrder}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {orders.map((order, index) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div
                      key={order.id}
                      className="p-4 md:p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all"
                      onClick={() => router.push(`/firm-orders?id=${order.id}`)}
                    >
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                        {order.clientName?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {order.clientName}
                          </p>
                          <span className="text-xs font-mono text-gray-400">#{String(order.orderNumber || '').slice(-6)}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {order.address || "-"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                          {order.status.replace(/_/g, " ")}
                        </span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                          {formatCurrency(order.total || 0)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Performance Card */}
            <div className="rounded-3xl p-5 md:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-none">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {t.dashboard.todaysPerformance}
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">{t.dashboard.ordersCompleted}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {deliveredOrders}/{stats.ordersCount}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: stats.ordersCount > 0 ? `${(deliveredOrders / stats.ordersCount) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">{t.dashboard.driverAvailability}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {onlineDrivers}/{stats.driversCount}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: stats.driversCount > 0 ? `${(onlineDrivers / stats.driversCount) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">{t.dashboard.pendingOrders}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {pendingOrders}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: stats.ordersCount > 0 ? `${(pendingOrders / stats.ordersCount) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drivers Card */}
            <div className="rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-none">
              <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30">
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {t.nav.drivers}
                    </h3>
                  </div>
                  <button
                    onClick={() => router.push("/firm-drivers")}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {drivers.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                    <Truck className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.noDrivers}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {drivers.slice(0, 4).map((driver) => (
                    <div key={driver.id} className="p-4 flex items-center gap-3 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-lg ${
                        driver.status === "ONLINE" || driver.status === "DELIVERING"
                          ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30"
                          : "bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-400/30"
                      }`}>
                        {driver.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {driver.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {driver.carPlate || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          driver.status === "ONLINE" ? "bg-green-500 animate-pulse" :
                          driver.status === "DELIVERING" ? "bg-blue-500 animate-pulse" : "bg-gray-400"
                        }`}></span>
                        <span className={`text-xs font-medium ${
                          driver.status === "ONLINE" ? "text-green-600 dark:text-green-400" :
                          driver.status === "DELIVERING" ? "text-blue-600 dark:text-blue-400" : "text-gray-500"
                        }`}>
                          {driver.status === "ONLINE" ? t.dashboard.online : driver.status === "DELIVERING" ? t.dashboard.delivering : t.dashboard.offline}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
