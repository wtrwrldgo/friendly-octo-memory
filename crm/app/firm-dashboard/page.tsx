// file: app/firm-dashboard/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useFirmData } from "@/contexts/FirmDataContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  TrendingUp, ShoppingCart, Truck, Users, ArrowRight,
  DollarSign, Package, Calendar, ChevronRight, Plus,
  BarChart3, Target, MapPin, Clock, Phone
} from "lucide-react";

export default function FirmDashboardPage() {
  const { user, firm, loading: authLoading } = useAuth();
  const { theme } = useTheme();
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

  // Fetch data on mount (will use cache if available)
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // These will use cached data if available
    fetchOrders();
    fetchDrivers();
    fetchClients();
  }, [user, router, authLoading, fetchOrders, fetchDrivers, fetchClients]);

  // Memoize orders for dashboard (only show first 5)
  const orders = useMemo(() => allOrders.slice(0, 5), [allOrders]);

  // Memoize stats from cached data
  const stats = useMemo(() => ({
    ordersCount: allOrders.length,
    driversCount: drivers.length,
    clientsCount: clients.length,
    revenue: allOrders.reduce((sum, o) => sum + (o.total || 0), 0),
  }), [allOrders, drivers, clients]);

  const loading = ordersLoading || driversLoading || clientsLoading;

  if (authLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gray-950" : "bg-gray-50"}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className={`mt-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const onlineDrivers = drivers.filter(d => d.status === "ONLINE" || d.status === "DELIVERING").length;
  const pendingOrders = orders.filter(o => o.status === "CONFIRMED" || o.status === "PREPARING").length;
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('uz-UZ').format(value) + ' UZS';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PREPARING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'DELIVERING': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-950" : "bg-gray-50"}`}>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {greeting}, {user.name?.split(" ")[0] || "there"}!
              </h1>
              <p className={`mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {firm?.name || "Your Firm"} • {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <button
              onClick={() => router.push("/firm-order-create")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Order</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Revenue */}
          <div className={`p-4 md:p-5 rounded-2xl ${theme === "dark" ? "bg-gray-900 border border-gray-800" : "bg-white shadow-sm"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">+12%</span>
              </div>
            </div>
            <p className={`text-xs font-medium mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>Total Revenue</p>
            <p className={`text-lg md:text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {formatCurrency(stats.revenue)}
            </p>
          </div>

          {/* Orders */}
          <div className={`p-4 md:p-5 rounded-2xl ${theme === "dark" ? "bg-gray-900 border border-gray-800" : "bg-white shadow-sm"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              {pendingOrders > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                  {pendingOrders} pending
                </span>
              )}
            </div>
            <p className={`text-xs font-medium mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>Total Orders</p>
            <p className={`text-lg md:text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {stats.ordersCount}
            </p>
          </div>

          {/* Drivers */}
          <div className={`p-4 md:p-5 rounded-2xl ${theme === "dark" ? "bg-gray-900 border border-gray-800" : "bg-white shadow-sm"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">{onlineDrivers} online</span>
              </span>
            </div>
            <p className={`text-xs font-medium mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>Active Drivers</p>
            <p className={`text-lg md:text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {stats.driversCount}
            </p>
          </div>

          {/* Clients */}
          <div className={`p-4 md:p-5 rounded-2xl ${theme === "dark" ? "bg-gray-900 border border-gray-800" : "bg-white shadow-sm"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className={`text-xs font-medium mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>Total Clients</p>
            <p className={`text-lg md:text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {stats.clientsCount}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => router.push("/firm-orders")}
            className={`p-3 md:p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
              theme === "dark" ? "bg-gray-900 border border-gray-800 hover:bg-gray-800" : "bg-white shadow-sm hover:bg-gray-50"
            }`}
          >
            <Package className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
            <span className={`text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Orders</span>
          </button>
          <button
            onClick={() => router.push("/firm-drivers")}
            className={`p-3 md:p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
              theme === "dark" ? "bg-gray-900 border border-gray-800 hover:bg-gray-800" : "bg-white shadow-sm hover:bg-gray-50"
            }`}
          >
            <Truck className={`w-5 h-5 ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`} />
            <span className={`text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Drivers</span>
          </button>
          <button
            onClick={() => router.push("/firm-clients")}
            className={`p-3 md:p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
              theme === "dark" ? "bg-gray-900 border border-gray-800 hover:bg-gray-800" : "bg-white shadow-sm hover:bg-gray-50"
            }`}
          >
            <Users className={`w-5 h-5 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
            <span className={`text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Clients</span>
          </button>
          <button
            onClick={() => router.push("/firm-products")}
            className={`p-3 md:p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
              theme === "dark" ? "bg-gray-900 border border-gray-800 hover:bg-gray-800" : "bg-white shadow-sm hover:bg-gray-50"
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${theme === "dark" ? "text-green-400" : "text-green-600"}`} />
            <span className={`text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Products</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Orders */}
          <div className={`lg:col-span-2 rounded-2xl overflow-hidden ${theme === "dark" ? "bg-gray-900 border border-gray-800" : "bg-white shadow-sm"}`}>
            <div className="p-4 md:p-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Recent Orders
                  </h2>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                    {todayOrders} orders today
                  </p>
                </div>
                <button
                  onClick={() => router.push("/firm-orders")}
                  className={`flex items-center gap-1 text-sm font-medium ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className={`w-12 h-12 mx-auto mb-3 ${theme === "dark" ? "text-gray-700" : "text-gray-300"}`} />
                <p className={theme === "dark" ? "text-gray-500" : "text-gray-500"}>No orders yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                      theme === "dark" ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => router.push(`/firm-orders?id=${order.id}`)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-white bg-gradient-to-br from-blue-500 to-blue-600`}>
                      {order.clientName?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {order.clientName}
                      </p>
                      <p className={`text-sm truncate flex items-center gap-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                        <MapPin className="w-3 h-3" />
                        {order.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                        {formatCurrency(order.total || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Performance */}
            <div className={`rounded-2xl p-4 md:p-5 ${theme === "dark" ? "bg-gray-900 border border-gray-800" : "bg-white shadow-sm"}`}>
              <div className="flex items-center gap-2 mb-4">
                <Target className={`w-5 h-5 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
                <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Today&apos;s Performance
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Orders Completed</span>
                    <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {Math.floor(stats.ordersCount * 0.7)}/{stats.ordersCount}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Driver Availability</span>
                    <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {onlineDrivers}/{stats.driversCount}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: stats.driversCount > 0 ? `${(onlineDrivers / stats.driversCount) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drivers */}
            <div className={`rounded-2xl overflow-hidden ${theme === "dark" ? "bg-gray-900 border border-gray-800" : "bg-white shadow-sm"}`}>
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className={`w-5 h-5 ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`} />
                    <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Drivers
                    </h3>
                  </div>
                  <button
                    onClick={() => router.push("/firm-drivers")}
                    className={`p-1.5 rounded-lg ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
                  >
                    <ChevronRight className={`w-4 h-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                  </button>
                </div>
              </div>

              {drivers.length === 0 ? (
                <div className="p-6 text-center">
                  <Truck className={`w-10 h-10 mx-auto mb-2 ${theme === "dark" ? "text-gray-700" : "text-gray-300"}`} />
                  <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>No drivers yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {drivers.slice(0, 4).map((driver) => (
                    <div key={driver.id} className={`p-3 flex items-center gap-3 ${theme === "dark" ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm text-white ${
                        driver.status === "ONLINE" || driver.status === "DELIVERING"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}>
                        {driver.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {driver.name}
                        </p>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                          {driver.carPlate}
                        </p>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${
                        driver.status === "ONLINE" ? "bg-green-500" :
                        driver.status === "DELIVERING" ? "bg-blue-500" : "bg-gray-400"
                      }`}></span>
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
