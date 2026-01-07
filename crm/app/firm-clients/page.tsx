// file: app/firm-clients/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useFirmData } from "@/contexts/FirmDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Client, ClientType } from "@/types";
import {
  Users, Building2, Store, Landmark, Plus, Edit2, Trash2, Save,
  Navigation, Search, RefreshCw, Phone, Mail, MapPin,
  ShoppingCart, DollarSign, X, XCircle
} from "lucide-react";

export default function FirmClientsPage() {
  const { user, firm } = useAuth();
  const { clients, clientsLoading, fetchClients } = useFirmData();
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ClientType | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedClientAddress, setSelectedClientAddress] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "B2C" as ClientType,
  });

  const loading = clientsLoading;

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Will use cached data if available
    fetchClients();
  }, [user, router, fetchClients]);

  const stats = useMemo(() => ({
    total: clients.length,
    b2c: clients.filter(c => c.type === "B2C").length,
    b2b: clients.filter(c => c.type === "B2B").length,
    b2g: clients.filter(c => c.type === "B2G").length,
    totalRevenue: clients.reduce((sum, c) => sum + c.revenue, 0),
    totalOrders: clients.reduce((sum, c) => sum + c.totalOrders, 0),
  }), [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      if (activeTab !== "ALL" && client.type !== activeTab) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          client.name?.toLowerCase().includes(query) ||
          client.phone?.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query) ||
          client.address?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [clients, activeTab, searchQuery]);

  if (!user) return null;

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      type: activeTab === "ALL" ? "B2C" : activeTab,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || "",
      address: client.address,
      type: client.type,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual API call for create/update
    setIsModalOpen(false);
    // Refresh cache
    fetchClients(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t.clients.deleteConfirm)) {
      // TODO: Implement actual API call for delete
      // Refresh cache
      fetchClients(true);
    }
  };

  const openMapModal = (address: string) => {
    setSelectedClientAddress(address);
    setIsMapModalOpen(true);
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={t.clients.title}
          description={t.clients.description}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            {t.clients.addClient}
          </button>
        </div>
      </div>

      <div className="mb-8">
        {/* Stats Cards - Premium Design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">{t.clients.totalClients}</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-cyan-400 to-cyan-500 shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-100">{t.clients.b2cCustomers}</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.b2c}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Store className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100">{t.clients.totalOrders}</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.totalOrders}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-100">{t.clients.totalRevenue}</p>
                <p className="text-4xl font-bold text-white mt-2">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter - Premium Design */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-5 mb-6 shadow-xl shadow-gray-200/50 dark:shadow-none">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <input
                type="text"
                placeholder={t.clients.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { value: "ALL", label: t.common.all, icon: Users, color: "blue" },
                { value: "B2C", label: t.clients.b2c, icon: Store, color: "cyan" },
                { value: "B2B", label: t.clients.b2b, icon: Building2, color: "purple" },
                { value: "B2G", label: t.clients.b2g, icon: Landmark, color: "emerald" },
              ].map((filter) => {
                const Icon = filter.icon;
                const isActive = activeTab === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setActiveTab(filter.value as ClientType | "ALL")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105"
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
              onClick={() => fetchClients(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all font-semibold shadow-sm hover:shadow-md"
              title={t.common.refresh}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t.common.refresh}</span>
            </button>
          </div>

          {/* Results count */}
          {(searchQuery || activeTab !== "ALL") && (
            <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-200/50 dark:border-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.clients.found} <span className="font-bold text-gray-900 dark:text-white bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">{filteredClients.length}</span> {t.clients.of} {clients.length} {t.clients.clientsText}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("ALL");
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t.clients.clearAllFilters}
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Clients Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{t.clients.loadingClients}</p>
              </div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Search className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xl font-semibold mb-2">
                {clients.length === 0 ? t.clients.noClientsYet : t.clients.noClients}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                {clients.length === 0 ? t.clients.addFirstClient : t.clients.tryAdjustingSearch}
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
                      {t.clients.client}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.clients.contact}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.clients.address}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.orders.title}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.clients.revenue}
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.common.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filteredClients.map((client, index) => {
                    const typeConfig: Record<string, { bg: string; text: string; icon: any }> = {
                      B2C: { bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-600 dark:text-cyan-400", icon: Store },
                      B2B: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", icon: Building2 },
                      B2G: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", icon: Landmark },
                    };
                    const typeStyle = typeConfig[client.type] || typeConfig.B2C;
                    const TypeIcon = typeStyle.icon;

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeStyle.bg}`}>
                              <TypeIcon className={`w-5 h-5 ${typeStyle.text}`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {client.name}
                              </p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                                {client.type}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {client.phone}
                            </div>
                            {client.email && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <Mail className="w-3 h-3" />
                                {client.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{client.address}</p>
                            <button
                              onClick={() => openMapModal(client.address)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                              title={t.clients.viewOnMap}
                            >
                              <Navigation className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {client.totalOrders}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ${client.revenue.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(client)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title={t.common.edit}
                            >
                              <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title={t.common.delete}
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
        title={editingClient ? t.clients.editClient : t.clients.addNewClient}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.clients.clientName}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t.clients.enterClientName}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.clients.clientType}
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ClientType })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            >
              <option value="B2C">{t.clients.b2cConsumer}</option>
              <option value="B2B">{t.clients.b2bBusinessType}</option>
              <option value="B2G">{t.clients.b2gGovernmentType}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.clients.phoneNumber}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998 XX XXX XX XX"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.clients.emailOptional}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="client@example.com"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.clients.address}
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t.clients.enterAddress}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              rows={3}
              required
            />
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
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
            >
              <Save className="w-5 h-5" />
              {editingClient ? t.clients.updateClient : t.clients.addClient}
            </button>
          </div>
        </form>
      </Modal>

      {/* Map Modal */}
      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title={t.clients.clientLocation}
      >
        <div className="space-y-4">
          {/* Address Display */}
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t.clients.deliveryAddress}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{selectedClientAddress}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Uzbekistan</p>
            </div>
          </div>

          {/* Embedded Map */}
          <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://yandex.com/map-widget/v1/?ll=69.2401%2C41.2995&z=15&l=map&pt=69.2401,41.2995,pm2wtm`}
              allowFullScreen
              title="Client Location on Yandex Maps"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <a
              href={`https://yandex.com/maps/?text=${encodeURIComponent(selectedClientAddress + ", Uzbekistan")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-2xl text-white font-semibold transition-all shadow-lg shadow-red-500/25 hover:scale-105"
            >
              <Navigation className="w-4 h-4" />
              {t.clients.openInYandexMaps}
            </a>
            <button
              onClick={() => setIsMapModalOpen(false)}
              className="px-6 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
