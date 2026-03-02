// file: app/firm-dashboard/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useFirmData } from "@/contexts/FirmDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  ShoppingCart, Truck, Users, ArrowRight,
  DollarSign, Package, ChevronRight, Plus,
  Target, MapPin, Clock, Sparkles,
  ArrowUpRight, Activity, Zap
} from "lucide-react";

export default function FirmDashboardPage() {
  const { user, firm, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
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

  // Last 5 most recent orders
  const orders = useMemo(() =>
    [...allOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [allOrders]
  );

  const stats = useMemo(() => ({
    ordersCount: allOrders.length,
    driversCount: drivers.length,
    clientsCount: clients.length,
    totalRevenue: allOrders.reduce((sum, o) => sum + (o.total || 0), 0),
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

  const now = new Date();
  const isToday = (date: string) => new Date(date).toDateString() === now.toDateString();

  // Real-time driver counts
  const onlineDrivers = drivers.filter(d => d.status === "ONLINE" || d.status === "DELIVERING").length;
  const availableDrivers = drivers.filter(d => d.status === "ONLINE").length; // truly free (not delivering)

  // All unresolved pending orders (regardless of date — these need attention)
  const pendingOrders = allOrders.filter(o =>
    o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PREPARING"
  ).length;

  // Today-specific stats
  const todayOrders = allOrders.filter(o => isToday(o.createdAt)).length;
  const todayRevenue = allOrders.filter(o => isToday(o.createdAt)).reduce((sum, o) => sum + (o.total || 0), 0);
  const todayDelivered = allOrders.filter(o => o.status === "DELIVERED" && isToday(o.createdAt)).length;
  const todayPending = allOrders.filter(o =>
    (o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PREPARING") && isToday(o.createdAt)
  ).length;

  const greeting = now.getHours() < 12 ? t.dashboard.goodMorning : now.getHours() < 18 ? t.dashboard.goodAfternoon : t.dashboard.goodEvening;
  const localeMap: Record<string, string> = { en: 'en-US', ru: 'ru-RU', uz: 'uz-UZ', kaa: 'kk-KZ' };
  const dateLocale = localeMap[language] || 'en-US';

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('uz-UZ').format(value) + ' UZS';

  const formatStatus = (status: string) =>
    status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  const formatOrderNumber = (orderNumber: string | number | undefined) => {
    const str = String(orderNumber || '');
    return '#' + (str.includes('-') ? str.split('-').pop() : str.slice(-4));
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DELIVERED':   return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' };
      case 'CONFIRMED':   return { bg: 'bg-blue-100 dark:bg-blue-900/30',       text: 'text-blue-700 dark:text-blue-400',       dot: 'bg-blue-500' };
      case 'PREPARING':   return { bg: 'bg-amber-100 dark:bg-amber-900/30',     text: 'text-amber-700 dark:text-amber-400',     dot: 'bg-amber-500' };
      case 'DELIVERING':
      case 'ON_THE_WAY':  return { bg: 'bg-purple-100 dark:bg-purple-900/30',   text: 'text-purple-700 dark:text-purple-400',   dot: 'bg-purple-500' };
      case 'CANCELLED':   return { bg: 'bg-red-100 dark:bg-red-900/30',         text: 'text-red-700 dark:text-red-400',         dot: 'bg-red-500' };
      case 'PENDING':     return { bg: 'bg-orange-100 dark:bg-orange-900/30',   text: 'text-orange-700 dark:text-orange-400',   dot: 'bg-orange-500' };
      default:            return { bg: 'bg-gray-100 dark:bg-gray-800',          text: 'text-gray-700 dark:text-gray-400',       dot: 'bg-gray-500' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{t.dashboard.welcomeBack}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {greeting}, {user.name?.split(" ")[0] || "there"}!
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {firm?.name || "Your Firm"} • {now.toLocaleDateString(dateLocale, { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <button
              onClick={() => router.push("/firm-order-create")}
              className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>{t.dashboard.newOrder}</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </button>
          </div>
        </div>

        {/* Stats Cards — show today's data, all-time as sub-info */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">

          {/* Today's Revenue */}
          <div
            className="group relative overflow-hidden p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
            <div className="relative">
              <div className="p-2 rounded-lg bg-white/20 w-fit mb-3">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-medium text-emerald-100 mb-1">{t.dashboard.todayRevenue}</p>
              <p className="text-lg md:text-xl font-bold text-white truncate" title={formatCurrency(todayRevenue)}>
                {formatCurrency(todayRevenue)}
              </p>
              <p className="text-xs text-emerald-200/70 mt-1 truncate">
                {formatCurrency(stats.totalRevenue)} {t.dashboard.allTime}
              </p>
            </div>
          </div>

          {/* Today's Orders */}
          <div
            className="group relative overflow-hidden p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #4f46e5 100%)' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                {pendingOrders > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/90">
                    <Clock className="w-3 h-3 text-amber-900" />
                    <span className="text-xs font-semibold text-amber-900">{pendingOrders}</span>
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-blue-100 mb-1">{t.dashboard.todayOrders}</p>
              <p className="text-lg md:text-xl font-bold text-white">{todayOrders}</p>
              <p className="text-xs text-blue-200/70 mt-1">
                {stats.ordersCount} {t.dashboard.allTime}
              </p>
            </div>
          </div>

          {/* Active Drivers (online + delivering) */}
          <div
            className="group relative overflow-hidden p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #d97706 100%)' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                {stats.driversCount !== onlineDrivers && (
                  <div className="px-2 py-0.5 rounded-full bg-white/20">
                    <span className="text-xs font-semibold text-white">{stats.driversCount} {t.dashboard.total}</span>
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-orange-100 mb-1">{t.dashboard.activeDrivers}</p>
              <p className="text-lg md:text-xl font-bold text-white">{onlineDrivers}</p>
              <p className="text-xs text-orange-200/70 mt-1">
                {availableDrivers} {t.dashboard.available}
              </p>
            </div>
          </div>

          {/* Total Clients */}
          <div
            className="group relative overflow-hidden p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #4f46e5 100%)' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="px-2 py-0.5 rounded-full bg-white/20">
                  <Zap className="w-3 h-3 text-white inline mr-1" />
                  <span className="text-xs font-semibold text-white">{t.dashboard.active}</span>
                </div>
              </div>
              <p className="text-xs font-medium text-purple-100 mb-1">{t.dashboard.totalClients}</p>
              <p className="text-lg md:text-xl font-bold text-white">{stats.clientsCount}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => router.push("/firm-orders")}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200 hover:-translate-y-0.5 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.nav.orders}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stats.ordersCount} {t.dashboard.total}</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/firm-drivers")}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:shadow-orange-500/10 transition-all duration-200 hover:-translate-y-0.5 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/30">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.nav.drivers}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{onlineDrivers} {t.dashboard.online}</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/firm-clients")}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:shadow-purple-500/10 transition-all duration-200 hover:-translate-y-0.5 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/30">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.nav.clients}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stats.clientsCount} {t.dashboard.total}</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/firm-products")}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-200 hover:-translate-y-0.5 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.nav.products}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.dashboard.manage}</p>
            </div>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent Orders */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="p-4 md:p-5 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    {t.dashboard.recentOrders}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {todayOrders > 0
                      ? `${todayOrders} ${t.dashboard.ordersToday}`
                      : t.dashboard.noOrdersToday}
                  </p>
                </div>
                <button
                  onClick={() => router.push("/firm-orders")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {t.dashboard.viewAll}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t.dashboard.noOrders}</p>
                <button
                  onClick={() => router.push("/firm-order-create")}
                  className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  {t.dashboard.createFirstOrder}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div
                      key={order.id}
                      className="p-3.5 md:p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-700/30 active:bg-gray-100 dark:active:bg-gray-700/50 transition-all"
                      onClick={() => router.push(`/firm-orders?id=${order.id}`)}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30 flex-shrink-0">
                        {order.clientName?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {order.clientName}
                          </p>
                          <span className="text-xs font-mono text-gray-400 flex-shrink-0">
                            {formatOrderNumber(order.orderNumber)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {order.address || "-"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                          {formatStatus(order.status)}
                        </span>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mt-1">
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
          <div className="space-y-5">

            {/* Today's Performance */}
            <div className="rounded-2xl p-4 md:p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md shadow-purple-500/30">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  {t.dashboard.todaysPerformance}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Orders completed today */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400">{t.dashboard.ordersCompleted}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {todayOrders > 0 ? `${todayDelivered}/${todayOrders}` : "—"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: todayOrders > 0 ? `${(todayDelivered / todayOrders) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>

                {/* Driver availability — truly free drivers, always shown */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400">{t.dashboard.driverAvailability}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {availableDrivers}/{stats.driversCount}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: stats.driversCount > 0 ? `${(availableDrivers / stats.driversCount) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>

                {/* All unresolved pending orders — always shown, not just today's */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400">{t.dashboard.pendingOrders}</span>
                    <span className={`font-semibold ${pendingOrders > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}>
                      {pendingOrders}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: stats.ordersCount > 0 ? `${Math.min((pendingOrders / stats.ordersCount) * 100, 100)}%` : "0%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drivers */}
            <div className="rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-md shadow-orange-500/30">
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      {t.nav.drivers}
                    </h3>
                  </div>
                  <button
                    onClick={() => router.push("/firm-drivers")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium text-xs hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
                  >
                    {t.dashboard.viewAll}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {drivers.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.dashboard.noDrivers}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {drivers.slice(0, 4).map((driver) => (
                    <div key={driver.id} className="p-3.5 flex items-center gap-3 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-md ${
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
                        <span className={`w-2 h-2 rounded-full ${
                          driver.status === "ONLINE" ? "bg-green-500 animate-pulse" :
                          driver.status === "DELIVERING" ? "bg-blue-500 animate-pulse" : "bg-gray-400"
                        }`}></span>
                        <span className={`text-xs font-medium ${
                          driver.status === "ONLINE" ? "text-green-600 dark:text-green-400" :
                          driver.status === "DELIVERING" ? "text-blue-600 dark:text-blue-400" : "text-gray-500"
                        }`}>
                          {driver.status === "ONLINE" ? t.dashboard.online :
                           driver.status === "DELIVERING" ? t.dashboard.delivering :
                           t.dashboard.offline}
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
