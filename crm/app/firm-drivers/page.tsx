// file: app/firm-drivers/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Driver, DriverStatus } from "@/types";
import { Plus, Edit, Trash2, Save } from "lucide-react";

export default function FirmDriversPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    carPlate: "",
    city: "",
    status: "OFFLINE" as DriverStatus,
  });

  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: "drv-001",
      name: "Rustam Aliyev",
      phone: "+998901234567",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      status: "DELIVERING",
      carPlate: "01A123BC",
      city: "Tashkent",
    },
    {
      id: "drv-002",
      name: "Shohrat Kamolov",
      phone: "+998901234568",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      status: "ONLINE",
      carPlate: "01B456DE",
      city: "Tashkent",
    },
    {
      id: "drv-003",
      name: "Karim Yusupov",
      phone: "+998901234569",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      status: "OFFLINE",
      carPlate: "01C789FG",
      city: "Samarkand",
    },
    {
      id: "drv-004",
      name: "Aziz Rahimov",
      phone: "+998901234570",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      status: "ONLINE",
      carPlate: "01D456GH",
      city: "Samarkand",
    },
  ]);

  useEffect(() => {
    if (user?.type === "admin") {
      router.push("/");
    }
  }, [user, router]);

  if (user?.type !== "firm") {
    return null;
  }

  const openCreateModal = () => {
    setEditingDriver(null);
    setFormData({
      name: "",
      phone: "",
      carPlate: "",
      city: "",
      status: "OFFLINE",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      carPlate: driver.carPlate,
      city: driver.city || "",
      status: driver.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDriver) {
      // Update
      setDrivers(
        drivers.map((d) =>
          d.id === editingDriver.id
            ? {
                ...d,
                name: formData.name,
                phone: formData.phone,
                carPlate: formData.carPlate,
                city: formData.city,
                status: formData.status,
              }
            : d
        )
      );
    } else {
      // Create
      const newDriver: Driver = {
        id: `drv-${Date.now()}`,
        name: formData.name,
        phone: formData.phone,
        firmId: "1",
        firmName: "AquaPure Tashkent",
        status: formData.status,
        carPlate: formData.carPlate,
        city: formData.city,
      };
      setDrivers([...drivers, newDriver]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      setDrivers(drivers.filter((d) => d.id !== id));
    }
  };

  const onlineDrivers = drivers.filter((d) => d.status === "ONLINE" || d.status === "DELIVERING");
  const offlineDrivers = drivers.filter((d) => d.status === "OFFLINE");

  const statusColors = {
    ONLINE: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    OFFLINE: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400",
    DELIVERING: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  };

  return (
    <div className="p-8 min-h-screen dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="My Drivers" description="Manage your delivery drivers" />
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Driver
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Drivers</p>
              <p className="text-2xl font-bold text-navy-900 dark:text-white">{drivers.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">Online</p>
              <p className="text-2xl font-bold text-green-600">{onlineDrivers.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">Offline</p>
              <p className="text-2xl font-bold text-gray-600">{offlineDrivers.length}</p>
            </div>
          </div>
        </div>

        {/* Drivers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Driver Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Car Plate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {drivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-5">
                      <p className="font-bold text-navy-900 dark:text-white">{driver.name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{driver.phone}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {driver.carPlate}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{driver.city || "N/A"}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[driver.status]}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(driver)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDriver ? "Edit Driver" : "Add New Driver"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Driver Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter driver name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998901234567"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Car Plate Number
            </label>
            <input
              type="text"
              value={formData.carPlate}
              onChange={(e) => setFormData({ ...formData, carPlate: e.target.value })}
              placeholder="01A123BC"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Tashkent"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as DriverStatus })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="DELIVERING">Delivering</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <Save className="w-5 h-5" />
              {editingDriver ? "Update Driver" : "Add Driver"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
