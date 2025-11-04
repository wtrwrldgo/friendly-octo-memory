// file: app/firm-dashboard/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import OrdersTable from "@/components/OrdersTable";
import DriversTable from "@/components/DriversTable";
import { TrendingUp, ShoppingCart, Truck, Users, MapPin } from "lucide-react";

export default function FirmDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [firmData, setFirmData] = useState({
    name: "AquaPure Tashkent",
    city: "Tashkent",
    revenue: 45000,
    ordersCount: 450,
    driversCount: 12,
    clientsCount: 450,
  });

  const [orders] = useState([
    {
      id: "ord-001",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      clientName: "Aziz Karimov",
      address: "Chilanzar 10, apt 45, Tashkent",
      status: "ON_THE_WAY" as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: "ord-002",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      clientName: "Nigora Rahimova",
      address: "Yunusabad 5, house 12, Tashkent",
      status: "DELIVERED" as const,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "ord-003",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      clientName: "Rustam Nazarov",
      address: "Mirzo Ulugbek 23, Tashkent",
      status: "PENDING" as const,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);

  const [drivers] = useState([
    {
      id: "drv-001",
      name: "Rustam Aliyev",
      phone: "+998901234567",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      status: "DELIVERING" as const,
      carPlate: "01A123BC",
      city: "Tashkent",
    },
    {
      id: "drv-002",
      name: "Shohrat Kamolov",
      phone: "+998901234568",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      status: "ONLINE" as const,
      carPlate: "01B456DE",
      city: "Tashkent",
    },
    {
      id: "drv-003",
      name: "Karim Yusupov",
      phone: "+998901234569",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      status: "OFFLINE" as const,
      carPlate: "01C789FG",
      city: "Samarkand",
    },
    {
      id: "drv-004",
      name: "Aziz Rahimov",
      phone: "+998901234570",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      status: "ONLINE" as const,
      carPlate: "01D456GH",
      city: "Bukhara",
    },
  ]);

  // Regional breakdown
  const regionalData = [
    { city: "Tashkent", revenue: 25000, orders: 250, drivers: 2 },
    { city: "Samarkand", revenue: 12000, orders: 120, drivers: 1 },
    { city: "Bukhara", revenue: 8000, orders: 80, drivers: 1 },
  ];

  useEffect(() => {
    // Redirect to platform dashboard if admin
    if (user?.type === "admin") {
      router.push("/");
    }
  }, [user, router]);

  if (user?.type !== "firm") {
    return null;
  }

  return (
    <div className="p-8 min-h-screen dark:bg-gray-900">
      <PageHeader
        title={`${firmData.name} Dashboard`}
        description={`Manage your water delivery business in ${firmData.city}`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Monthly Revenue"
          value={`$${firmData.revenue.toLocaleString()}`}
          icon={<TrendingUp className="w-7 h-7" />}
          trend="+8% from last month"
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={firmData.ordersCount}
          icon={<ShoppingCart className="w-7 h-7" />}
          color="blue"
        />
        <StatCard
          title="Active Drivers"
          value={firmData.driversCount}
          icon={<Truck className="w-7 h-7" />}
          color="orange"
        />
        <StatCard
          title="Total Clients"
          value={firmData.clientsCount}
          icon={<Users className="w-7 h-7" />}
          color="purple"
        />
      </div>

      {/* Regional Breakdown */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-6">Regional Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {regionalData.map((region) => (
            <div
              key={region.city}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 dark:text-white">{region.city}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${region.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Orders</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {region.orders}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Drivers</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {region.drivers}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white">Recent Orders</h2>
          <span className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-card font-medium">
            {orders.length} active orders
          </span>
        </div>
        <OrdersTable orders={orders} />
      </div>

      {/* Drivers */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white">Your Drivers</h2>
          <span className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-card font-medium">
            {drivers.filter(d => d.status === "ONLINE" || d.status === "DELIVERING").length} online
          </span>
        </div>
        <DriversTable drivers={drivers} />
      </div>
    </div>
  );
}
