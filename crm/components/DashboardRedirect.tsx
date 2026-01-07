"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function DashboardRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isOwner, user, loading } = useAuth();

  useEffect(() => {
    // Wait for profile to load before redirecting
    if (loading) return;

    // If not logged in, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // If user is NOT super admin (not WaterGo), redirect to firm dashboard
    if (!isOwner) {
      router.push("/firm-dashboard");
    }
  }, [isOwner, user, loading, router]);

  // Show loading while profile is loading or user not ready
  if (loading || !user) {
    return <LoadingScreen />;
  }

  // Show loading while redirecting non-owner
  if (!isOwner) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
