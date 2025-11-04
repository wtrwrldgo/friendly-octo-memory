// file: app/firm-staff/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Staff, StaffRole } from "@/types";
import { UserCircle, Mail, Phone, MapPin, CheckCircle, XCircle, Plus, Edit, Trash2, Save } from "lucide-react";

export default function FirmStaffPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StaffRole | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "OPERATOR" as StaffRole,
    phone: "",
    email: "",
    city: "",
    active: true,
  });

  const [staff, setStaff] = useState<Staff[]>([
    {
      id: "staff-001",
      firmId: "1",
      name: "Dilshod Karimov",
      role: "OWNER",
      phone: "+998901234567",
      email: "dilshod@aquapure.uz",
      city: "Tashkent",
      active: true,
      createdAt: "2023-01-15T10:00:00Z",
    },
    {
      id: "staff-002",
      firmId: "1",
      name: "Aziza Rahimova",
      role: "MANAGER",
      phone: "+998901234568",
      email: "aziza@aquapure.uz",
      city: "Tashkent",
      active: true,
      createdAt: "2023-02-20T10:00:00Z",
    },
    {
      id: "staff-003",
      firmId: "1",
      name: "Sardor Alimov",
      role: "OPERATOR",
      phone: "+998901234569",
      email: "sardor@aquapure.uz",
      city: "Tashkent",
      active: true,
      createdAt: "2023-03-10T10:00:00Z",
    },
    {
      id: "staff-004",
      firmId: "1",
      name: "Nigora Nazarova",
      role: "OPERATOR",
      phone: "+998901234570",
      email: "nigora@aquapure.uz",
      city: "Samarkand",
      active: true,
      createdAt: "2023-04-05T10:00:00Z",
    },
    {
      id: "staff-005",
      firmId: "1",
      name: "Rustam Yusupov",
      role: "MANAGER",
      phone: "+998901234571",
      email: "rustam@aquapure.uz",
      city: "Samarkand",
      active: false,
      createdAt: "2023-05-12T10:00:00Z",
    },
    {
      id: "staff-006",
      firmId: "1",
      name: "Malika Akbarova",
      role: "OPERATOR",
      phone: "+998901234572",
      email: "malika@aquapure.uz",
      city: "Bukhara",
      active: true,
      createdAt: "2023-06-18T10:00:00Z",
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
    setEditingStaff(null);
    setFormData({
      name: "",
      role: "OPERATOR",
      phone: "",
      email: "",
      city: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: Staff) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      role: member.role,
      phone: member.phone,
      email: member.email || "",
      city: member.city || "",
      active: member.active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStaff) {
      // Update
      setStaff(
        staff.map((s) =>
          s.id === editingStaff.id
            ? {
                ...s,
                name: formData.name,
                role: formData.role,
                phone: formData.phone,
                email: formData.email,
                city: formData.city,
                active: formData.active,
              }
            : s
        )
      );
    } else {
      // Create
      const newStaff: Staff = {
        id: `staff-${Date.now()}`,
        firmId: "1",
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        active: formData.active,
        createdAt: new Date().toISOString(),
      };
      setStaff([...staff, newStaff]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      setStaff(staff.filter((s) => s.id !== id));
    }
  };

  const filteredStaff = activeTab === "ALL" ? staff : staff.filter((s) => s.role === activeTab);

  const ownerStaff = staff.filter((s) => s.role === "OWNER");
  const managerStaff = staff.filter((s) => s.role === "MANAGER");
  const operatorStaff = staff.filter((s) => s.role === "OPERATOR");
  const activeStaff = staff.filter((s) => s.active);

  const getRoleBadgeColor = (role: StaffRole) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      case "MANAGER":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "OPERATOR":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="p-8 min-h-screen dark:bg-gray-900">
      <div className="flex items-center justify-between mb-8">
        <PageHeader
          title="Staff Management"
          description="Manage your team members across all locations"
        />
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Staff Member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
            activeTab === "ALL"
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-gray-200 dark:border-gray-700"
          }`}
        >
          <UserCircle className="w-5 h-5" />
          <div className="text-left">
            <p className="font-semibold">All Staff</p>
            <p className="text-sm opacity-80">{staff.length} members</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("OWNER")}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
            activeTab === "OWNER"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="text-left">
            <p className="font-semibold">Owners</p>
            <p className="text-sm opacity-80">{ownerStaff.length} member</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("MANAGER")}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
            activeTab === "MANAGER"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="text-left">
            <p className="font-semibold">Managers</p>
            <p className="text-sm opacity-80">{managerStaff.length} members</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("OPERATOR")}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
            activeTab === "OPERATOR"
              ? "bg-green-600 text-white shadow-lg shadow-green-500/25"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="text-left">
            <p className="font-semibold">Operators</p>
            <p className="text-sm opacity-80">{operatorStaff.length} members</p>
          </div>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Staff</p>
          <p className="text-3xl font-bold text-navy-900 dark:text-white">{filteredStaff.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</p>
          <p className="text-3xl font-bold text-green-600">{activeStaff.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Managers</p>
          <p className="text-3xl font-bold text-blue-600">{managerStaff.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Operators</p>
          <p className="text-3xl font-bold text-purple-600">{operatorStaff.length}</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredStaff.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <p className="font-bold text-navy-900 dark:text-white">{member.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {member.phone}
                      </div>
                      {member.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {member.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {member.city && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {member.city}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {member.active ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">Inactive</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-sm">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
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
        title={editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="OWNER">Owner</option>
              <option value="MANAGER">Manager</option>
              <option value="OPERATOR">Operator</option>
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
              placeholder="+998901234567"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Active Status
            </label>
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
              {editingStaff ? "Update" : "Add Staff"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
