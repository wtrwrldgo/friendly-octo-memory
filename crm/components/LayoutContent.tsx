// file: components/LayoutContent.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TrialExpiredOverlay from "./TrialExpiredOverlay";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Don't show sidebar on login page or pricing page
  const isLoginPage = pathname === "/login";
  const isPricingPage = pathname === "/pricing";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoginPage || !user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
      {/* Show trial expired overlay for firm accounts - but not on pricing page */}
      {!isPricingPage && <TrialExpiredOverlay />}
    </div>
  );
}
