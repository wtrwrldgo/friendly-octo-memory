// file: app/firm-staff/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Staff, StaffRole } from "@/types";
import {
  UserCircle, Mail, Phone, MapPin, CheckCircle, XCircle, Plus, Edit, Trash2, Save,
  Users, Crown, Shield, Headphones, Search, Filter, Sparkles
} from "lucide-react";
import { firmApi } from "@/lib/firmApi";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FirmStaffPage() {
  const { user, firm } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StaffRole | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    role: "OPERATOR" as StaffRole,
    phone: "",
    email: "",
    city: "",
    active: true,
  });
  const [staff, setStaff] = useState<Staff[]>([]);

  // Fetch real staff from Express.js backend
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchStaff = async () => {
      try {
        const firmId = user.firmId || firm?.id;
        if (!firmId) return;

        const response = await firmApi.getStaff(firmId);
        const data = response?.data || response || [];

        if (Array.isArray(data)) {
          const mappedStaff = data.map((s: any) => ({
            id: s.id,
            firmId: s.firmId || firmId,
            name: s.name,
            role: s.role as StaffRole,
            phone: s.phone || "",
            email: s.email || "",
            city: s.city || "",
            active: s.active !== false,
            createdAt: s.createdAt,
          }));
          setStaff(mappedStaff);
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [user, firm, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
            <Users className="absolute inset-0 m-auto w-8 h-8 text-purple-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{t.common.loading}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.common.loading}</p>
        </div>
      </div>
    );
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
    if (confirm(t.staff.deleteConfirm)) {
      setStaff(staff.filter((s) => s.id !== id));
    }
  };

  const ownerStaff = staff.filter((s) => s.role === "OWNER");
  const managerStaff = staff.filter((s) => s.role === "MANAGER");
  const operatorStaff = staff.filter((s) => s.role === "OPERATOR");
  const activeStaff = staff.filter((s) => s.active);

  // Filter staff based on tab and search
  const filteredStaff = staff.filter((s) => {
    const matchesTab = activeTab === "ALL" || s.role === activeTab;
    const matchesSearch = searchQuery === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getRoleBadgeStyle = (role: StaffRole) => {
    switch (role) {
      case "OWNER":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30";
      case "MANAGER":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30";
      case "OPERATOR":
        return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const getRoleIcon = (role: StaffRole) => {
    switch (role) {
      case "OWNER":
        return <Crown className="w-3.5 h-3.5" />;
      case "MANAGER":
        return <Shield className="w-3.5 h-3.5" />;
      case "OPERATOR":
        return <Headphones className="w-3.5 h-3.5" />;
      default:
        return <UserCircle className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <PageHeader
          title={t.staff.title}
          description={t.staff.description}
        />
        <button
          onClick={openCreateModal}
          className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3.5 rounded-2xl font-semibold shadow-xl shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          {t.staff.addStaff}
          <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* Total Staff */}
        <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-white/80 bg-white/20 px-3 py-1 rounded-full">{t.common.total}</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{staff.length}</p>
            <p className="text-sm text-white/80 font-medium">{t.staff.teamMembers}</p>
          </div>
        </div>

        {/* Active Staff */}
        <div className="group relative bg-gradient-to-br from-emerald-400 to-teal-500 p-6 rounded-3xl shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-xs font-medium text-white/80">{t.staff.active}</span>
              </div>
            </div>
            <p className="text-4xl font-black text-white mb-1">{activeStaff.length}</p>
            <p className="text-sm text-white/80 font-medium">{t.staff.activeMembers}</p>
          </div>
        </div>

        {/* Managers */}
        <div className="group relative bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-3xl shadow-xl shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-white/80 bg-white/20 px-3 py-1 rounded-full">{t.staff.teamLead}</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{managerStaff.length}</p>
            <p className="text-sm text-white/80 font-medium">{t.staff.managers}</p>
          </div>
        </div>

        {/* Operators */}
        <div className="group relative bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-3xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-white/80 bg-white/20 px-3 py-1 rounded-full">{t.staff.support}</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{operatorStaff.length}</p>
            <p className="text-sm text-white/80 font-medium">{t.staff.operators}</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 mb-6">
        <div className="flex items-center justify-between gap-6">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "ALL"
                  ? "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Users className="w-4 h-4" />
              {t.common.all} ({staff.length})
            </button>

            <button
              onClick={() => setActiveTab("OWNER")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "OWNER"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Crown className="w-4 h-4" />
              {t.staff.owners} ({ownerStaff.length})
            </button>

            <button
              onClick={() => setActiveTab("MANAGER")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "MANAGER"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Shield className="w-4 h-4" />
              {t.staff.managers} ({managerStaff.length})
            </button>

            <button
              onClick={() => setActiveTab("OPERATOR")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "OPERATOR"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Headphones className="w-4 h-4" />
              {t.staff.operators} ({operatorStaff.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.staff.searchPlaceholder}
              className="w-72 pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80 dark:from-gray-700/80 dark:to-gray-800/80 border-b border-gray-200/50 dark:border-gray-600/50">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t.staff.staffMember}
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t.staff.role}
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t.staff.contact}
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t.staff.location}
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t.common.status}
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t.staff.joined}
                </th>
                <th className="px-6 py-5 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t.common.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t.staff.noStaff}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.staff.tryAdjustingFilters}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member, index) => (
                  <tr
                    key={member.id}
                    className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/10 dark:hover:to-pink-900/10 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                            {member.name.charAt(0)}
                          </div>
                          {member.active && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {member.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${getRoleBadgeStyle(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium">{member.phone}</span>
                        </div>
                        {member.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                              <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span>{member.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {member.city ? (
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="font-medium">{member.city}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">{t.staff.notSet}</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {member.active ? (
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t.staff.active}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                          <XCircle className="w-4 h-4" />
                          <span className="font-medium">{t.staff.inactive}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {new Date(member.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-2.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-xl transition-all hover:scale-110"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-xl transition-all hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredStaff.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-700/30 border-t border-gray-200/50 dark:border-gray-600/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.staff.showing} <span className="font-semibold text-gray-900 dark:text-white">{filteredStaff.length}</span> / <span className="font-semibold text-gray-900 dark:text-white">{staff.length}</span> {t.staff.staffMembers}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? t.staff.editStaff : t.staff.addNewStaff}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.staff.fullName}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t.staff.enterFullName}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.staff.role}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            >
              <option value="OWNER">{t.staff.owner}</option>
              <option value="MANAGER">{t.staff.manager}</option>
              <option value="OPERATOR">{t.staff.operator}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.drivers.phoneNumber}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998901234567"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.clients.email}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="active" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t.staff.activeStatus}
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02]"
            >
              <Save className="w-5 h-5" />
              {editingStaff ? t.staff.updateStaff : t.staff.addStaff}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
