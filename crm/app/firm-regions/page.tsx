// file: app/firm-regions/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Region, District } from "@/types";
import { MapPin, Truck, ShoppingCart, DollarSign, ChevronDown, ChevronUp, Clock, Check, X, Plus, Edit, Trash2, Save } from "lucide-react";

export default function FirmRegionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [selectedRegionForDistrict, setSelectedRegionForDistrict] = useState<string | null>(null);

  const [regionFormData, setRegionFormData] = useState({
    city: "",
    activeDrivers: 0,
    totalOrders: 0,
    revenue: 0,
  });

  const [districtFormData, setDistrictFormData] = useState({
    name: "",
    deliveryFee: 0,
    estimatedTime: 0,
    active: true,
  });

  const [regions, setRegions] = useState<Region[]>([
    {
      id: "reg-001",
      firmId: "1",
      city: "Tashkent",
      activeDrivers: 8,
      totalOrders: 1250,
      revenue: 37500,
      districts: [
        {
          id: "dist-001",
          name: "Chilanzar",
          regionId: "reg-001",
          deliveryFee: 15000,
          estimatedTime: 30,
          active: true,
        },
        {
          id: "dist-002",
          name: "Yunusabad",
          regionId: "reg-001",
          deliveryFee: 12000,
          estimatedTime: 25,
          active: true,
        },
        {
          id: "dist-003",
          name: "Mirzo Ulugbek",
          regionId: "reg-001",
          deliveryFee: 18000,
          estimatedTime: 35,
          active: true,
        },
        {
          id: "dist-004",
          name: "Sergeli",
          regionId: "reg-001",
          deliveryFee: 20000,
          estimatedTime: 40,
          active: true,
        },
        {
          id: "dist-005",
          name: "Yakkasaray",
          regionId: "reg-001",
          deliveryFee: 14000,
          estimatedTime: 28,
          active: true,
        },
      ],
    },
    {
      id: "reg-002",
      firmId: "1",
      city: "Samarkand",
      activeDrivers: 4,
      totalOrders: 580,
      revenue: 17400,
      districts: [
        {
          id: "dist-006",
          name: "Old City",
          regionId: "reg-002",
          deliveryFee: 15000,
          estimatedTime: 30,
          active: true,
        },
        {
          id: "dist-007",
          name: "Registan District",
          regionId: "reg-002",
          deliveryFee: 12000,
          estimatedTime: 25,
          active: true,
        },
        {
          id: "dist-008",
          name: "Siab Bazaar Area",
          regionId: "reg-002",
          deliveryFee: 18000,
          estimatedTime: 35,
          active: false,
        },
      ],
    },
    {
      id: "reg-003",
      firmId: "1",
      city: "Bukhara",
      activeDrivers: 3,
      totalOrders: 420,
      revenue: 12600,
      districts: [
        {
          id: "dist-009",
          name: "Historic Center",
          regionId: "reg-003",
          deliveryFee: 15000,
          estimatedTime: 30,
          active: true,
        },
        {
          id: "dist-010",
          name: "Kagan District",
          regionId: "reg-003",
          deliveryFee: 20000,
          estimatedTime: 45,
          active: true,
        },
      ],
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

  const totalRegions = regions.length;
  const totalDistricts = regions.reduce((sum, r) => sum + r.districts.length, 0);
  const activeDistricts = regions.reduce(
    (sum, r) => sum + r.districts.filter((d) => d.active).length,
    0
  );
  const totalRevenue = regions.reduce((sum, r) => sum + r.revenue, 0);

  const toggleRegion = (regionId: string) => {
    setExpandedRegion(expandedRegion === regionId ? null : regionId);
  };

  // Region CRUD
  const openCreateRegionModal = () => {
    setEditingRegion(null);
    setRegionFormData({
      city: "",
      activeDrivers: 0,
      totalOrders: 0,
      revenue: 0,
    });
    setIsRegionModalOpen(true);
  };

  const openEditRegionModal = (region: Region) => {
    setEditingRegion(region);
    setRegionFormData({
      city: region.city,
      activeDrivers: region.activeDrivers,
      totalOrders: region.totalOrders,
      revenue: region.revenue,
    });
    setIsRegionModalOpen(true);
  };

  const handleRegionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRegion) {
      // Update
      setRegions(
        regions.map((r) =>
          r.id === editingRegion.id
            ? {
                ...r,
                city: regionFormData.city,
                activeDrivers: regionFormData.activeDrivers,
                totalOrders: regionFormData.totalOrders,
                revenue: regionFormData.revenue,
              }
            : r
        )
      );
    } else {
      // Create
      const newRegion: Region = {
        id: `reg-${Date.now()}`,
        firmId: "1",
        city: regionFormData.city,
        activeDrivers: regionFormData.activeDrivers,
        totalOrders: regionFormData.totalOrders,
        revenue: regionFormData.revenue,
        districts: [],
      };
      setRegions([...regions, newRegion]);
    }

    setIsRegionModalOpen(false);
  };

  const handleDeleteRegion = (id: string) => {
    if (confirm("Are you sure you want to delete this region and all its districts?")) {
      setRegions(regions.filter((r) => r.id !== id));
    }
  };

  // District CRUD
  const openCreateDistrictModal = (regionId: string) => {
    setEditingDistrict(null);
    setSelectedRegionForDistrict(regionId);
    setDistrictFormData({
      name: "",
      deliveryFee: 0,
      estimatedTime: 0,
      active: true,
    });
    setIsDistrictModalOpen(true);
  };

  const openEditDistrictModal = (district: District, regionId: string) => {
    setEditingDistrict(district);
    setSelectedRegionForDistrict(regionId);
    setDistrictFormData({
      name: district.name,
      deliveryFee: district.deliveryFee,
      estimatedTime: district.estimatedTime,
      active: district.active,
    });
    setIsDistrictModalOpen(true);
  };

  const handleDistrictSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRegionForDistrict) return;

    if (editingDistrict) {
      // Update
      setRegions(
        regions.map((r) =>
          r.id === selectedRegionForDistrict
            ? {
                ...r,
                districts: r.districts.map((d) =>
                  d.id === editingDistrict.id
                    ? {
                        ...d,
                        name: districtFormData.name,
                        deliveryFee: districtFormData.deliveryFee,
                        estimatedTime: districtFormData.estimatedTime,
                        active: districtFormData.active,
                      }
                    : d
                ),
              }
            : r
        )
      );
    } else {
      // Create
      const newDistrict: District = {
        id: `dist-${Date.now()}`,
        name: districtFormData.name,
        regionId: selectedRegionForDistrict,
        deliveryFee: districtFormData.deliveryFee,
        estimatedTime: districtFormData.estimatedTime,
        active: districtFormData.active,
      };

      setRegions(
        regions.map((r) =>
          r.id === selectedRegionForDistrict
            ? { ...r, districts: [...r.districts, newDistrict] }
            : r
        )
      );
    }

    setIsDistrictModalOpen(false);
  };

  const handleDeleteDistrict = (regionId: string, districtId: string) => {
    if (confirm("Are you sure you want to delete this district?")) {
      setRegions(
        regions.map((r) =>
          r.id === regionId
            ? { ...r, districts: r.districts.filter((d) => d.id !== districtId) }
            : r
        )
      );
    }
  };

  return (
    <div className="p-8 min-h-screen dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Regions & Districts"
          description="Manage your service areas, delivery fees, and coverage zones"
        />
        <button
          onClick={openCreateRegionModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Region
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Regions</p>
          <p className="text-3xl font-bold text-navy-900 dark:text-white">{totalRegions}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Districts</p>
          <p className="text-3xl font-bold text-green-600">{activeDistricts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Districts</p>
          <p className="text-3xl font-bold text-blue-600">{totalDistricts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-purple-600">${totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Regions List */}
      <div className="space-y-4">
        {regions.map((region) => (
          <div
            key={region.id}
            className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-card overflow-hidden"
          >
            {/* Region Header */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => toggleRegion(region.id)}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-navy-900 dark:text-white">
                      {region.city}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {region.districts.length} districts • {region.districts.filter(d => d.active).length} active
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                      <Truck className="w-5 h-5" />
                      <span className="text-2xl font-bold">{region.activeDrivers}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Drivers</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="text-2xl font-bold">{region.totalOrders}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-2xl font-bold">{region.revenue.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditRegionModal(region);
                      }}
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit Region"
                    >
                      <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRegion(region.id);
                      }}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete Region"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ml-2"
                      onClick={() => toggleRegion(region.id)}
                    >
                      {expandedRegion === region.id ? (
                        <ChevronUp className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Districts Table */}
            {expandedRegion === region.id && (
              <div className="border-t border-gray-100 dark:border-gray-700">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => openCreateDistrictModal(region.id)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add District
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          District Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Delivery Fee
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Est. Time
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
                      {region.districts.map((district) => (
                        <tr
                          key={district.id}
                          className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="font-semibold text-navy-900 dark:text-white">
                                {district.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                                {district.deliveryFee.toLocaleString()} UZS
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{district.estimatedTime} min</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {district.active ? (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <Check className="w-5 h-5" />
                                <span className="font-semibold">Active</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                                <X className="w-5 h-5" />
                                <span className="font-semibold">Inactive</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditDistrictModal(district, region.id)}
                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="Edit District"
                              >
                                <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteDistrict(region.id, district.id)}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Delete District"
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
            )}
          </div>
        ))}
      </div>

      {/* Region Modal */}
      <Modal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        title={editingRegion ? "Edit Region" : "Add New Region"}
      >
        <form onSubmit={handleRegionSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              City / Region Name
            </label>
            <input
              type="text"
              value={regionFormData.city}
              onChange={(e) => setRegionFormData({ ...regionFormData, city: e.target.value })}
              placeholder="Enter city name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Active Drivers
            </label>
            <input
              type="number"
              value={regionFormData.activeDrivers}
              onChange={(e) => setRegionFormData({ ...regionFormData, activeDrivers: Number(e.target.value) })}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Total Orders
            </label>
            <input
              type="number"
              value={regionFormData.totalOrders}
              onChange={(e) => setRegionFormData({ ...regionFormData, totalOrders: Number(e.target.value) })}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Revenue ($)
            </label>
            <input
              type="number"
              value={regionFormData.revenue}
              onChange={(e) => setRegionFormData({ ...regionFormData, revenue: Number(e.target.value) })}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsRegionModalOpen(false)}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <Save className="w-5 h-5" />
              {editingRegion ? "Update Region" : "Add Region"}
            </button>
          </div>
        </form>
      </Modal>

      {/* District Modal */}
      <Modal
        isOpen={isDistrictModalOpen}
        onClose={() => setIsDistrictModalOpen(false)}
        title={editingDistrict ? "Edit District" : "Add New District"}
      >
        <form onSubmit={handleDistrictSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              District Name
            </label>
            <input
              type="text"
              value={districtFormData.name}
              onChange={(e) => setDistrictFormData({ ...districtFormData, name: e.target.value })}
              placeholder="Enter district name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Delivery Fee (UZS)
            </label>
            <input
              type="number"
              value={districtFormData.deliveryFee}
              onChange={(e) => setDistrictFormData({ ...districtFormData, deliveryFee: Number(e.target.value) })}
              placeholder="15000"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Estimated Delivery Time (minutes)
            </label>
            <input
              type="number"
              value={districtFormData.estimatedTime}
              onChange={(e) => setDistrictFormData({ ...districtFormData, estimatedTime: Number(e.target.value) })}
              placeholder="30"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              District Status
            </label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="districtActive"
                checked={districtFormData.active}
                onChange={(e) => setDistrictFormData({ ...districtFormData, active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
              />
              <label htmlFor="districtActive" className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                District is Active
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsDistrictModalOpen(false)}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <Save className="w-5 h-5" />
              {editingDistrict ? "Update District" : "Add District"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
