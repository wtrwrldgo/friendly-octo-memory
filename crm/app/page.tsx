// file: app/page.tsx

import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import FirmsTable from "@/components/FirmsTable";
import { Building2, ShoppingCart, Truck, TrendingUp } from "lucide-react";

async function getGlobalStats() {
  return {
    totalRevenue: 125000,
    totalOrders: 1247,
    activeFirms: 23,
    activeDrivers: 87,
  };
}

async function getFirms() {
  return [
    {
      id: "1",
      name: "AquaPure Tashkent",
      city: "Tashkent",
      status: "ACTIVE" as const,
      clientsCount: 450,
      ordersCount: 1200,
      driversCount: 12,
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      name: "Crystal Water Samarkand",
      city: "Samarkand",
      status: "ACTIVE" as const,
      clientsCount: 230,
      ordersCount: 680,
      driversCount: 8,
      createdAt: "2024-02-10T10:00:00Z",
    },
    {
      id: "3",
      name: "Fresh Drops Bukhara",
      city: "Bukhara",
      status: "SUSPENDED" as const,
      clientsCount: 120,
      ordersCount: 200,
      driversCount: 4,
      createdAt: "2024-03-05T10:00:00Z",
    },
  ];
}

export default async function DashboardPage() {
  const stats = await getGlobalStats();
  const firms = await getFirms();

  return (
    <div className="p-8 min-h-screen dark:bg-gray-900">
      <PageHeader
        title="Platform Dashboard"
        description="Monitor all firms, orders, and drivers across the platform"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="w-7 h-7" />}
          trend="+12% from yesterday"
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart className="w-7 h-7" />}
          color="blue"
        />
        <StatCard
          title="Active Firms"
          value={stats.activeFirms}
          icon={<Building2 className="w-7 h-7" />}
          color="purple"
        />
        <StatCard
          title="Active Drivers"
          value={stats.activeDrivers}
          icon={<Truck className="w-7 h-7" />}
          color="orange"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white">Partner Firms</h2>
          <span className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-card font-medium">
            {firms.length} total firms
          </span>
        </div>
        <FirmsTable firms={firms} />
      </div>
    </div>
  );
}
