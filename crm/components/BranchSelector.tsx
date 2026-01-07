// file: components/BranchSelector.tsx
// Branch selector dropdown for HQ staff to filter data by branch

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, ChevronDown } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  city: string;
  isHeadquarters: boolean;
}

interface BranchSelectorProps {
  selectedBranchId: string | null;
  onBranchChange: (branchId: string | null) => void;
  className?: string;
}

export default function BranchSelector({
  selectedBranchId,
  onBranchChange,
  className = "",
}: BranchSelectorProps) {
  const { profile, canAccessAllBranches } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch branches for the firm
  useEffect(() => {
    const fetchBranches = async () => {
      if (!profile?.firmId || !canAccessAllBranches) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/branches?firmId=${profile.firmId}`);
        const data = await response.json();

        if (response.ok && data.branches) {
          setBranches(data.branches);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [profile?.firmId, canAccessAllBranches]);

  // Don't render if user cannot access all branches
  if (!canAccessAllBranches) {
    return null;
  }

  // Get selected branch name
  const selectedBranch = selectedBranchId
    ? branches.find((b) => b.id === selectedBranchId)
    : null;
  const displayText = selectedBranch ? selectedBranch.name : "All Branches";

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[180px]"
        disabled={loading}
      >
        <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
          {loading ? "Loading..." : displayText}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !loading && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-full min-w-[220px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
            {/* All Branches option */}
            <button
              onClick={() => {
                onBranchChange(null);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                !selectedBranchId
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <Building2 className="w-4 h-4" />
              All Branches
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Branch list */}
            <div className="max-h-60 overflow-y-auto">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => {
                    onBranchChange(branch.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedBranchId === branch.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{branch.name}</span>
                    {branch.isHeadquarters && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                        HQ
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {branch.city}
                  </span>
                </button>
              ))}

              {branches.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  No branches found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
