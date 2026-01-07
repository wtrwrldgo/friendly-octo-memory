// file: app/firm-clients-refactored/page.tsx
// This is an example of the refactored architecture

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Client, ClientType } from "@/types";
import { Building2, Store, Landmark, Plus, Edit, Trash2, Save } from "lucide-react";
import { useCRUD } from "@/hooks/useCRUD";
import { useModal } from "@/hooks/useModal";
import { useForm } from "@/hooks/useForm";
import { mockClients } from "@/lib/mockData";
import { formatDateTime, getRelativeTime, isValidEmail, isValidPhone } from "@/lib/utils";

export default function FirmClientsRefactoredPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ClientType>("B2C");

  // Use CRUD hook for client management
  const {
    items: clients,
    create: createClient,
    update: updateClient,
    remove: removeClient,
    filter: filterClients,
    error: crudError,
  } = useCRUD<Client>({
    initialData: mockClients,
    generateId: () => `c${Date.now()}`,
    onBeforeDelete: (id) => {
      return confirm("Are you sure you want to delete this client?");
    },
  });

  // Use modal hook
  const modal = useModal();

  // Form state
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Use form hook
  const form = useForm<Omit<Client, "id" | "firmId" | "totalOrders" | "revenue" | "createdAt">>({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      type: "B2C" as ClientType,
    },
    validate: (values) => {
      const errors: any = {};

      if (!values.name.trim()) {
        errors.name = "Name is required";
      }

      if (!values.phone.trim()) {
        errors.phone = "Phone is required";
      } else if (!isValidPhone(values.phone)) {
        errors.phone = "Invalid phone format. Use +998XXXXXXXXX";
      }

      if (values.email && !isValidEmail(values.email)) {
        errors.email = "Invalid email format";
      }

      if (!values.address.trim()) {
        errors.address = "Address is required";
      }

      return errors;
    },
    onSubmit: (values) => {
      if (editingClient) {
        updateClient(editingClient.id, values);
      } else {
        createClient({
          ...values,
          firmId: "1",
          totalOrders: 0,
          revenue: 0,
          createdAt: new Date().toISOString(),
        } as any);
      }
      modal.close();
      form.resetForm();
      setEditingClient(null);
    },
  });

  // Filter clients by tab
  const filteredClients = useMemo(() => {
    return filterClients((client) => client.type === activeTab);
  }, [activeTab, filterClients]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalClients: clients.length,
      b2cCount: filterClients((c) => c.type === "B2C").length,
      b2bCount: filterClients((c) => c.type === "B2B").length,
      b2gCount: filterClients((c) => c.type === "B2G").length,
      totalRevenue: clients.reduce((sum, c) => sum + c.revenue, 0),
      totalOrders: clients.reduce((sum, c) => sum + c.totalOrders, 0),
    };
  }, [clients, filterClients]);

  // Auth check - redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const openCreateModal = () => {
    setEditingClient(null);
    form.setValues({
      name: "",
      phone: "",
      email: "",
      address: "",
      type: activeTab,
    });
    modal.open();
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    form.setValues({
      name: client.name,
      phone: client.phone,
      email: client.email || "",
      address: client.address,
      type: client.type,
    });
    modal.open();
  };

  const handleDelete = (id: string) => {
    removeClient(id);
  };

  // Tab configuration
  const tabs = [
    { type: "B2C" as ClientType, label: "Consumers (B2C)", icon: Store, color: "blue", count: stats.b2cCount },
    { type: "B2B" as ClientType, label: "Businesses (B2B)", icon: Building2, color: "purple", count: stats.b2bCount },
    { type: "B2G" as ClientType, label: "Government (B2G)", icon: Landmark, color: "green", count: stats.b2gCount },
  ];

  return (
    <div className="p-8 min-h-screen dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="My Clients" description="Manage your customer relationships" />
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Error display */}
      {crudError && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400">
          {crudError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Clients</p>
          <p className="text-3xl font-bold text-navy-900 dark:text-white">{stats.totalClients}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Revenue/Client</p>
          <p className="text-3xl font-bold text-purple-600">
            ${Math.round(stats.totalRevenue / (stats.totalClients || 1)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all ${
                isActive
                  ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg`
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <td className="px-6 py-5">
                    <p className="font-bold text-navy-900 dark:text-white">{client.name}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{client.phone}</p>
                    {client.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{client.email}</p>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {client.address}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {client.totalOrders}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ${client.revenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {client.lastOrderAt ? getRelativeTime(client.lastOrderAt) : "Never"}
                    </p>
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
        isOpen={modal.isOpen}
        onClose={() => {
          modal.close();
          form.resetForm();
          setEditingClient(null);
        }}
        title={editingClient ? "Edit Client" : "Add New Client"}
      >
        <form onSubmit={form.handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Client Name
            </label>
            <input
              type="text"
              name="name"
              value={form.values.name}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur("name")}
              placeholder="Enter client name"
              className={`w-full px-4 py-3 rounded-xl border ${
                form.errors.name && form.touched.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
            />
            {form.errors.name && form.touched.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.values.phone}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur("phone")}
              placeholder="+998901234567"
              className={`w-full px-4 py-3 rounded-xl border ${
                form.errors.phone && form.touched.phone
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
            />
            {form.errors.phone && form.touched.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={form.values.email}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur("email")}
              placeholder="email@example.com"
              className={`w-full px-4 py-3 rounded-xl border ${
                form.errors.email && form.touched.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {form.errors.email && form.touched.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={form.values.address}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur("address")}
              placeholder="Enter full address"
              className={`w-full px-4 py-3 rounded-xl border ${
                form.errors.address && form.touched.address
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              rows={3}
              required
            />
            {form.errors.address && form.touched.address && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Client Type
            </label>
            <select
              name="type"
              value={form.values.type}
              onChange={form.handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="B2C">Consumer (B2C)</option>
              <option value="B2B">Business (B2B)</option>
              <option value="B2G">Government (B2G)</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                modal.close();
                form.resetForm();
                setEditingClient(null);
              }}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={form.isSubmitting || !form.isValid}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <Save className="w-5 h-5" />
              {editingClient ? "Update Client" : "Add Client"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
