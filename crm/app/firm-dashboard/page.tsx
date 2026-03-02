// file: app/firm-dashboard/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useFirmData } from "@/contexts/FirmDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart, Truck, Users, ArrowRight,
  DollarSign, Package, ChevronRight, Plus,
  Target, MapPin, Clock, Activity,
  TrendingUp, TrendingDown, X, UserPlus,
} from "lucide-react";

export default function FirmDashboardPage() {
  const { user, firm, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const {
    orders: allOrders, ordersLoading, fetchOrders,
    drivers, driversLoading, fetchDrivers,
    clients, clientsLoading, fetchClients,
  } = useFirmData();
  const router = useRouter();
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    fetchOrders();
    fetchDrivers();
    fetchClients();
  }, [user, router, authLoading, fetchOrders, fetchDrivers, fetchClients]);

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
      <div className="min-h-screen flex items-center justify-center bg-[#0f1115]">
        <div className="text-center">
          <div className="relative w-10 h-10 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-xs text-white/30">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const now = new Date();
  const isToday = (date: string) => new Date(date).toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = (date: string) => new Date(date).toDateString() === yesterday.toDateString();

  const onlineDrivers = drivers.filter(d => d.status === "ONLINE" || d.status === "DELIVERING").length;
  const availableDrivers = drivers.filter(d => d.status === "ONLINE").length;
  const pendingOrders = allOrders.filter(o =>
    o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PREPARING"
  ).length;
  const todayOrders = allOrders.filter(o => isToday(o.createdAt)).length;
  const todayRevenue = allOrders.filter(o => isToday(o.createdAt)).reduce((sum, o) => sum + (o.total || 0), 0);
  const todayDelivered = allOrders.filter(o => o.status === "DELIVERED" && isToday(o.createdAt)).length;
  const todayPending = allOrders.filter(o =>
    (o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PREPARING") && isToday(o.createdAt)
  ).length;

  // Trend: today vs yesterday
  const yesterdayRevenue = allOrders.filter(o => isYesterday(o.createdAt)).reduce((sum, o) => sum + (o.total || 0), 0);
  const yesterdayOrders = allOrders.filter(o => isYesterday(o.createdAt)).length;

  const getTrend = (current: number, previous: number) => {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) return current > 0 ? { value: 100, up: true } : null;
    const pct = Math.round(((current - previous) / previous) * 100);
    return { value: Math.abs(pct), up: pct >= 0 };
  };

  const revenueTrend = getTrend(todayRevenue, yesterdayRevenue);
  const ordersTrend = getTrend(todayOrders, yesterdayOrders);

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
      case 'DELIVERED':  return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' };
      case 'CONFIRMED':  return { bg: 'bg-blue-500/10',    text: 'text-blue-400',    dot: 'bg-blue-500'    };
      case 'PREPARING':  return { bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-500'   };
      case 'DELIVERING':
      case 'ON_THE_WAY': return { bg: 'bg-purple-500/10',  text: 'text-purple-400',  dot: 'bg-purple-500'  };
      case 'CANCELLED':  return { bg: 'bg-red-500/10',     text: 'text-red-400',     dot: 'bg-red-500'     };
      case 'PENDING':    return { bg: 'bg-orange-500/10',  text: 'text-orange-400',  dot: 'bg-orange-500'  };
      default:           return { bg: 'bg-white/5',        text: 'text-white/40',    dot: 'bg-white/20'    };
    }
  };

  const TrendBadge = ({ trend }: { trend: { value: number; up: boolean } | null }) => {
    if (!trend) return <span className="text-[10px] text-white/20">—</span>;
    return (
      <span className={`flex items-center gap-0.5 text-[10px] font-medium ${trend.up ? 'text-emerald-400' : 'text-red-400'}`}>
        {trend.up
          ? <TrendingUp className="w-2.5 h-2.5" />
          : <TrendingDown className="w-2.5 h-2.5" />
        }
        {trend.value}%
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f1115]">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Header — compact, no greeting */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">{t.dashboard.title}</h1>
            <p className="text-sm text-white/30 mt-0.5">
              {firm?.name} · {now.toLocaleDateString(dateLocale, { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* KPI Cards — Quiet UI, Bento Box, fixed height, trend badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

          <div className="h-[116px] p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">{t.dashboard.todayRevenue}</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-white truncate">{formatCurrency(todayRevenue)}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <TrendBadge trend={revenueTrend} />
                <span className="text-[10px] text-white/20">vs last 24h</span>
              </div>
            </div>
          </div>

          <div className="h-[116px] p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">{t.dashboard.todayOrders}</span>
              <div className="flex items-center gap-1.5">
                {pendingOrders > 0 && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-semibold">
                    <Clock className="w-2.5 h-2.5" />{pendingOrders}
                  </span>
                )}
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{todayOrders}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <TrendBadge trend={ordersTrend} />
                <span className="text-[10px] text-white/20">vs last 24h</span>
              </div>
            </div>
          </div>

          <div className="h-[116px] p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">{t.dashboard.activeDrivers}</span>
              <div className="p-1.5 rounded-lg bg-orange-500/10">
                <Truck className="w-3.5 h-3.5 text-orange-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{onlineDrivers}</p>
              <span className="text-[10px] text-white/30">{availableDrivers} {t.dashboard.available}</span>
            </div>
          </div>

          <div className="h-[116px] p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">{t.dashboard.totalClients}</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <Users className="w-3.5 h-3.5 text-purple-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{stats.clientsCount}</p>
              <span className="text-[10px] text-white/20">—</span>
            </div>
          </div>
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent Orders */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.07]">
            <div className="p-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    {t.dashboard.recentOrders}
                  </h2>
                  <p className="text-xs text-white/30 mt-0.5">
                    {todayOrders > 0 ? `${todayOrders} ${t.dashboard.ordersToday}` : t.dashboard.noOrdersToday}
                  </p>
                </div>
                <button
                  onClick={() => router.push("/firm-orders")}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-xs transition-colors"
                >
                  {t.dashboard.viewAll}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              /* Progressive Disclosure: Getting Started empty state */
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Getting Started</h3>
                <p className="text-xs text-white/30 mb-5 max-w-[180px] mx-auto">
                  Your first order will appear here. Follow the steps to get started.
                </p>
                <div className="space-y-2.5 text-left max-w-[200px] mx-auto mb-6">
                  {[
                    { step: "1", label: "Add your products", href: "/firm-products" },
                    { step: "2", label: "Register your drivers", href: "/firm-drivers" },
                    { step: "3", label: "Create your first order", href: "/firm-order-create" },
                  ].map(s => (
                    <button
                      key={s.step}
                      onClick={() => router.push(s.href)}
                      className="w-full flex items-center gap-3 text-xs hover:opacity-80 transition-opacity"
                    >
                      <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-[10px] text-white/30 font-bold flex-shrink-0">
                        {s.step}
                      </span>
                      <span className="text-white/40 text-left">{s.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => router.push("/firm-order-create")}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                >
                  {t.dashboard.createFirstOrder}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div
                      key={order.id}
                      className="p-3.5 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => router.push(`/firm-orders?id=${order.id}`)}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white bg-white/[0.07] flex-shrink-0">
                        {order.clientName?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-white truncate">{order.clientName}</p>
                          <span className="text-xs font-mono text-white/25 flex-shrink-0">
                            {formatOrderNumber(order.orderNumber)}
                          </span>
                        </div>
                        <p className="text-xs text-white/30 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {order.address || "—"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          <span className={`w-1 h-1 rounded-full ${statusConfig.dot}`} />
                          {formatStatus(order.status)}
                        </span>
                        <p className="text-xs font-semibold text-white mt-1">{formatCurrency(order.total || 0)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Today's Performance */}
            <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.07]">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-white/20" />
                <h3 className="font-semibold text-sm text-white">{t.dashboard.todaysPerformance}</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/40">{t.dashboard.ordersCompleted}</span>
                    <span className="font-medium text-white">
                      {todayOrders > 0 ? `${todayDelivered}/${todayOrders}` : "—"}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.06]">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: todayOrders > 0 ? `${(todayDelivered / todayOrders) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/40">{t.dashboard.driverAvailability}</span>
                    <span className="font-medium text-white">{availableDrivers}/{stats.driversCount}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.06]">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: stats.driversCount > 0 ? `${(availableDrivers / stats.driversCount) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/40">{t.dashboard.pendingOrders}</span>
                    <span className={`font-medium ${pendingOrders > 0 ? "text-amber-400" : "text-white"}`}>
                      {pendingOrders}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.06]">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: stats.ordersCount > 0 ? `${Math.min((pendingOrders / stats.ordersCount) * 100, 100)}%` : "0%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Drivers */}
            <div className="rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.07]">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-white/20" />
                  <h3 className="font-semibold text-sm text-white">{t.nav.drivers}</h3>
                </div>
                <button
                  onClick={() => router.push("/firm-drivers")}
                  className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors"
                >
                  {t.dashboard.viewAll}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {drivers.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-white/25">{t.dashboard.noDrivers}</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {drivers.slice(0, 4).map((driver) => (
                    <div key={driver.id} className="p-3.5 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                        driver.status === "ONLINE" || driver.status === "DELIVERING"
                          ? "bg-emerald-500/10"
                          : "bg-white/[0.05]"
                      }`}>
                        {driver.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{driver.name}</p>
                        <p className="text-xs text-white/30">{driver.carPlate || "N/A"}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          driver.status === "ONLINE" ? "bg-emerald-400" :
                          driver.status === "DELIVERING" ? "bg-blue-400" : "bg-white/20"
                        }`} />
                        <span className={`text-xs ${
                          driver.status === "ONLINE" ? "text-emerald-400" :
                          driver.status === "DELIVERING" ? "text-blue-400" : "text-white/30"
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

      {/* Floating Quick Actions */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {fabOpen && (
          <div className="flex flex-col items-end gap-2 mb-1">
            <button
              onClick={() => { router.push("/firm-drivers"); setFabOpen(false); }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1a1d23] border border-white/10 text-sm text-white font-medium shadow-2xl hover:bg-[#22262e] transition-colors"
            >
              <UserPlus className="w-4 h-4 text-orange-400" />
              Add Driver
            </button>
            <button
              onClick={() => { router.push("/firm-order-create"); setFabOpen(false); }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1a1d23] border border-white/10 text-sm text-white font-medium shadow-2xl hover:bg-[#22262e] transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              New Order
            </button>
          </div>
        )}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 ${
            fabOpen
              ? "bg-white/10 border border-white/10 rotate-45"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {fabOpen
            ? <X className="w-5 h-5 text-white" />
            : <Plus className="w-5 h-5 text-white" />
          }
        </button>
      </div>
    </div>
  );
}
