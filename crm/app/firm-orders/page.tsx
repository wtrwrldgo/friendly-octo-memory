// file: app/firm-orders/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Order, OrderStatus } from "@/types";
import { Plus, Edit, Trash2, Save } from "lucide-react";

export default function FirmOrdersPage() {
  const { user, firm, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    address: "",
    status: "PENDING" as OrderStatus,
  });

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ord-001",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      clientName: "Aziz Karimov",
      address: "Chilanzar 10, apt 45, Tashkent",
      status: "ON_THE_WAY",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ord-002",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      clientName: "Nigora Rahimova",
      address: "Yunusabad 5, house 12, Tashkent",
      status: "DELIVERED",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "ord-003",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      clientName: "Rustam Nazarov",
      address: "Mirzo Ulugbek 23, Tashkent",
      status: "PENDING",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "ord-004",
      firmId: "1",
      firmName: "AquaPure Tashkent",
      clientName: "Sardor Alimov",
      address: "Sergeli 8, Tashkent",
      status: "ASSIGNED",
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return null;
  }

  const openCreateModal = () => {
    setEditingOrder(null);
    setFormData({
      clientName: "",
      address: "",
      status: "PENDING",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      clientName: order.clientName,
      address: order.address,
      status: order.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingOrder) {
      // Update
      setOrders(
        orders.map((o) =>
          o.id === editingOrder.id
            ? {
                ...o,
                clientName: formData.clientName,
                address: formData.address,
                status: formData.status,
              }
            : o
        )
      );
    } else {
      // Create
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        firmId: "1",
        firmName: "AquaPure Tashkent",
        clientName: formData.clientName,
        address: formData.address,
        status: formData.status,
        createdAt: new Date().toISOString(),
      };
      setOrders([newOrder, ...orders]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      setOrders(orders.filter((o) => o.id !== id));
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="My Orders"
          description="View and manage all your delivery orders"
        />
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Create Order
        </button>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-2xl border-2 backdrop-blur-sm bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-500/20">
            <p className="text-sm font-medium mb-1 text-blue-600 dark:text-blue-300">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
          </div>
          <div className="p-5 rounded-2xl border-2 backdrop-blur-sm bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-500/20">
            <p className="text-sm font-medium mb-1 text-yellow-600 dark:text-yellow-300">Pending</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {orders.filter((o) => o.status === "PENDING").length}
            </p>
          </div>
          <div className="p-5 rounded-2xl border-2 backdrop-blur-sm bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-500/20">
            <p className="text-sm font-medium mb-1 text-purple-600 dark:text-purple-300">In Progress</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {orders.filter((o) => o.status === "ON_THE_WAY" || o.status === "ASSIGNED").length}
            </p>
          </div>
          <div className="p-5 rounded-2xl border-2 backdrop-blur-sm bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-500/20">
            <p className="text-sm font-medium mb-1 text-green-600 dark:text-green-300">Delivered</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {orders.filter((o) => o.status === "DELIVERED").length}
            </p>
          </div>
        </div>

        {/* Orders Table with Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => {
                  const statusColors: Record<OrderStatus, string> = {
                    PENDING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
                    ASSIGNED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                    ON_THE_WAY: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
                    DELIVERING: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
                    DELIVERED: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                    CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
                    CONFIRMED: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
                    PREPARING: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
                  };

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-transparent dark:hover:from-gray-700/30 dark:hover:to-transparent transition-all duration-200 hover:shadow-lg"
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                          {order.id}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-navy-900 dark:text-white">
                          {order.clientName}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                          {order.address}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md ${
                            statusColors[order.status]
                          }`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(order)}
                            className="p-2.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
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
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrder ? "Edit Order" : "Create New Order"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Enter client name"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Delivery Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full delivery address"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Order Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as OrderStatus })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            >
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned to Driver</option>
              <option value="ON_THE_WAY">On The Way</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
            >
              <Save className="w-5 h-5" />
              {editingOrder ? "Update Order" : "Create Order"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
