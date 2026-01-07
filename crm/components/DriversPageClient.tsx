// file: components/DriversPageClient.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Truck, Building2, ChevronDown, RefreshCw, Search, MapPin,
  Clock, Wifi, WifiOff, Car, Users, Activity, TrendingUp,
  MoreHorizontal, Filter, ArrowUpRight, Zap
} from "lucide-react";
import { Driver, DriverStatus } from "@/types";

type StatusFilter = "ALL" | "ONLINE" | "OFFLINE";

function formatRelativeTime(dateString: string | null) {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DriversPageClient() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFirm, setSelectedFirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFirmFilterOpen, setIsFirmFilterOpen] = useState(false);

  // Get unique firms from drivers data
  const uniqueFirms = useMemo(() => {
    const firms = new Map<string, { id: string; name: string }>();
    drivers.forEach(driver => {
      if (driver.firmId && driver.firmName) {
        firms.set(driver.firmId, {
          id: driver.firmId,
          name: driver.firmName
        });
      }
    });
    return Array.from(firms.values());
  }, [drivers]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/drivers");
      const data = await response.json();
      if (data.drivers) {
        setDrivers(data.drivers);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const stats = useMemo(() => ({
    total: drivers.length,
    online: drivers.filter(d => d.status === "ONLINE").length,
    offline: drivers.filter(d => d.status === "OFFLINE").length,
  }), [drivers]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      if (selectedFirm && driver.firmId !== selectedFirm) return false;
      if (statusFilter === "ONLINE" && !driver.isOnline) return false;
      if (statusFilter === "OFFLINE" && driver.isOnline) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          driver.driverNumber?.toString().includes(query) ||
          driver.vehicleNumber?.toLowerCase().includes(query) ||
          driver.firmName?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [drivers, selectedFirm, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition" />
                  <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <Truck className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Platform Drivers</h1>
                  <p className="text-slate-400 text-sm mt-0.5">Real-time driver monitoring across all firms</p>
                </div>
              </div>
              <button
                onClick={fetchDrivers}
                disabled={loading}
                className="flex items-center gap-2.5 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium text-slate-300">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Total */}
            <div className="group relative bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">Total Drivers</p>
                  <p className="text-4xl font-bold text-white">{stats.total}</p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-lg">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400">Active</span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Online */}
            <div className="group relative bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-white/5 p-6 hover:border-emerald-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">Online Now</p>
                  <p className="text-4xl font-bold text-emerald-400">{stats.online}</p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-slate-500">Live</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Offline */}
            <div className="group relative bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-white/5 p-6 hover:border-slate-500/20 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">Offline</p>
                  <p className="text-4xl font-bold text-slate-400">{stats.offline}</p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="text-xs text-slate-500">Inactive drivers</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-slate-500/10 rounded-xl flex items-center justify-center">
                  <WifiOff className="w-6 h-6 text-slate-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search drivers, vehicles, firms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex bg-slate-900/50 rounded-xl p-1 border border-white/5">
                  {(["ALL", "ONLINE", "OFFLINE"] as StatusFilter[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        statusFilter === status
                          ? status === "ONLINE"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : status === "OFFLINE"
                            ? "bg-slate-500/20 text-slate-300"
                            : "bg-blue-500/20 text-blue-400"
                          : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {status === "ALL" ? "All" : status === "ONLINE" ? "Online" : "Offline"}
                    </button>
                  ))}
                </div>

                {/* Firm Filter */}
                <div className="relative">
                  <button
                    onClick={() => setIsFirmFilterOpen(!isFirmFilterOpen)}
                    className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-sm hover:border-white/10 transition"
                  >
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{selectedFirm ? uniqueFirms.find(f => f.id === selectedFirm)?.name : "All Firms"}</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                  {isFirmFilterOpen && (
                    <div className="absolute top-full mt-2 right-0 w-64 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 py-2 backdrop-blur-xl">
                      <button
                        onClick={() => { setSelectedFirm(null); setIsFirmFilterOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition ${!selectedFirm ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'}`}
                      >
                        All Firms
                      </button>
                      {uniqueFirms.map(firm => (
                        <button
                          key={firm.id}
                          onClick={() => { setSelectedFirm(firm.id); setIsFirmFilterOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition ${selectedFirm === firm.id ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'}`}
                        >
                          {firm.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="px-6 py-3 bg-slate-900/30 border-b border-white/5">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</div>
                <div className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</div>
                <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle</div>
                <div className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Firm</div>
                <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Seen</div>
                <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Location</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="inline-flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                    <span className="text-slate-400">Loading drivers...</span>
                  </div>
                </div>
              ) : filteredDrivers.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-medium">No drivers found</p>
                  <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                filteredDrivers.map((driver) => (
                  <div key={driver.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Status */}
                      <div className="col-span-1">
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${
                          driver.isOnline
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-500/10 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${driver.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          <span className="text-xs font-medium">{driver.isOnline ? 'On' : 'Off'}</span>
                        </div>
                      </div>

                      {/* Driver */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-white/5">
                            <span className="text-sm font-bold text-blue-400">
                              {driver.driverNumber || '#'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Driver #{driver.driverNumber}</p>
                            <p className="text-xs text-slate-500">{driver.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-300">{driver.vehicleNumber || '—'}</span>
                        </div>
                      </div>

                      {/* Firm */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-700/50 rounded-md flex items-center justify-center">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <span className="text-sm text-slate-300">{driver.firmName || 'Unknown'}</span>
                        </div>
                      </div>

                      {/* Last Seen */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRelativeTime(driver.lastSeenAt || null)}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="col-span-1 text-right">
                        {driver.lastLocation ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/30 rounded-md text-xs text-slate-400">
                            <MapPin className="w-3 h-3" />
                            {driver.lastLocation.lat?.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {!loading && filteredDrivers.length > 0 && (
              <div className="px-6 py-4 bg-slate-900/30 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Showing <span className="text-slate-300 font-medium">{filteredDrivers.length}</span> of <span className="text-slate-300 font-medium">{drivers.length}</span> drivers
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
