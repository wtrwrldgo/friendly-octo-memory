// file: app/firm-drivers/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useFirmData } from "@/contexts/FirmDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Driver, DriverStatus } from "@/types";
import {
  Truck, Plus, Edit2, Trash2, Save, Search, RefreshCw,
  Phone, MapPin, Car, Wifi, WifiOff, Users, XCircle, Zap
} from "lucide-react";
import { db } from "@/lib/db";

type StatusFilter = "ALL" | "ONLINE" | "OFFLINE" | "DELIVERING";

export default function FirmDriversPage() {
  const { t } = useLanguage();
  const { user, firm, loading: authLoading } = useAuth();
  const { drivers, driversLoading, fetchDrivers } = useFirmData();
  const router = useRouter();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    driverNumber: "",
    carPlate: "",
    carBrand: "",
    carColor: "",
    city: "",
    status: "OFFLINE" as DriverStatus,
  });

  const loading = driversLoading;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    // Will use cached data if available
    fetchDrivers();
  }, [user, router, authLoading, fetchDrivers]);

  const stats = useMemo(() => ({
    total: drivers.length,
    online: drivers.filter(d => d.status === "ONLINE").length,
    offline: drivers.filter(d => d.status === "OFFLINE").length,
    delivering: drivers.filter(d => d.status === "DELIVERING").length,
  }), [drivers]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      if (statusFilter !== "ALL" && driver.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          driver.name?.toLowerCase().includes(query) ||
          driver.phone?.toLowerCase().includes(query) ||
          driver.carPlate?.toLowerCase().includes(query) ||
          driver.city?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [drivers, statusFilter, searchQuery]);

  if (authLoading || !user) return null;

  const openCreateModal = () => {
    setEditingDriver(null);
    setFormData({
      name: "",
      phone: "",
      driverNumber: "",
      carPlate: "",
      carBrand: "",
      carColor: "",
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
      driverNumber: (driver as any).driverNumber || (driver as any).driver_number || "",
      carPlate: driver.carPlate,
      carBrand: (driver as any).carBrand || "",
      carColor: (driver as any).carColor || "",
      city: driver.city || "",
      status: driver.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        // Update existing driver via local API route
        const response = await fetch(`/api/drivers/${editingDriver.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            carPlate: formData.carPlate,
            carBrand: formData.carBrand,
            carColor: formData.carColor,
            city: formData.city,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          console.error("Failed to update driver:", data.error);
          toast.error(data.error || "Не удалось обновить водителя");
          return;
        }
        toast.success("Водитель успешно обновлен");
      } else {
        // Create new driver via local API route
        const firmId = user?.firmId || firm?.id;
        if (!firmId) {
          toast.error("Не найден ID фирмы");
          return;
        }
        const response = await fetch('/api/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firmId,
            name: formData.name,
            phone: formData.phone,
            driverNumber: formData.driverNumber || undefined,
            carPlate: formData.carPlate,
            carBrand: formData.carBrand,
            carColor: formData.carColor,
            city: formData.city,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          console.error("Failed to create driver:", data.error);
          toast.error(data.error || "Не удалось создать водителя");
          return;
        }
        toast.success("Водитель успешно создан");
      }
      setIsModalOpen(false);
      // Refresh cache
      fetchDrivers(true);
    } catch (error: any) {
      console.error("Failed to save driver:", error);
      toast.error(error.message || "Не удалось сохранить водителя");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t.drivers.deleteConfirm)) {
      try {
        const response = await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (!response.ok) {
          console.error("Failed to delete driver:", data.error);
          toast.error(data.error || "Не удалось удалить водителя");
          return;
        }
        toast.success("Водитель успешно удален");
        // Refresh cache
        fetchDrivers(true);
      } catch (error: any) {
        console.error("Failed to delete driver:", error);
        toast.error(error.message || "Не удалось удалить водителя");
      }
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={t.drivers.title}
          description={t.drivers.description}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-orange-500/30 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            {t.drivers.addDriver}
          </button>
        </div>
      </div>

      <div className="mb-8">
        {/* Stats Cards - Premium Design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-orange-100">{t.drivers.totalDrivers}</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-100">{t.drivers.onlineNow}</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.online}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span className="text-xs text-emerald-100">{t.drivers.live}</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Wifi className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100">{t.drivers.delivering}</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.delivering}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-gray-400 to-gray-500 shadow-xl shadow-gray-500/25 hover:shadow-2xl hover:shadow-gray-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-100">{t.drivers.offline}</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.offline}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <WifiOff className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter - Premium Design */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-5 mb-6 shadow-xl shadow-gray-200/50 dark:shadow-none">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Search className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <input
                type="text"
                placeholder={t.drivers.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { value: "ALL", label: t.common.all, icon: Truck, color: "orange" },
                { value: "ONLINE", label: t.drivers.online, icon: Wifi, color: "emerald" },
                { value: "DELIVERING", label: t.drivers.delivering, icon: Zap, color: "purple" },
                { value: "OFFLINE", label: t.drivers.offline, icon: WifiOff, color: "gray" },
              ].map((filter) => {
                const Icon = filter.icon;
                const isActive = statusFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value as StatusFilter)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-105"
                        : "bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchDrivers(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all font-semibold shadow-sm hover:shadow-md"
              title={t.common.refresh}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t.common.refresh}</span>
            </button>
          </div>

          {/* Results count */}
          {(searchQuery || statusFilter !== "ALL") && (
            <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-200/50 dark:border-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.drivers.found} <span className="font-bold text-gray-900 dark:text-white bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-lg">{filteredDrivers.length}</span> {t.drivers.of} {drivers.length} {t.drivers.driversText}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t.drivers.clearAllFilters}
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Drivers Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-orange-200 dark:border-orange-900"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{t.drivers.loadingDrivers}</p>
              </div>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Truck className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Search className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xl font-semibold mb-2">
                {drivers.length === 0 ? t.drivers.noDriversYet : t.drivers.noDrivers}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                {drivers.length === 0 ? t.drivers.addFirstDriver : t.drivers.tryAdjustingSearch}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.drivers.status}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.orders.driver}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.drivers.phone}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.drivers.vehicle}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.drivers.city}
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.common.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filteredDrivers.map((driver, index) => {
                    const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
                      ONLINE: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
                      DELIVERING: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" },
                      OFFLINE: { bg: "bg-gray-50 dark:bg-gray-700/30", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-400" },
                    };
                    const statusStyle = statusConfig[driver.status] || statusConfig.OFFLINE;

                    return (
                      <tr
                        key={driver.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                            {driver.status === "ONLINE" ? t.drivers.online : driver.status === "DELIVERING" ? t.drivers.delivering : t.drivers.offline}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                {driver.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {driver.name}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                ID: {driver.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {driver.phone}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{driver.carPlate}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {driver.city || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(driver)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(driver.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDriver ? t.drivers.editDriver : t.drivers.addNewDriver}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.drivers.driverName}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t.drivers.enterDriverName}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.drivers.phoneNumber}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998 XX XXX XX XX"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              № водителя
            </label>
            <input
              type="text"
              value={formData.driverNumber}
              onChange={(e) => setFormData({ ...formData, driverNumber: e.target.value })}
              placeholder="001"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.drivers.carPlate}
            </label>
            <input
              type="text"
              value={formData.carPlate}
              onChange={(e) => setFormData({ ...formData, carPlate: e.target.value })}
              placeholder="01A123BC"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.drivers.carBrand}
            </label>
            <input
              type="text"
              value={formData.carBrand}
              onChange={(e) => setFormData({ ...formData, carBrand: e.target.value })}
              placeholder="Toyota, Chevrolet, etc."
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.drivers.carColor}
            </label>
            <input
              type="text"
              value={formData.carColor}
              onChange={(e) => setFormData({ ...formData, carColor: e.target.value })}
              placeholder="White, Black, Silver, etc."
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.drivers.city}
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Tashkent"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.drivers.status}
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as DriverStatus })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              required
            >
              <option value="ONLINE">{t.drivers.online}</option>
              <option value="OFFLINE">{t.drivers.offline}</option>
              <option value="DELIVERING">{t.drivers.delivering}</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-orange-500/30 transition-all hover:scale-105"
            >
              <Save className="w-5 h-5" />
              {editingDriver ? t.drivers.updateDriver : t.drivers.addDriver}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
