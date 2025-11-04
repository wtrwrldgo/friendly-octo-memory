// file: app/drivers/page.tsx

import PageHeader from "@/components/PageHeader";
import DriversTable from "@/components/DriversTable";

async function getAllDrivers() {
  return [
    {
      id: "drv-001",
      name: "Rustam Aliyev",
      phone: "+998901234567",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      status: "DELIVERING" as const,
      carPlate: "01A123BC",
    },
    {
      id: "drv-002",
      name: "Shohrat Kamolov",
      phone: "+998901234568",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      status: "ONLINE" as const,
      carPlate: "01B456DE",
    },
    {
      id: "drv-003",
      name: "Jasur Tursunov",
      phone: "+998901234569",
      firmId: "2",
      firmName: "Crystal Water Samarkand",
      status: "OFFLINE" as const,
      carPlate: "02C789FG",
    },
  ];
}

export default async function DriversPage() {
  const drivers = await getAllDrivers();

  return (
    <div className="p-8 dark:bg-gray-900 min-h-screen">
      <PageHeader
        title="Global Drivers"
        description="Monitor all drivers across all firms"
      />

      <DriversTable drivers={drivers} />
    </div>
  );
}
