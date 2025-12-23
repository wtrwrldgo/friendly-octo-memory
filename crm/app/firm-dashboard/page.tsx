// file: app/firm-dashboard/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OrdersTable from "@/components/OrdersTable";
import DriversTable from "@/components/DriversTable";
import {
  TrendingUp, ShoppingCart, Truck, Users, Zap, ArrowRight, Activity,
  DollarSign, Package, Clock, Calendar, ChevronRight, Plus,
  BarChart3, PieChart, Target, Sparkles
} from "lucide-react";
import { db } from "@/lib/db";
import { Order, Driver } from "@/types";

export default function FirmDashboardPage() {
  const { user, firm, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState({
    ordersCount: 0,
    driversCount: 0,
    clientsCount: 0,
    revenue: 0,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const firmId = user.firmId || firm?.id;
        if (!firmId) return;

        const [ordersRes, driversRes, clientsRes] = await Promise.all([
          db.getOrders(firmId),
          db.getDrivers(firmId),
          db.getClients(firmId),
        ]);

        if (ordersRes.data) {
          const mappedOrders = ordersRes.data.slice(0, 5).map((o: any) => ({
            id: o.id,
            firmId: o.firmId,
            firmName: firm?.name || "My Firm",
            clientName: o.user?.name || o.userName || "Unknown Client",
            address: o.address?.address || o.addressText || "No address",
            status: o.stage || o.status || "PENDING",
            createdAt: o.createdAt,
          }));
          setOrders(mappedOrders);
        }

        if (driversRes.data) {
          const mappedDrivers: Driver[] = driversRes.data.map((d: any) => ({
            id: d.id,
            name: d.name,
            phone: d.phone,
            firmId: d.firmId,
            firmName: firm?.name || "My Firm",
            status: (d.isAvailable ? "ONLINE" : "OFFLINE") as "ONLINE" | "OFFLINE" | "DELIVERING",
            carPlate: d.vehicleNumber || d.carPlate || "N/A",
            city: d.city || "N/A",
          }));
          setDrivers(mappedDrivers);
        }

        setStats({
          ordersCount: ordersRes.data?.length || 0,
          driversCount: driversRes.data?.length || 0,
          clientsCount: clientsRes.data?.length || 0,
          revenue: ordersRes.data?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, firm, router, authLoading]);

  if (authLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" : "bg-gradient-to-br from-gray-50 via-white to-gray-50"}`}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className={`absolute inset-0 rounded-2xl ${theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"}`}></div>
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className={`w-8 h-8 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
            </div>
          </div>
          <p className={`mt-4 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const onlineDrivers = drivers.filter(d => d.status === "ONLINE" || d.status === "DELIVERING").length;
  const pendingOrders = orders.filter(o => o.status === "CONFIRMED" || o.status === "PREPARING").length;

  // Get current date info
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  // Stat cards configuration
  const statCards = [
    {
      title: "Total Revenue",
      value: `${stats.revenue.toLocaleString()} UZS`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-600",
      shadow: "shadow-emerald-500/25",
      bgLight: "bg-emerald-50",
      bgDark: "bg-emerald-900/20",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Total Orders",
      value: stats.ordersCount.toString(),
      icon: ShoppingCart,
      gradient: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/25",
      bgLight: "bg-blue-50",
      bgDark: "bg-blue-900/20",
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Active Drivers",
      value: stats.driversCount.toString(),
      subtitle: `${onlineDrivers} online now`,
      icon: Truck,
      gradient: "from-orange-500 to-amber-600",
      shadow: "shadow-orange-500/25",
      bgLight: "bg-orange-50",
      bgDark: "bg-orange-900/20",
    },
    {
      title: "Total Clients",
      value: stats.clientsCount.toString(),
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/25",
      bgLight: "bg-violet-50",
      bgDark: "bg-violet-900/20",
      trend: "+15.3%",
      trendUp: true,
    },
  ];

  // Quick actions
  const quickActions = [
    { label: "New Order", icon: Plus, href: "/firm-order-create", gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/25" },
    { label: "View Orders", icon: Package, href: "/firm-orders", gradient: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/25" },
    { label: "Manage Drivers", icon: Truck, href: "/firm-drivers", gradient: "from-orange-500 to-amber-600", shadow: "shadow-orange-500/25" },
    { label: "View Clients", icon: Users, href: "/firm-clients", gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/25" },
  ];

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" : "bg-gradient-to-br from-gray-50 via-white to-gray-50"}`}>
      <div className="p-6 lg:p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/25`}>
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Dashboard
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-500">
                    Live
                  </span>
                </div>
              </div>
              <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {greeting}, {user.name?.split(" ")[0] || "there"}
              </h1>
              <p className={`text-base ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Here is what is happening at <span className="font-semibold">{firm?.name || "your firm"}</span> today
              </p>
            </div>

            {/* Date & Time Card */}
            <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-lg"}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                  <Calendar className={`w-5 h-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {now.toLocaleDateString("en-US", { weekday: "long" })}
                  </p>
                  <p className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((card, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl border overflow-hidden ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200 shadow-lg"
              }`}
            >
              {/* Background decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${card.gradient}`}></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadow}`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  {card.trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                      card.trendUp
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    }`}>
                      <TrendingUp className={`w-3 h-3 ${!card.trendUp && "rotate-180"}`} />
                      {card.trend}
                    </div>
                  )}
                </div>
                <p className={`text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className={`text-xs mt-1 flex items-center gap-1.5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    {card.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className={`group p-4 rounded-xl border transition-all hover:shadow-lg ${
                  theme === "dark"
                    ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br ${action.gradient} shadow-lg ${action.shadow} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <p className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Orders - Takes 2 columns */}
          <div className="xl:col-span-2">
            <div className={`rounded-2xl border overflow-hidden ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-lg"}`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25`}>
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Recent Orders
                      </h2>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                        {pendingOrders > 0 ? (
                          <span className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-amber-500 font-medium">{pendingOrders}</span> pending orders
                          </span>
                        ) : (
                          "All orders processed"
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/firm-orders")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      theme === "dark"
                        ? "bg-white/5 hover:bg-white/10 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="text-sm">View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className={theme === "dark" ? "bg-gray-900/50" : ""}>
                <OrdersTable orders={orders} />
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Performance Card */}
            <div className={`p-6 rounded-2xl border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-lg"}`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25`}>
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Today&apos;s Performance
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                    Your daily metrics
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Metric Item */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Orders Completed</span>
                    <span className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {Math.floor(stats.ordersCount * 0.7)}/{stats.ordersCount}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Driver Availability</span>
                    <span className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {onlineDrivers}/{stats.driversCount}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      style={{ width: stats.driversCount > 0 ? `${(onlineDrivers / stats.driversCount) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Revenue Target</span>
                    <span className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>85%</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drivers Overview */}
            <div className={`rounded-2xl border overflow-hidden ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-lg"}`}>
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/25`}>
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Drivers
                      </h3>
                      <p className={`text-xs flex items-center gap-1.5 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-emerald-500 font-medium">{onlineDrivers}</span> online
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/firm-drivers")}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <ChevronRight className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                  </button>
                </div>
              </div>

              {/* Driver List Preview */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {drivers.slice(0, 4).map((driver) => (
                  <div key={driver.id} className={`p-4 flex items-center gap-3 ${theme === "dark" ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                      driver.status === "ONLINE" || driver.status === "DELIVERING"
                        ? "bg-gradient-to-br from-emerald-500 to-green-600"
                        : "bg-gradient-to-br from-gray-400 to-gray-500"
                    }`}>
                      {driver.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {driver.name}
                      </p>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                        {driver.carPlate}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      driver.status === "ONLINE"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : driver.status === "DELIVERING"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}>
                      {driver.status === "DELIVERING" ? "Busy" : driver.status === "ONLINE" ? "Online" : "Offline"}
                    </span>
                  </div>
                ))}
              </div>

              {drivers.length > 4 && (
                <div className={`p-3 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                  <button
                    onClick={() => router.push("/firm-drivers")}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === "dark"
                        ? "bg-gray-700/50 hover:bg-gray-700 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    View all {stats.driversCount} drivers
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
