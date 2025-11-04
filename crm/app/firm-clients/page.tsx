// file: app/firm-clients/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Client, ClientType } from "@/types";
import { Building2, Store, Landmark, Plus, Edit, Trash2, Save, Navigation } from "lucide-react";

export default function FirmClientsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ClientType>("B2C");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedClientAddress, setSelectedClientAddress] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "B2C" as ClientType,
  });

  const [clients, setClients] = useState<Client[]>([
    {
      id: "c1",
      name: "Aziz Karimov",
      phone: "+998901234567",
      email: "aziz@example.com",
      address: "Chilanzar 10, apt 45, Tashkent",
      firmId: "1",
      type: "B2C",
      totalOrders: 45,
      revenue: 1350,
      createdAt: "2024-01-15T10:00:00Z",
      lastOrderAt: new Date().toISOString(),
    },
    {
      id: "c2",
      name: "Nigora Rahimova",
      phone: "+998901234568",
      email: "nigora@example.com",
      address: "Yunusabad 5, house 12, Tashkent",
      firmId: "1",
      type: "B2C",
      totalOrders: 32,
      revenue: 960,
      createdAt: "2024-02-10T10:00:00Z",
      lastOrderAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "c3",
      name: "Tech Solutions LLC",
      phone: "+998712345678",
      email: "office@techsolutions.uz",
      address: "Amir Temur 45, Business Center, Tashkent",
      firmId: "1",
      type: "B2B",
      totalOrders: 150,
      revenue: 15000,
      createdAt: "2023-12-01T10:00:00Z",
      lastOrderAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "c4",
      name: "Tashkent City Hall",
      phone: "+998712501010",
      email: "procurement@tashkent.gov.uz",
      address: "Mustakillik Square 1, Tashkent",
      firmId: "1",
      type: "B2G",
      totalOrders: 250,
      revenue: 35000,
      createdAt: "2023-11-15T10:00:00Z",
      lastOrderAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: "c5",
      name: "Green Cafe Network",
      phone: "+998901112233",
      email: "supply@greencafe.uz",
      address: "Shaykhantahur 12, Tashkent",
      firmId: "1",
      type: "B2B",
      totalOrders: 89,
      revenue: 8900,
      createdAt: "2024-01-20T10:00:00Z",
      lastOrderAt: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: "c6",
      name: "Ministry of Education",
      phone: "+998712345679",
      email: "logistics@edu.gov.uz",
      address: "Buyuk Turon 31, Tashkent",
      firmId: "1",
      type: "B2G",
      totalOrders: 180,
      revenue: 27000,
      createdAt: "2023-10-01T10:00:00Z",
      lastOrderAt: new Date(Date.now() - 345600000).toISOString(),
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
    setEditingClient(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      type: activeTab,
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

    if (editingClient) {
      // Update
      setClients(clients.map(c =>
        c.id === editingClient.id
          ? { ...c, ...formData }
          : c
      ));
    } else {
      // Create
      const newClient: Client = {
        id: `c${clients.length + 1}`,
        ...formData,
        firmId: "1",
        totalOrders: 0,
        revenue: 0,
        createdAt: new Date().toISOString(),
      };
      setClients([...clients, newClient]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const openMapModal = (address: string) => {
    setSelectedClientAddress(address);
    setIsMapModalOpen(true);
  };

  const filteredClients = clients.filter((c) => c.type === activeTab);
  const b2cClients = clients.filter((c) => c.type === "B2C");
  const b2bClients = clients.filter((c) => c.type === "B2B");
  const b2gClients = clients.filter((c) => c.type === "B2G");

  const totalRevenue = filteredClients.reduce((sum, c) => sum + c.revenue, 0);
  const totalOrders = filteredClients.reduce((sum, c) => sum + c.totalOrders, 0);

  return (
    <div className="p-8 min-h-screen dark:bg-gray-900">
      <div className="flex items-center justify-between mb-8">
        <PageHeader
          title="Clients"
          description="Manage your B2B, B2C, and B2G clients"
        />
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("B2C")}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
            activeTab === "B2C"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-gray-200 dark:border-gray-700"
          }`}
        >
          <Store className="w-5 h-5" />
          <div className="text-left">
            <p className="font-semibold">B2C Clients</p>
            <p className="text-sm opacity-80">{b2cClients.length} customers</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("B2B")}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
            activeTab === "B2B"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-gray-200 dark:border-gray-700"
          }`}
        >
          <Building2 className="w-5 h-5" />
          <div className="text-left">
            <p className="font-semibold">B2B Clients</p>
            <p className="text-sm opacity-80">{b2bClients.length} businesses</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("B2G")}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
            activeTab === "B2G"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-gray-200 dark:border-gray-700"
          }`}
        >
          <Landmark className="w-5 h-5" />
          <div className="text-left">
            <p className="font-semibold">B2G Clients</p>
            <p className="text-sm opacity-80">{b2gClients.length} government</p>
          </div>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Clients</p>
          <p className="text-3xl font-bold text-navy-900 dark:text-white">{filteredClients.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Last Order</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  <td className="px-6 py-5">
                    <p className="font-bold text-navy-900 dark:text-white">{client.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Since {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{client.phone}</p>
                    {client.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{client.email}</p>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {client.address}
                      </p>
                      <button
                        onClick={() => openMapModal(client.address)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                        title="View on Yandex Map"
                      >
                        <Navigation className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{client.totalOrders}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      ${client.revenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-sm">
                    {client.lastOrderAt
                      ? new Date(client.lastOrderAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? "Edit Client" : "Add New Client"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Client Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ClientType })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="B2C">B2C - Consumer</option>
              <option value="B2B">B2B - Business</option>
              <option value="B2G">B2G - Government</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
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
              {editingClient ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Yandex Map Modal */}
      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title="Client Location on Yandex Maps"
        size="lg"
      >
        <div className="space-y-4">
          {/* Address Display with Yandex Red Theme */}
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Delivery Address</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedClientAddress}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uzbekistan</p>
            </div>
          </div>

          {/* Embedded Yandex Map with Custom Pin */}
          <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-red-200 dark:border-red-800 bg-gray-100 dark:bg-gray-800 shadow-lg relative">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://yandex.com/map-widget/v1/?ll=69.2401%2C41.2995&z=15&l=map&pt=69.2401,41.2995,pm2wtm`}
              allowFullScreen
              title="Client Location on Yandex Maps"
              className="w-full h-full"
            />
            {/* Custom Pin Overlay Indicator */}
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-lg border border-red-200 dark:border-red-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Client Location</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <a
              href={`https://yandex.com/maps/?text=${encodeURIComponent(selectedClientAddress + ", Uzbekistan")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-red-500/25"
            >
              <Navigation className="w-4 h-4" />
              Navigate in Yandex Maps
            </a>
            <button
              onClick={() => setIsMapModalOpen(false)}
              className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Yandex Maps Branding */}
          <div className="flex items-center justify-center gap-2 pt-2 pb-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Powered by</p>
            <span className="text-sm font-bold text-red-600 dark:text-red-500">Yandex Maps</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
