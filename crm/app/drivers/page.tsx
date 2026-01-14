// file: app/drivers/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Truck,
  UserCheck,
  UserX,
  Circle,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Building2,
  Car,
  MapPin,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface Driver {
  id: string;
  name: string;
  phone: string;
  firmId: string;
  firmName: string;
  status: "ONLINE" | "OFFLINE" | "DELIVERING";
  carPlate: string;
  city?: string;
  isAvailable?: boolean;
}

type StatusFilter = "ALL" | "ONLINE" | "OFFLINE" | "DELIVERING";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [firmFilter, setFirmFilter] = useState<string>("ALL");

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      // Fetch all firms first
      const firmsRes = await fetch("/api/firms");
      const firmsData = await firmsRes.json();
      const firms = firmsData.firms || firmsData.data || [];

      // Fetch drivers for each firm
      const allDrivers: Driver[] = [];

      for (const firm of firms) {
        try {
          const driversRes = await fetch(`/api/drivers?firmId=${firm.id}`);
          const driversData = await driversRes.json();
          const firmDrivers = driversData.drivers || driversData.data || [];

          for (const driver of firmDrivers) {
            allDrivers.push({
              id: driver.id,
              name: driver.name || "Unknown Driver",
              phone: driver.phone || "",
              firmId: firm.id,
              firmName: firm.name,
              status: driver.isAvailable || driver.is_available ? "ONLINE" : "OFFLINE",
              carPlate: driver.vehicleNumber || driver.vehicle_number || driver.carPlate || "N/A",
              city: driver.city || driver.district || "",
              isAvailable: driver.isAvailable || driver.is_available,
            });
          }
        } catch (err) {
          console.error(`Failed to fetch drivers for firm ${firm.id}:`, err);
        }
      }

      setDrivers(allDrivers);
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Get unique firms for filter
  const uniqueFirms = useMemo(() => {
    const firms = new Map<string, string>();
    drivers.forEach(d => {
      if (d.firmId && d.firmName) {
        firms.set(d.firmId, d.firmName);
      }
    });
    return Array.from(firms.entries());
  }, [drivers]);

  // Stats
  const stats = useMemo(() => ({
    total: drivers.length,
    online: drivers.filter(d => d.status === "ONLINE").length,
    offline: drivers.filter(d => d.status === "OFFLINE").length,
    delivering: drivers.filter(d => d.status === "DELIVERING").length,
  }), [drivers]);

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      const matchesSearch =
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.phone.includes(searchQuery) ||
        driver.carPlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.firmName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || driver.status === statusFilter;
      const matchesFirm =
        firmFilter === "ALL" || driver.firmId === firmFilter;
      return matchesSearch && matchesStatus && matchesFirm;
    });
  }, [drivers, searchQuery, statusFilter, firmFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ONLINE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            <Circle className="w-2 h-2 fill-current" />
            Online
          </span>
        );
      case "DELIVERING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            <Truck className="w-3 h-3" />
            Delivering
          </span>
        );
      case "OFFLINE":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            <Circle className="w-2 h-2" />
            Offline
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-500">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Global Drivers
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Monitor all drivers across all firms
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer transition-all ${
            statusFilter === "ALL"
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Drivers</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("ONLINE")}
          className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer transition-all ${
            statusFilter === "ONLINE"
              ? "border-green-500 ring-2 ring-green-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.online}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("DELIVERING")}
          className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer transition-all ${
            statusFilter === "DELIVERING"
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.delivering}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivering</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("OFFLINE")}
          className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer transition-all ${
            statusFilter === "OFFLINE"
              ? "border-gray-500 ring-2 ring-gray-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.offline}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Offline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, plate, or firm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>

            {/* Firm Filter */}
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <select
                value={firmFilter}
                onChange={(e) => setFirmFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="ALL">All Firms</option>
                {uniqueFirms.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="ALL">All Status</option>
                <option value="ONLINE">Online</option>
                <option value="DELIVERING">Delivering</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchDrivers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Driver</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Firm</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No drivers found</p>
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          driver.status === "ONLINE"
                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                            : driver.status === "DELIVERING"
                            ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        }`}>
                          {(driver.name || "D").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{driver.name}</p>
                          {driver.city && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <MapPin className="w-3 h-3" />
                              {driver.city}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/firms/${driver.firmId}`}
                        className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {driver.firmName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-3 h-3" />
                        {driver.phone || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm text-gray-900 dark:text-gray-300">{driver.carPlate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(driver.status)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/firms/${driver.firmId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Firm
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
