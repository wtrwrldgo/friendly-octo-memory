// file: app/firms/[id]/page.tsx

import PageHeader from "@/components/PageHeader";
import OrdersTable from "@/components/OrdersTable";
import DriversTable from "@/components/DriversTable";
import StatusBadge from "@/components/StatusBadge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getFirm(id: string) {
  return {
    id,
    name: "AquaPure Tashkent",
    city: "Tashkent",
    status: "ACTIVE" as const,
    clientsCount: 450,
    ordersCount: 1200,
    driversCount: 12,
    createdAt: "2024-01-15T10:00:00Z",
  };
}

async function getFirmOrders(id: string) {
  return [
    {
      id: "ord-001",
      firmId: id,
      firmName: "AquaPure Tashkent",
      clientName: "Aziz Karimov",
      address: "Chilanzar 10, apt 45, Tashkent",
      status: "ON_THE_WAY" as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: "ord-002",
      firmId: id,
      firmName: "AquaPure Tashkent",
      clientName: "Nigora Rahimova",
      address: "Yunusabad 5, house 12, Tashkent",
      status: "DELIVERED" as const,
      createdAt: new Date().toISOString(),
    },
  ];
}

async function getFirmDrivers(id: string) {
  return [
    {
      id: "drv-001",
      name: "Rustam Aliyev",
      phone: "+998901234567",
      firmId: id,
      firmName: "AquaPure Tashkent",
      status: "DELIVERING" as const,
      carPlate: "01A123BC",
    },
    {
      id: "drv-002",
      name: "Shohrat Kamolov",
      phone: "+998901234568",
      firmId: id,
      firmName: "AquaPure Tashkent",
      status: "ONLINE" as const,
      carPlate: "01B456DE",
    },
  ];
}

export default async function FirmDetailPage({ params }: { params: { id: string } }) {
  const firm = await getFirm(params.id);
  const orders = await getFirmOrders(params.id);
  const drivers = await getFirmDrivers(params.id);

  return (
    <div className="p-8 dark:bg-gray-900 min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-navy dark:text-blue-400 hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy dark:text-white">{firm.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{firm.city}</p>
          </div>
          <StatusBadge status={firm.status} />
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t dark:border-gray-700">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
            <p className="text-2xl font-bold text-navy dark:text-white mt-1">{firm.clientsCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-navy dark:text-white mt-1">{firm.ordersCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Drivers</p>
            <p className="text-2xl font-bold text-navy dark:text-white mt-1">{firm.driversCount}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-navy dark:text-white mb-4">Recent Orders</h2>
          <OrdersTable orders={orders} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-navy dark:text-white mb-4">Drivers</h2>
          <DriversTable drivers={drivers} />
        </div>
      </div>
    </div>
  );
}
