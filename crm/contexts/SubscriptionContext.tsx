// file: contexts/SubscriptionContext.tsx

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

export type SubscriptionStatus = "TRIAL_ACTIVE" | "TRIAL_EXPIRED" | "BASIC" | "PRO" | "MAX";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  trialStartAt: string | null;
  trialEndAt: string | null;
  daysRemaining: number | null;
  isTrialExpired: boolean;
  hasAccess: boolean;
}

interface SubscriptionContextType {
  subscription: SubscriptionInfo | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://45.92.173.121";
const WATERGO_FIRM_ID = "00000000-0000-0000-0000-000000000000";
const TRIAL_DAYS = 30;

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { profile, firm, loading: authLoading, isWatergoAdmin } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateSubscription = useCallback(async () => {
    // Don't calculate if no profile
    if (!profile?.firmId) {
      setLoading(false);
      return;
    }

    // WaterGo admin has unlimited access
    if (isWatergoAdmin || profile.role === "WATERGO_ADMIN") {
      setSubscription({
        status: "MAX",
        trialStartAt: null,
        trialEndAt: null,
        daysRemaining: null,
        isTrialExpired: false,
        hasAccess: true,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch firm details to get createdAt date
      const response = await fetch(`${BACKEND_URL}/api/firms/${profile.firmId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch firm details");
      }

      const result = await response.json();
      const firmData = result.success ? result.data : result;

      // Calculate trial status from firm's createdAt date
      const createdAt = new Date(firmData?.createdAt || new Date());
      const trialEndAt = new Date(createdAt);
      trialEndAt.setDate(trialEndAt.getDate() + TRIAL_DAYS);

      const now = new Date();
      const daysRemaining = Math.ceil((trialEndAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isTrialExpired = daysRemaining <= 0;

      setSubscription({
        status: isTrialExpired ? "TRIAL_EXPIRED" : "TRIAL_ACTIVE",
        trialStartAt: createdAt.toISOString(),
        trialEndAt: trialEndAt.toISOString(),
        daysRemaining: Math.max(0, daysRemaining),
        isTrialExpired,
        hasAccess: !isTrialExpired, // Block access if trial expired
      });
    } catch (err: any) {
      console.error("Error calculating subscription:", err);
      setError(err.message);
      // Default to trial active if we can't fetch (graceful degradation)
      setSubscription({
        status: "TRIAL_ACTIVE",
        trialStartAt: null,
        trialEndAt: null,
        daysRemaining: TRIAL_DAYS,
        isTrialExpired: false,
        hasAccess: true,
      });
    } finally {
      setLoading(false);
    }
  }, [profile, isWatergoAdmin]);

  // Calculate subscription when profile changes
  useEffect(() => {
    if (!authLoading && profile) {
      calculateSubscription();
    } else if (!authLoading && !profile) {
      setLoading(false);
    }
  }, [authLoading, profile, calculateSubscription]);

  const refreshSubscription = useCallback(async () => {
    await calculateSubscription();
  }, [calculateSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        error,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
