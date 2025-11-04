// file: app/orders/page.tsx

import PageHeader from "@/components/PageHeader";
import OrdersTable from "@/components/OrdersTable";

async function getAllOrders() {
  return [
    {
      id: "ord-global-001",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      clientName: "Aziz Karimov",
      address: "Chilanzar 10, apt 45, Tashkent",
      status: "ON_THE_WAY" as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: "ord-global-002",
      firmId: "2",
      firmName: "Crystal Water Samarkand",
      clientName: "Dilshod Umarov",
      address: "Registon Street 15, Samarkand",
      status: "PENDING" as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: "ord-global-003",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      clientName: "Nigora Rahimova",
      address: "Yunusabad 5, house 12, Tashkent",
      status: "DELIVERED" as const,
      createdAt: new Date().toISOString(),
    },
  ];
}

export default async function OrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="p-8 dark:bg-gray-900 min-h-screen">
      <PageHeader
        title="Global Orders"
        description="All orders across all firms in real-time"
      />

      <OrdersTable orders={orders} />
    </div>
  );
}
