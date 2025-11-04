// file: components/AddFirmAccountModal.tsx

"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AddFirmAccountModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddFirmAccountModal({ onClose, onSuccess }: AddFirmAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firmName: "",
    city: "",
    ownerName: "",
    ownerPhone: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // POST /firms API call here
      console.log("Creating firm account:", formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create firm account:", error);
      alert("Failed to create firm account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-navy dark:text-white">Add New Firm Account</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Firm Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., AquaPure Tashkent"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-navy/20 dark:focus:ring-blue-500/20 focus:border-navy dark:focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.firmName}
              onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
            <input
              type="text"
              required
              placeholder="e.g., Tashkent"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-navy/20 dark:focus:ring-blue-500/20 focus:border-navy dark:focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., Aziz Karimov"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-navy/20 dark:focus:ring-blue-500/20 focus:border-navy dark:focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Phone *</label>
            <input
              type="tel"
              required
              placeholder="+998901234567"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-navy/20 dark:focus:ring-blue-500/20 focus:border-navy dark:focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.ownerPhone}
              onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Login Email *</label>
            <input
              type="email"
              required
              placeholder="owner@aquapure.uz"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-navy/20 dark:focus:ring-blue-500/20 focus:border-navy dark:focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Password *</label>
            <input
              type="password"
              required
              placeholder="Min 8 characters"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-navy/20 dark:focus:ring-blue-500/20 focus:border-navy dark:focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Owner will receive these credentials via email</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-navy dark:bg-blue-600 text-white rounded-lg hover:bg-navy/90 dark:hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Firm Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
